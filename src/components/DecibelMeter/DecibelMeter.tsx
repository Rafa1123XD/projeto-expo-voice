import { Text, View } from 'react-native';
import { styles } from './styles';

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



export default DecibelMeter; 