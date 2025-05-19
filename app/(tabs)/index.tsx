import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { DecibelMeter } from '../../src/components/DecibelMeter/DecibelMeter';
import { RecordButton } from '../../src/components/RecordButton/RecordButton';
import { useAudioRecorder } from '../../src/hooks/useAudioRecorder';

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const { 
    isRecording, 
    decibels, 
    peakDecibels, 
    startRecording, 
    stopRecording
  } = useAudioRecorder();

  return (
    <View style={styles.container}>
      <Text style={[
        styles.title,
        { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }
      ]}>
        Gravador de Voz
      </Text>
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
