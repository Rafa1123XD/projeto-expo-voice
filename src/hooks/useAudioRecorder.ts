import { auth, storage } from '@/firebaseConfig';
import { Audio } from 'expo-av';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  successMessage: string | null;
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
    noiseFloor: DEFAULT_NOISE_FLOOR,
    successMessage: null
  });
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [decibelHistory, setDecibelHistory] = useState<number[]>([]);
  const isStoppingRef = useRef(false); // Ref para controlar se stopRecording está em execução

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
    // Verificar se já estamos no processo de parada
    if (isStoppingRef.current) {
      console.warn('Aviso: stopRecording já em execução.');
      return;
    }

    // Iniciar o processo de parada
    isStoppingRef.current = true;
    
    if (!recording) {
        console.warn('Aviso: stopRecording chamado sem objeto de gravação.');
        isStoppingRef.current = false; // Resetar a ref se não houver gravação
        return;
    }

    const uri = recording.getURI(); // Obter a URI primeiro

    try {
      // Tentar parar e descarregar a gravação
      await recording.stopAndUnloadAsync();
    } catch (error) {
      // Ignorar o erro específico de descarregamento duplicado, mas logar
      if (error instanceof Error && error.message.includes('Cannot unload a Recording that has already been unloaded.')) {
        console.warn('Aviso: Tentativa de descarregar gravação já descarregada.', error.message);
        // Não retornar aqui, apenas avisar e continuar para o upload
      } else {
        // Se for outro erro durante a parada/descarregamento, tratar como erro
        handleError(error as Error, 'Erro ao parar a gravação');
        isStoppingRef.current = false; // Resetar a ref em caso de erro sério na parada
        return; // Sair se houver um erro sério ao parar
      }
    }

    // Limpar estados após a tentativa de parada (mesmo que com erro de descarregamento duplicado)
    setRecording(null); 
    setState(prev => ({ ...prev, isRecording: false, error: null }));
    setRecordedUri(uri); 

    // Proceder com o upload e logs de sucesso
    if (uri && auth.currentUser) {
      try {
        const filename = `recording-${Date.now()}.m4a`;
        const storageRef = ref(storage, `recordings/${auth.currentUser.uid}/${filename}`);
        const response = await fetch(uri);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);

        const now = new Date();
        console.log(`[${now.toLocaleTimeString()}] Gravação enviada para o Firebase Storage!`);
        const downloadUrl = await getDownloadURL(storageRef);
        console.log(`[${now.toLocaleTimeString()}] URL de download:`, downloadUrl);

        // Exibir mensagem de sucesso para o usuário
        setState(prev => ({ ...prev, successMessage: 'Gravação salva!' }));
        setTimeout(() => {
          setState(prev => ({ ...prev, successMessage: null }));
        }, 3000);

      } catch (uploadError) {
        handleError(uploadError as Error, 'Erro durante o upload da gravação');
      }
    } else if (!auth.currentUser) {
      handleError(new Error('Usuário não autenticado'), 'Não foi possível salvar a gravação. Faça login novamente.');
    }

    // Finalizar o processo de parada
    isStoppingRef.current = false;

  }, [recording, state.isRecording, handleError]);

  const recorderState = useMemo(() => ({
    ...state,
    startRecording,
    stopRecording,
    calibrateNoiseFloor,
    successMessage: state.successMessage,
  }), [state, startRecording, stopRecording, calibrateNoiseFloor]);

  return recorderState;
}

export default useAudioRecorder; 