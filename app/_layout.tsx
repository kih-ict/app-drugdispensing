import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '../hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync(); 
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>

        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="storage/sub_storage_list" options={{ headerShown: false }} />
        <Stack.Screen name="verifikasi_obat/scan_obat" options={{ headerShown: false }} />
        <Stack.Screen name="history/detail" options={{ headerShown: false }} />
        <Stack.Screen name="scanner" options={{ headerShown: false }} />
        <Stack.Screen name="login/login" options={{ headerShown: false }} />
        <Stack.Screen name="verifikasi/listobat" options={{ headerShown: false }} />
        <Stack.Screen name="verifikasi/loading" options={{ headerShown: false }} />
        <Stack.Screen name="verifikasi/complate" options={{ headerShown: false }} />
        <Stack.Screen name="userlist" options={{ headerShown: false }} />
        <Stack.Screen name="storage/storage_list" options={{ headerShown: false }} />
        <Stack.Screen name="verifikasi/scanner" options={{ headerShown: false }} />
        <Stack.Screen name="history" options={{ headerShown: false }} />
        <Stack.Screen name="editloket/[drugid]" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="item" options={{ headerShown: false }} />
        <Stack.Screen name="history/stockcheck" options={{ headerShown: false }} />
        <Stack.Screen name="history/updatestock" options={{ headerShown: false }} />
        <Stack.Screen name="history/scancheck" options={{ headerShown: false }} />
        <Stack.Screen name="history/stockgudang" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
