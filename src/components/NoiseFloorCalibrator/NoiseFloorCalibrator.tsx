import Slider from '@react-native-community/slider';
import { memo } from 'react';
import { Text, View, useColorScheme } from 'react-native';
import { getStyles } from './styles';

interface NoiseFloorCalibratorProps {
  noiseFloor: number;
  onCalibrate: (value: number) => void;
}

export const NoiseFloorCalibrator = memo(function NoiseFloorCalibrator({
  noiseFloor,
  onCalibrate,
}: NoiseFloorCalibratorProps) {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calibração de Ruído</Text>
      <Text style={styles.subtitle}>
        Ajuste o nível mínimo de decibéis para ignorar ruídos
      </Text>
      <Text style={styles.value}>{noiseFloor.toFixed(1)} dB</Text>
      <Slider
        style={styles.slider}
        minimumValue={-160}
        maximumValue={-20}
        value={noiseFloor}
        onValueChange={onCalibrate}
        minimumTrackTintColor="#4CAF50"
        maximumTrackTintColor={colorScheme === 'dark' ? '#ffffff' : '#000000'}
      />
    </View>
  );
});

export default NoiseFloorCalibrator; 