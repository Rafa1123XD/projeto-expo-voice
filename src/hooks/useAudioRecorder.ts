import { Audio } from 'expo-av';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

const MONITOR_INTERVAL = 100;
const MIN_DECIBELS = -160;

interface AudioRecorderState {
  isRecording: boolean;
  decibels: number;
  peakDecibels: number;
  error: string | null;
}

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    decibels: MIN_DECIBELS,
    peakDecibels: MIN_DECIBELS,
    error: null
  });
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const handleError = useCallback((error: Error, message: string) => {
    console.error(message, error);
    setState(prev => ({ ...prev, error: message }));
    Alert.alert('Erro', message);
  }, []);

  const cleanup = useCallback(async () => {
    try {
      if (sound?.unloadAsync) {
        await sound.unloadAsync();
      }
      if (recording?.stopAndUnloadAsync) {
        await recording.stopAndUnloadAsync();
      }
    } catch (error) {
      handleError(error as Error, 'Erro durante a limpeza dos recursos');
    }
  }, [sound, recording, handleError]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (state.decibels > state.peakDecibels) {
      setState(prev => ({ ...prev, peakDecibels: state.decibels }));
    }
  }, [state.decibels]);

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
            setState(prev => ({ ...prev, decibels: db }));
          }
        },
        MONITOR_INTERVAL
      );
      
      setRecording(recording);
      setState(prev => ({ ...prev, isRecording: true, error: null }));
    } catch (error) {
      handleError(error as Error, 'Não foi possível iniciar a gravação');
    }
  }, [handleError, cleanup]);

  const stopRecording = useCallback(async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setState(prev => ({ ...prev, isRecording: false, error: null }));
      setRecordedUri(uri);

      if (uri) {
        const { sound } = await Audio.Sound.createAsync({ uri });
        setSound(sound);
        await sound.playAsync();
      }
    } catch (error) {
      handleError(error as Error, 'Não foi possível parar a gravação');
    }
  }, [recording, handleError]);

  const recorderState = useMemo(() => ({
    ...state,
    startRecording,
    stopRecording,
  }), [state, startRecording, stopRecording]);

  return recorderState;
}

export default useAudioRecorder; 