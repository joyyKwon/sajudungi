import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, fonts } from '../../theme';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { goBackOrHome } from '../../lib/navigation';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordScreen() {
  const { requestPasswordReset, busy } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) return Alert.alert('이메일을 확인해주세요');
    const { error } = await requestPasswordReset(trimmed);
    if (error) return Alert.alert('메일을 보낼 수 없어요', error);
    setSent(true);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.topbar}>
        <Pressable onPress={() => goBackOrHome()} hitSlop={12}>
          <Icon name="back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.topbarTitle}>비밀번호 재설정</Text>
      </View>

      <View style={styles.form}>
        {sent ? (
          <Text style={styles.body}>{email.trim()}로 재설정 링크를 보냈어요. 메일의 링크를 누르면 새 비밀번호를 정할 수 있어요.</Text>
        ) : (
          <>
            <Text style={styles.body}>가입할 때 쓴 이메일을 입력해주세요. 비밀번호를 다시 정할 수 있는 링크를 보내드려요.</Text>
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
          </>
        )}
      </View>

      <View style={styles.footer}>
        {busy ? (
          <ActivityIndicator color={colors.red} />
        ) : (
          <Button label={sent ? '다시 보내기' : '재설정 메일 보내기'} onPress={submit} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: spacing.xl, paddingTop: 20, paddingBottom: 8 },
  topbarTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  form: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.lg, flex: 1 },
  body: { fontFamily: fonts.body, fontSize: 13.5, color: colors.inkSoft, lineHeight: 20 },
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
