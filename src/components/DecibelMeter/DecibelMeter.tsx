import { memo } from 'react';
import { Text, View, useColorScheme } from 'react-native';
import { getStyles } from './styles';

interface DecibelMeterProps {
  currentDecibels: number;
  peakDecibels: number;
  averageDecibels: number;
}

export const DecibelMeter = memo(function DecibelMeter({ 
  currentDecibels, 
  peakDecibels,
  averageDecibels 
}: DecibelMeterProps) {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);

  // cor baseada em nível 
  const getDecibelColor = (db: number) => {
    if (db < 50) return '#4CAF50'; // Verde para níveis seguros
    if (db < 70) return '#FFC107'; // Amarelo para níveis moderados
    if (db < 85) return '#FF9800'; // Laranja para níveis altos
    return '#F44336'; // Vermelho para níveis perigosos
  };

  // largura da barra
  const getProgressWidth = (db: number) => {
    const minDb = -20;
    const maxDb = 100;
    const normalizedDb = Math.max(minDb, Math.min(maxDb, db));
    return ((normalizedDb - minDb) / (maxDb - minDb)) * 100;
  };

  return (
    <View style={styles.container}>
      <View style={styles.meterContainer}>
        <Text style={styles.decibelText}>
          {currentDecibels.toFixed(1)} dB
        </Text>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar,
              { 
                width: `${getProgressWidth(currentDecibels)}%`,
                backgroundColor: getDecibelColor(currentDecibels)
              }
            ]} 
          />
        </View>
        <View style={styles.labelsContainer}>
          <Text style={styles.label}>-20</Text>
          <Text style={styles.label}>0</Text>
          <Text style={styles.label}>50</Text>
          <Text style={styles.label}>100</Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Pico:</Text>
          <Text style={[styles.statValue, { color: getDecibelColor(peakDecibels) }]}>
            {peakDecibels.toFixed(1)} dB
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Média:</Text>
          <Text style={[styles.statValue, { color: getDecibelColor(averageDecibels) }]}>
            {averageDecibels.toFixed(1)} dB
          </Text>
        </View>
      </View>
    </View>
  );
});

export default DecibelMeter; 