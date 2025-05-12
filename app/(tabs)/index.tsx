import { StyleSheet, Text, View } from 'react-native';
import { DecibelMeter } from '../components/DecibelMeter';
import { RecordButton } from '../components/RecordButton';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

export default function TabOneScreen() {
  const { isRecording, decibels, peakDecibels, startRecording, stopRecording } = useAudioRecorder();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gravador de Voz</Text>
      <DecibelMeter
        currentDecibels={decibels}
        peakDecibels={peakDecibels}
      />
      <RecordButton
        isRecording={isRecording}
        onPress={isRecording ? stopRecording : startRecording}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
