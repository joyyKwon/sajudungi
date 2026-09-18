import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { GowunBatang_400Regular, GowunBatang_700Bold } from '@expo-google-fonts/gowun-batang';
import { GowunDodum_400Regular } from '@expo-google-fonts/gowun-dodum';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    GowunBatang_400Regular,
    GowunBatang_700Bold,
    GowunDodum_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="saju-result" options={{ presentation: 'card' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
