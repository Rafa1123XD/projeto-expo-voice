import { auth, storage } from '@/firebaseConfig';
import { Audio } from 'expo-av';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

const MONITOR_INTERVAL = 100;
const MIN_DECIBELS = -160;
const DEFAULT_NOISE_FLOOR = -60; // noisefloor padrão 
const AVERAGE_WINDOW_SIZE = 10; // quantidade da media

interface AudioRecorderState {
  isRecording: boolean;
  decibels: number;
  peakDecibels: number;
  averageDecibels: number;
  error: string | null;
  noiseFloor: number; 
}


const simpleThrottle = <T extends (...args: any[]) => any>(func: T, delay: number) => {
  let lastCallTime = 0;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCallTime >= delay) {
      lastCallTime = now;
      func.apply(this, args);
    }
  };
};

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    decibels: MIN_DECIBELS,
    peakDecibels: MIN_DECIBELS,
    averageDecibels: MIN_DECIBELS,
    error: null,
    noiseFloor: DEFAULT_NOISE_FLOOR
  });
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [decibelHistory, setDecibelHistory] = useState<number[]>([]);

  const throttledSetDecibels = useMemo(() => simpleThrottle((db: number) => {
    setState(prev => ({ ...prev, decibels: db }));
  }, 100), [setState]);

  const handleError = useCallback((error: Error, message: string) => {
    console.error(message, error);
    setState(prev => ({ ...prev, error: message }));
    Alert.alert('Erro', message);
  }, []);

  const calibrateNoiseFloor = useCallback((newNoiseFloor: number) => {
    setState(prev => ({ ...prev, noiseFloor: newNoiseFloor }));
  }, []);

  const cleanup = useCallback(async () => {
    try {
      if (sound?.unloadAsync) {
        await sound.unloadAsync();
        setSound(null);
      }
      if (recording?.stopAndUnloadAsync) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }
    } catch (error) {
      if (error instanceof Error && 
          error.message.includes('already been unloaded')) {
        return;
      }
      handleError(error as Error, 'Erro durante a limpeza dos recursos');
    }
  }, [sound, recording, handleError]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (state.decibels > state.noiseFloor) {
      if (state.decibels > state.peakDecibels) {
        setState(prev => ({ ...prev, peakDecibels: state.decibels }));
      }

      setDecibelHistory(prev => {
        const newHistory = [...prev, state.decibels].slice(-AVERAGE_WINDOW_SIZE);
        const average = newHistory.reduce((sum, db) => sum + db, 0) / newHistory.length;
        setState(prevState => ({ ...prevState, averageDecibels: average }));
        return newHistory;
      });
    }
  }, [state.decibels, state.noiseFloor]);

  const startRecording = useCallback(async () => {
    try {
      await cleanup();
      
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        handleError(new Error('Permissão negada'), 'Precisamos de permissão para acessar o microfone');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording) {
            const db = status.metering ?? MIN_DECIBELS;
            if (db > state.noiseFloor) {
              throttledSetDecibels(db);
            } else {
              throttledSetDecibels(MIN_DECIBELS);
            }
          }
        },
        MONITOR_INTERVAL
      );
      
      setRecording(recording);
      setState(prev => ({ 
        ...prev, 
        isRecording: true, 
        error: null,
        decibels: MIN_DECIBELS,
        peakDecibels: MIN_DECIBELS,
        averageDecibels: MIN_DECIBELS
      }));
      setDecibelHistory([]);
    } catch (error) {
      handleError(error as Error, 'Não foi possível iniciar a gravação');
    }
  }, [handleError, cleanup, state.noiseFloor, throttledSetDecibels]); 

  const stopRecording = useCallback(async () => {
    if (!recording) return;

    try {
      const uri = recording.getURI();
      await recording.stopAndUnloadAsync();
      setRecording(null);
      setState(prev => ({ ...prev, isRecording: false, error: null }));
      setRecordedUri(uri);

      if (uri && auth.currentUser) {
        const filename = `recording-${Date.now()}.m4a`;
        const storageRef = ref(storage, `recordings/${auth.currentUser.uid}/${filename}`);
        const response = await fetch(uri);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);

        console.log('Gravação enviada para o Firebase Storage!');

        const downloadUrl = await getDownloadURL(storageRef);
        console.log('URL de download:', downloadUrl);

      } else if (!auth.currentUser) {
        handleError(new Error('Usuário não autenticado'), 'Não foi possível salvar a gravação. Faça login novamente.');
      }
    } catch (error) {
      handleError(error as Error, 'Não foi possível parar a gravação ou fazer upload');
    }
  }, [recording, handleError]);

  const recorderState = useMemo(() => ({
    ...state,
    startRecording,
    stopRecording,
    calibrateNoiseFloor,
  }), [state, startRecording, stopRecording, calibrateNoiseFloor]);

  return recorderState;
}

export default useAudioRecorder; 