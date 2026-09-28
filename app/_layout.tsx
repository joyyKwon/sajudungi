import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useFonts } from 'expo-font';
import { GowunBatang_400Regular, GowunBatang_700Bold } from '@expo-google-fonts/gowun-batang';
import { GowunDodum_400Regular } from '@expo-google-fonts/gowun-dodum';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { ProfileProvider, useProfile } from '../context/ProfileContext';
import { ProgressProvider, useProgress } from '../context/ProgressContext';
import { ContentProvider, useContent } from '../context/ContentContext';
import { AuthProvider, useAuth } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <ProgressProvider>
          {/* Needs useProfile/useProgress (people/progress sync), so it nests inside both. */}
          <AuthProvider>
            <ContentProvider>
              <AppShell />
            </ContentProvider>
          </AuthProvider>
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
  const { handleRecoveryUrl, completeOAuthRedirect } = useAuth();
  const ready = fontsLoaded && profileReady && progressReady && contentReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // 비밀번호 재설정 메일 링크(sajudungi://auth/reset-password#access_token=…&type=recovery)를
  // 열었을 때: 토큰으로 복구 세션을 만들고 새 비밀번호 입력 화면으로 보낸다.
  // 카카오/구글 로그인은 보통 WebBrowser.openAuthSessionAsync가 리다이렉트를 직접 가로채지만,
  // 일부 안드로이드 환경에서는 OS가 sajudungi://auth/callback 링크를 앱에 그대로 넘길 수 있어 여기서도 처리한다.
  useEffect(() => {
    const openUrl = async (url: string | null) => {
      if (!url) return;
      if (await handleRecoveryUrl(url)) return router.replace('/auth/reset-password');
      if (url.includes('/auth/callback') && (await completeOAuthRedirect(url))) router.replace('/(tabs)');
    };
    Linking.getInitialURL().then(openUrl);
    const sub = Linking.addEventListener('url', ({ url }) => openUrl(url));
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="saju-result" options={{ presentation: 'card' }} />
    </Stack>
  );
}
