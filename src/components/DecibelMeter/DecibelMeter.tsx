import { memo } from 'react';
import { Text, View, useColorScheme } from 'react-native';
import { getStyles } from './styles';

interface DecibelMeterProps {
  currentDecibels: number;
  peakDecibels: number;
}

export const DecibelMeter = memo(function DecibelMeter({ 
  currentDecibels, 
  peakDecibels 
}: DecibelMeterProps) {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);

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
});

export default DecibelMeter; 