import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { NoiseFloorCalibrator } from '../../src/components/NoiseFloorCalibrator/NoiseFloorCalibrator';
import { useAudioRecorder } from '../../src/hooks/useAudioRecorder';

export default function ConfiguracoesScreen() {
  const { noiseFloor, calibrateNoiseFloor } = useAudioRecorder();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="gearshape.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Configurações</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <NoiseFloorCalibrator
          noiseFloor={noiseFloor}
          onCalibrate={calibrateNoiseFloor}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  section: {
    padding: 16,
  },
});
