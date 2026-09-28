import { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { colors, radius, spacing, fonts } from '../../theme';
import { Button } from '../../components/Button';
import { Mascot } from '../../components/Mascot';
import { useAuth } from '../../context/AuthContext';

const MIN_PASSWORD_LENGTH = 8;

// Reached only via the deep link from a password-reset email (see app/_layout.tsx's
// handleRecoveryUrl); `inRecovery` is false for anyone who opens this route directly.
export default function ResetPasswordScreen() {
  const { inRecovery, setNewPassword, busy } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  if (!inRecovery) return <Redirect href="/welcome" />;

  const submit = async () => {
    if (password.length < MIN_PASSWORD_LENGTH) return Alert.alert('비밀번호는 8자 이상이어야 해요');
    if (password !== confirm) return Alert.alert('두 비밀번호가 서로 달라요');
    const { error } = await setNewPassword(password);
    if (error) return Alert.alert('바꿀 수 없어요', error);
    Alert.alert('비밀번호를 바꿨어요', '새 비밀번호로 다시 로그인해주세요.', [
      { text: '확인', onPress: () => router.replace('/auth/email') },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.hintCard}>
        <Mascot pose="front" width={52} />
        <Text style={styles.hintText}>새 비밀번호를 정해주세요</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="새 비밀번호 (8자 이상)"
          placeholderTextColor={colors.inkFaint}
          autoCapitalize="none"
          secureTextEntry
          style={styles.fieldBox}
        />
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder="새 비밀번호 확인"
          placeholderTextColor={colors.inkFaint}
          autoCapitalize="none"
          secureTextEntry
          style={styles.fieldBox}
        />
      </View>

      <View style={styles.footer}>{busy ? <ActivityIndicator color={colors.red} /> : <Button label="비밀번호 바꾸기" onPress={submit} />}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.amberSoft,
    marginHorizontal: spacing.xl,
    marginTop: 20,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  hintText: { fontFamily: fonts.body, fontSize: 13.5, color: colors.ink, flexShrink: 1 },
  form: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.md, flex: 1 },
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
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl },
});
