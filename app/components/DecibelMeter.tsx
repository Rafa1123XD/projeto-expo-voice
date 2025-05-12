import { StyleSheet, Text, View } from 'react-native';

interface DecibelMeterProps {
  currentDecibels: number;
  peakDecibels: number;
}

export function DecibelMeter({ currentDecibels, peakDecibels }: DecibelMeterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.decibelText}>
        Nível de Som: {currentDecibels.toFixed(1)} dB
      </Text>
      <Text style={styles.decibelText}>
        Pico: {peakDecibels.toFixed(1)} dB
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  decibelText: {
    fontSize: 18,
    marginBottom: 10,
  },
}); 