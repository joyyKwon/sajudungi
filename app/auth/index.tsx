import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, radius, spacing, fonts } from '../../theme';
import { Icon } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';
import { LoginOptions } from '../../components/LoginOptions';
import { goBackOrHome } from '../../lib/navigation';

// 마이 > 로그인 / 회원가입: a guest choosing how to sign in, with the same options as the start screen.
export default function LoginMethodScreen() {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.topbar}>
        <Pressable onPress={() => goBackOrHome()} hitSlop={12}>
          <Icon name="back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.topbarTitle}>로그인 / 회원가입</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hintCard}>
          <Mascot pose="front" width={56} />
          <Text style={styles.hintText}>
            로그인하면 사주 목록과 학습 진도를 백업해서{'\n'}기기를 바꿔도 그대로 볼 수 있어.
          </Text>
        </View>

        <Text style={styles.note}>지금 이 기기에 저장된 사주 목록도 로그인하면 함께 백업돼요.</Text>

        <View style={styles.options}>
          <LoginOptions />
        </View>

        <Text style={styles.fineprint}>
          로그인하면{' '}
          <Text style={styles.link} onPress={() => router.push('/legal/terms')}>
            이용약관
          </Text>
          과{' '}
          <Text style={styles.link} onPress={() => router.push('/legal/privacy')}>
            개인정보처리방침
          </Text>
          에 동의하는 것으로 볼게요.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: spacing.xl, paddingTop: 20, paddingBottom: 8 },
  topbarTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg, flexGrow: 1 },
  hintCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.amberSoft, borderRadius: radius.lg, padding: spacing.lg },
  hintText: { fontFamily: fonts.body, fontSize: 13, color: colors.ink, lineHeight: 19, flexShrink: 1 },
  note: { fontFamily: fonts.body, fontSize: 12.5, color: colors.inkSoft, lineHeight: 18 },
  options: { marginTop: 'auto' },
  fineprint: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft, textAlign: 'center', lineHeight: 16 },
  link: { textDecorationLine: 'underline', color: colors.red },
});
