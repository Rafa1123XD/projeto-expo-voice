import { auth } from '@/firebaseConfig';
import { Audio } from 'expo-av';
import { getDownloadURL, getStorage, listAll, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Recording {
  name: string;
  url: string;
}

export default function RecordingsScreen() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingSound, setPlayingSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const fetchRecordings = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      const userId = auth.currentUser.uid;
      const storage = getStorage();
      const listRef = ref(storage, `recordings/${userId}`);

      try {
        const res = await listAll(listRef);
        const urls = await Promise.all(res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url };
        }));
        setRecordings(urls);
      } catch (error) {
        console.error('Erro ao listar gravações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();

    // Limpar o som ao sair da tela
    return () => {
      if (playingSound) {
        playingSound.unloadAsync();
      }
    };

  }, [playingSound]);

  const playRecording = async (uri: string) => {
    if (playingSound) {
      await playingSound.unloadAsync();
      setPlayingSound(null);
    }
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setPlayingSound(sound);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          setPlayingSound(null);
        }
      });
    } catch (error) {
      console.error('Erro ao reproduzir gravação:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Carregando gravações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Gravações</Text>
      {
        recordings.length === 0 ? (
          <Text>Nenhuma gravação encontrada.</Text>
        ) : (
          <FlatList
            data={recordings}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => playRecording(item.url)} style={styles.recordingItem}>
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )
      }
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
  recordingItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
}); 