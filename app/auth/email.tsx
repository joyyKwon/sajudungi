import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, radius, spacing, fonts } from '../../theme';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { goBackOrHome } from '../../lib/navigation';
import { useAuth } from '../../context/AuthContext';

const MIN_PASSWORD_LENGTH = 8;

export default function EmailAuthScreen() {
  const { signInWithEmail, signUpWithEmail, hasProfileAfterLogin, busy } = useAuth();
  // After signing in, an account with nothing saved yet goes straight to entering 내 정보.
  const goOn = async () => router.replace((await hasProfileAfterLogin()) ? '/(tabs)' : '/info-input');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) return Alert.alert('이메일을 확인해주세요');
    if (password.length < MIN_PASSWORD_LENGTH) return Alert.alert('비밀번호는 8자 이상이어야 해요');

    if (mode === 'signin') {
      const { error } = await signInWithEmail(trimmed, password);
      if (error) return Alert.alert('로그인할 수 없어요', translateError(error));
      await goOn();
    } else {
      const { error, needsEmailConfirmation } = await signUpWithEmail(trimmed, password);
      if (error) return Alert.alert('가입할 수 없어요', translateError(error));
      if (needsEmailConfirmation) {
        Alert.alert('이메일을 확인해주세요', `${trimmed}로 확인 메일을 보냈어요. 메일의 링크를 눌러야 가입이 완료돼요.`, [
          { text: '확인', onPress: () => goBackOrHome() },
        ]);
      } else {
        await goOn();
      }
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.topbar}>
        <Pressable onPress={() => goBackOrHome()} hitSlop={12}>
          <Icon name="back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.topbarTitle}>{mode === 'signin' ? '로그인' : '이메일로 가입하기'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.seg}>
          <Pressable style={[styles.segItem, mode === 'signin' && styles.segItemActive]} onPress={() => setMode('signin')}>
            <Text style={[styles.segText, mode === 'signin' && styles.segTextActive]}>로그인</Text>
          </Pressable>
          <Pressable style={[styles.segItem, mode === 'signup' && styles.segItemActive]} onPress={() => setMode('signup')}>
            <Text style={[styles.segText, mode === 'signup' && styles.segTextActive]}>회원가입</Text>
          </Pressable>
        </View>

        <Field label="이메일">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.inkFaint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.fieldBox}
          />
        </Field>

        <Field label="비밀번호">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="8자 이상"
            placeholderTextColor={colors.inkFaint}
            autoCapitalize="none"
            secureTextEntry
            style={styles.fieldBox}
          />
        </Field>

        {mode === 'signin' && (
          <Pressable onPress={() => router.push('/auth/forgot-password')} hitSlop={8}>
            <Text style={styles.link}>비밀번호를 잊으셨나요?</Text>
          </Pressable>
        )}

        {mode === 'signup' && (
          <Text style={styles.fieldHint}>
            가입하면{' '}
            <Text style={styles.link} onPress={() => router.push('/legal/terms')}>
              이용약관
            </Text>
            과{' '}
            <Text style={styles.link} onPress={() => router.push('/legal/privacy')}>
              개인정보처리방침
            </Text>
            에 동의하는 것으로 볼게요.
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {busy ? <ActivityIndicator color={colors.red} /> : <Button label={mode === 'signin' ? '로그인' : '가입하기'} onPress={submit} />}
      </View>
    </SafeAreaView>
  );
}

/** Supabase's messages are English; only the few a user can actually hit here are translated. */
function translateError(message: string): string {
  const known: Record<string, string> = {
    'Invalid login credentials': '이메일이나 비밀번호가 맞지 않아요.',
    'User already registered': '이미 가입된 이메일이에요. 로그인해주세요.',
    'Email not confirmed': '이메일 확인이 아직 안 됐어요. 메일함을 확인해주세요.',
    'Password should be at least 6 characters': '비밀번호는 8자 이상이어야 해요.',
    'Email signups are disabled': '지금은 이메일 가입을 받지 않고 있어요. 잠시 후 다시 시도해주세요.',
    'Signups not allowed for this instance': '지금은 새로 가입할 수 없어요. 잠시 후 다시 시도해주세요.',
  };
  return known[message] ?? message;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: spacing.xl, paddingTop: 20, paddingBottom: 8 },
  topbarTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  form: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xl },
  seg: { flexDirection: 'row', backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, padding: 4 },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  segItemActive: { backgroundColor: colors.red },
  segText: { fontFamily: fonts.body, fontSize: 14, fontWeight: '700', color: colors.inkSoft },
  segTextActive: { color: colors.white },
  fieldLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, fontWeight: '700', marginBottom: spacing.sm },
  fieldBox: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.ink,
  },
  fieldHint: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, lineHeight: 18 },
  link: { color: colors.red, textDecorationLine: 'underline', fontFamily: fonts.body, fontSize: 12.5 },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl },
});
