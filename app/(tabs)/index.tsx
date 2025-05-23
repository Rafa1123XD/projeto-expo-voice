import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
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
    averageDecibels,
    startRecording, 
    stopRecording,
    successMessage
  } = useAudioRecorder();

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (isRecording) {
          stopRecording();
        }
      };
    }, [isRecording, stopRecording])
  );

  return (
    <View style={styles.container}>
      <Text style={[
        styles.title,
        { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }
      ]}>
        Gravador de Voz
      </Text>

      {successMessage && (
        <Text style={styles.successMessage}>{successMessage}</Text>
      )}

      <DecibelMeter
        currentDecibels={decibels}
        peakDecibels={peakDecibels}
        averageDecibels={averageDecibels}
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
  successMessage: {
    color: 'green',
    marginTop: 10,
    fontSize: 16,
  },
});
