import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

const MONITOR_INTERVAL = 100;

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [decibels, setDecibels] = useState(-160);
  const [peakDecibels, setPeakDecibels] = useState(-160);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [sound, recording]);

  useEffect(() => {
    if (decibels > peakDecibels) {
      setPeakDecibels(decibels);
    }
  }, [decibels]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar o microfone');
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
            const db = status.metering ? status.metering : -160;
            setDecibels(db);
          }
        },
        MONITOR_INTERVAL
      );
      setRecording(recording);
      setIsRecording(true);

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      setRecordedUri(uri);

      if (uri) {
        const { sound } = await Audio.Sound.createAsync({ uri });
        setSound(sound);
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
      Alert.alert('Erro', 'Não foi possível parar a gravação');
    }
  };

  return {
    isRecording,
    decibels,
    peakDecibels,
    startRecording,
    stopRecording,
  };
} 