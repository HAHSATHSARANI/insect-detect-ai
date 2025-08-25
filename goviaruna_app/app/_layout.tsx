import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '@/i18n';

import { useColorScheme } from '@/hooks/useColorScheme';
import { I18nProvider } from '@/components/I18nProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'AbhayaLibre-Regular': require('../assets/fonts/AbhayaLibre-Regular.ttf'),
    'AbhayaLibre-Medium': require('../assets/fonts/AbhayaLibre-Medium.ttf'),
    'AbhayaLibre-SemiBold': require('../assets/fonts/AbhayaLibre-SemiBold.ttf'),
    'AbhayaLibre-Bold': require('../assets/fonts/AbhayaLibre-Bold.ttf'),
    'AbhayaLibre-ExtraBold': require('../assets/fonts/AbhayaLibre-ExtraBold.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <I18nProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="language" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen name="auth/verify" options={{ headerShown: false }} />
          <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />
          <Stack.Screen name="auth/reset-password-2" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="insect-details" options={{ headerShown: false }} />
          <Stack.Screen name="camera" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </I18nProvider>
  );
}
