import { Audio } from 'expo-av';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

const MONITOR_INTERVAL = 100;
const MIN_DECIBELS = -160;
const DEFAULT_NOISE_FLOOR = -60; // Nível padrão para filtrar ruídos
const AVERAGE_WINDOW_SIZE = 10; // Número de amostras para calcular a média

interface AudioRecorderState {
  isRecording: boolean;
  decibels: number;
  peakDecibels: number;
  averageDecibels: number; // Nova propriedade para a média
  error: string | null;
  noiseFloor: number; // Nível mínimo de decibéis para considerar
}

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    decibels: MIN_DECIBELS,
    peakDecibels: MIN_DECIBELS,
    averageDecibels: MIN_DECIBELS, // Inicializa a média
    error: null,
    noiseFloor: DEFAULT_NOISE_FLOOR
  });
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [decibelHistory, setDecibelHistory] = useState<number[]>([]); // Histórico para cálculo da média

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
      // Ignora erros de recursos já descarregados
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
      // Atualiza o pico
      if (state.decibels > state.peakDecibels) {
        setState(prev => ({ ...prev, peakDecibels: state.decibels }));
      }

      // Atualiza o histórico e calcula a média
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
            // Só atualiza o estado se o nível de decibéis for maior que o noiseFloor
            if (db > state.noiseFloor) {
              setState(prev => ({ ...prev, decibels: db }));
            } else {
              setState(prev => ({ ...prev, decibels: MIN_DECIBELS }));
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
      setDecibelHistory([]); // Limpa o histórico ao iniciar nova gravação
    } catch (error) {
      handleError(error as Error, 'Não foi possível iniciar a gravação');
    }
  }, [handleError, cleanup, state.noiseFloor]);

  const stopRecording = useCallback(async () => {
    if (!recording) return;

    try {
      const uri = recording.getURI();
      await recording.stopAndUnloadAsync();
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
    calibrateNoiseFloor,
  }), [state, startRecording, stopRecording, calibrateNoiseFloor]);

  return recorderState;
}

export default useAudioRecorder; 