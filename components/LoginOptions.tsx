import { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, fonts } from '../theme';
import { Button } from './Button';
import { useAuth } from '../context/AuthContext';

// The same list of sign-in methods on the start screen and on 마이 > 로그인 / 회원가입.
// Apple needs Sign in with Apple, which needs a paid Apple Developer account (not bought
// yet — 안드로이드 먼저 출시) and its own EAS build, so it stays a placeholder for now.
// The 카카오 and Google buttons follow each company's sign-in button rules (colors, symbol,
// label wording) — the same look as the web deletion page in scripts/site.ts. All login
// buttons share 카카오's 12pt corner radius, the app font and the "… 로그인" wording.
const notYet = (provider: string) =>
  Alert.alert(`${provider} 로그인은 준비 중이에요`, '지금은 이메일로 가입하거나 로그인할 수 있어요.', [
    { text: '닫기', style: 'cancel' },
    { text: '이메일 로그인', onPress: () => router.push('/auth/email') },
  ]);

export function LoginOptions() {
  const { signInWithProvider } = useAuth();
  const [loading, setLoading] = useState<'kakao' | 'google' | null>(null);

  const withProvider = async (provider: 'kakao' | 'google') => {
    setLoading(provider);
    try {
      const { error } = await signInWithProvider(provider);
      if (error) Alert.alert('로그인할 수 없어요', error);
      else router.replace('/(tabs)');
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.wrap}>
      <Button
        variant="outline"
        label="카카오 로그인"
        onPress={() => withProvider('kakao')}
        style={[styles.login, styles.kakao]}
        labelStyle={styles.kakaoLabel}
        icon={
          loading === 'kakao' ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M12 3C6.9 3 3 6.4 3 10.6c0 2.7 1.7 5 4.3 6.4l-1 3.7c-.1.4.3.7.6.5l4.3-2.7c.3 0 .5.1.8.1 5.1 0 9-3.4 9-7.6S17.1 3 12 3z"
                fill="#000000"
              />
            </Svg>
          )
        }
      />
      <Button
        variant="outline"
        label="Google 로그인"
        onPress={() => withProvider('google')}
        style={[styles.login, styles.google]}
        labelStyle={styles.googleLabel}
        icon={
          loading === 'google' ? (
            <ActivityIndicator size="small" color="#1F1F1F" />
          ) : (
            <Svg width={18} height={18} viewBox="0 0 48 48">
              <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </Svg>
          )
        }
      />
      {/* Apple 로그인은 iOS 출시 때 붙인다(안드로이드 먼저 출시). */}
      {Platform.OS === 'ios' && (
        <Button
          variant="outline"
          label="Apple 로그인"
          onPress={() => notYet('Apple')}
          style={styles.login}
          icon={
            <Svg width={17} height={17} viewBox="0 0 24 24">
              <Path
                d="M16.5 1.5c.1 1.2-.4 2.4-1.1 3.2-.7.9-1.9 1.6-3 1.5-.1-1.2.4-2.4 1.1-3.2.7-.9 2-1.6 3-1.5zm4.1 16.3c-.4 1-.9 1.9-1.6 2.8-1 1.3-2 2.6-3.5 2.7-1.5 0-1.9-.9-3.6-.9s-2.2.9-3.6.9c-1.5.1-2.6-1.4-3.6-2.7-2-2.8-3.5-8-1.4-11.5.9-1.7 2.6-2.8 4.4-2.8 1.4 0 2.3.9 3.5.9 1.1 0 1.9-.9 3.6-.9 1.5 0 3.1.8 4.1 2.2-3.6 2-3 7.3 1.7 9.3z"
                fill="#1a1a1a"
              />
            </Svg>
          }
        />
      )}

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button label="이메일 로그인" onPress={() => router.push('/auth/email')} style={styles.login} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  login: { borderRadius: 12 },
  // 카카오: #FEE500 container, black symbol, 85% black label. Google: white fill, #747775 stroke, #1F1F1F label.
  kakao: { backgroundColor: '#FEE500', borderColor: '#FEE500' },
  kakaoLabel: { color: 'rgba(0,0,0,0.85)' },
  google: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#747775' },
  googleLabel: { color: '#1F1F1F' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerText: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
});
