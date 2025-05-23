import { auth } from '@/firebaseConfig';
import { Audio } from 'expo-av';
import { deleteObject, getDownloadURL, getStorage, listAll, ref } from 'firebase/storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RecordingItem } from '../../src/components/RecordingItem/RecordingItem';

interface Recording {
  name: string;
  url: string;
}

export default function RecordingsScreen() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingSound, setPlayingSound] = useState<Audio.Sound | null>(null);
  const [currentPlayingUri, setCurrentPlayingUri] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  const fetchRecordings = useCallback(async () => {
    if (!auth.currentUser) {
      setRecordings([]);
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
      setRecordings(urls.sort((a, b) => b.name.localeCompare(a.name)));
    } catch (error) {
      console.error('Erro ao listar gravações:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas gravações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecordings();

    return () => {
      if (playingSound) {
        playingSound.unloadAsync();
        setPlayingSound(null);
        setCurrentPlayingUri(null);
      }
    };
  }, [fetchRecordings, playingSound]);

  const playRecording = async (uri: string) => {
    if (playingSound && currentPlayingUri === uri) {
      await playingSound.pauseAsync();
      setCurrentPlayingUri(null);
      return;
    }

    if (playingSound) {
      await playingSound.unloadAsync();
      setPlayingSound(null);
      setCurrentPlayingUri(null);
    }

    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setPlayingSound(sound);
      setCurrentPlayingUri(uri);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          setPlayingSound(null);
          setCurrentPlayingUri(null);
        }
      });
    } catch (error) {
      console.error('Erro ao reproduzir gravação:', error);
      Alert.alert('Erro', 'Não foi possível reproduzir a gravação.');
      setCurrentPlayingUri(null);
    }
  };

  const deleteRecording = async (name: string) => {
    if (!auth.currentUser) {
      Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a gravação "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', onPress: async () => {
            if (!auth.currentUser) {
              Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
              return;
            }
            const userId = auth.currentUser.uid;
            const storage = getStorage();
            const fileRef = ref(storage, `recordings/${userId}/${name}`);

            try {
              if (currentPlayingUri && currentPlayingUri.includes(name)) {
                if (playingSound) {
                  await playingSound.unloadAsync();
                  setPlayingSound(null);
                  setCurrentPlayingUri(null);
                }
              }

              await deleteObject(fileRef);
              Alert.alert('Sucesso', 'Gravação excluída com sucesso!');
              setRecordings(prevRecordings => prevRecordings.filter(rec => rec.name !== name));
            } catch (error) {
              console.error('Erro ao excluir gravação:', error);
              Alert.alert('Erro', 'Não foi possível excluir a gravação.');
            }
          }
        }
      ]
    );
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#f0f0f0',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: colorScheme === 'dark' ? '#ffffff' : '#000000',
    },
    listContentContainer: {
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    noRecordingsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    noRecordingsText: {
      fontSize: 18,
      textAlign: 'center',
      color: colorScheme === 'dark' ? '#aaaaaa' : '#555555',
    },
  }), [colorScheme]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: colorScheme === 'dark' ? '#ffffff' : '#000000' }}>Carregando gravações...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Minhas Gravações</Text>
      {
        recordings.length === 0 ? (
          <View style={styles.noRecordingsContainer}>
            <Text style={styles.noRecordingsText}>Nenhuma gravação encontrada.</Text>
          </View>
        ) : (
          <FlatList
            data={recordings}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <RecordingItem
                recording={item}
                onPlay={playRecording}
                onDelete={deleteRecording}
                isPlaying={currentPlayingUri === item.url}
              />
            )}
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContentContainer}
          />
        )
      }
    </SafeAreaView>
  );
} 