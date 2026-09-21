import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { GowunBatang_400Regular, GowunBatang_700Bold } from '@expo-google-fonts/gowun-batang';
import { GowunDodum_400Regular } from '@expo-google-fonts/gowun-dodum';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { ProfileProvider, useProfile } from '../context/ProfileContext';
import { ProgressProvider, useProgress } from '../context/ProgressContext';
import { ContentProvider, useContent } from '../context/ContentContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <ProgressProvider>
          <ContentProvider>
            <AppShell />
          </ContentProvider>
        </ProgressProvider>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}

// Keeps the splash screen up until fonts and saved data are loaded, so route
// guards never see a half-loaded state.
function AppShell() {
  const [fontsLoaded] = useFonts({ GowunBatang_400Regular, GowunBatang_700Bold, GowunDodum_400Regular });
  const { ready: profileReady } = useProfile();
  const { ready: progressReady } = useProgress();
  const { ready: contentReady } = useContent();
  const ready = fontsLoaded && profileReady && progressReady && contentReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="saju-result" options={{ presentation: 'card' }} />
    </Stack>
  );
}
