import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { auth } from '@/firebaseConfig';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { Text, TouchableOpacity } from 'react-native';
import { NoiseFloorCalibrator } from '../../src/components/NoiseFloorCalibrator/NoiseFloorCalibrator';
import { useAudioRecorder } from '../../src/hooks/useAudioRecorder';

export default function ConfiguracoesScreen() {
  const { noiseFloor, calibrateNoiseFloor } = useAudioRecorder();

  getAuth().onAuthStateChanged((user) => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  });


  return (

    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#808080"
          name="gearshape.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Configurações</ThemedText>
      </ThemedView>

      <ThemedView style={styles.calibratorContainer}>
        <NoiseFloorCalibrator
          noiseFloor={noiseFloor}
          onCalibrate={calibrateNoiseFloor}
        />
      </ThemedView>

      <ThemedView style={styles.logoutButtonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => auth.signOut()}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  section: {
    padding: 16,
  },
  calibratorContainer: {
    paddingVertical: 10,
    width: '100%',
    alignSelf: 'center',
  },
  logoutButtonContainer: {
    marginTop: 30,
  },
  logoutButton: {
    width: '100%',
    padding: 15,
    backgroundColor: '#FF3B30',
    borderRadius: 0,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
