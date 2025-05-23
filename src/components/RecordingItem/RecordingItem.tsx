import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

interface RecordingItemProps {
  recording: { name: string; url: string; };
  onPlay: (url: string) => void;
  onDelete: (name: string) => void;
  isPlaying: boolean;
}

export const RecordingItem: React.FC<RecordingItemProps> = ({ 
  recording, 
  onPlay, 
  onDelete,
  isPlaying
}) => {
  const colorScheme = useColorScheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
      padding: 15,
      marginVertical: 5,
      borderRadius: 8,
      shadowColor: colorScheme === 'dark' ? '#fff' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    name: {
      flex: 1,
      marginRight: 10,
      fontSize: 16,
      color: colorScheme === 'dark' ? '#fff' : '#000',
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    button: {
      padding: 5,
    },
  }), [colorScheme]);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{recording.name}</Text>
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => onPlay(recording.url)} style={styles.button}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={24} color={colorScheme === 'dark' ? '#0094FF' : '#007AFF'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(recording.name)} style={[styles.button, { marginLeft: 10 }]}>
          <Ionicons name="trash" size={24} color={colorScheme === 'dark' ? '#FF6347' : '#FF3B30'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}; 