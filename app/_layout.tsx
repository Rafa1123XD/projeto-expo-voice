import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { useAuthentication } from '../src/hooks/useAuthentication';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { user, loading } = useAuthentication();

  useEffect(() => {
    if (!loaded || loading) return;

    if (user) {
      // Usuário autenticado, redirecionar para as abas
      router.replace('/(tabs)');
    } else {
      // Usuário não autenticado, redirecionar para a tela de autenticação
      router.replace('/(auth)/login');
    }
  }, [user, loaded, loading]);

  if (!loaded || loading) {
    // Pode renderizar uma tela de loading enquanto verifica a autenticação e carrega fontes
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
