import { View, Text, Image, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, fonts } from '../theme';
import { LoginOptions } from '../components/LoginOptions';
import { useProfile } from '../context/ProfileContext';

// Start screen for people without a saved profile. Kept off "/" because the home tab
// (app/(tabs)/index.tsx) owns that path; redirecting to "/" would loop.
export default function Onboarding() {
  const { me } = useProfile();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  if (me) return <Redirect href="/(tabs)" />;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: insets.top + 52 }]} showsVerticalScrollIndicator={false}>
        {/* The wordmark, tagline and character are all part of this picture. */}
        <Image source={require('../assets/mascot/welcome_art.jpg')} style={{ width, height: (width * 681) / 941 }} resizeMode="contain" />
        <View style={styles.brandBlock}>
          <View style={styles.chipRow}>
            <Chip label="사주풀이" />
            <Chip label="만세력" />
            <Chip label="사주공부" />
          </View>
        </View>

        <View style={styles.actions}>
          <LoginOptions />

          <Pressable onPress={() => router.push('/info-input')} hitSlop={8} style={styles.guestBtn}>
            <Text style={styles.guestText}>로그인 없이 시작하기</Text>
          </Pressable>

          <Text style={styles.fineprint}>
            시작하기 전에{' '}
            <Text style={styles.link} onPress={() => router.push('/legal/terms')}>
              이용약관
            </Text>
            과{' '}
            <Text style={styles.link} onPress={() => router.push('/legal/privacy')}>
              개인정보처리방침
            </Text>
            을 확인해주세요
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Same color as the background of the start-screen picture (assets/mascot/welcome_art.jpg), so the picture blends in.
  screen: { flex: 1, backgroundColor: '#FDF6E4' },
  body: { paddingBottom: spacing.xxl, flexGrow: 1 },
  brandBlock: { alignItems: 'center', paddingHorizontal: spacing.xxl, marginTop: spacing.sm },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.amberSoft,
  },
  chipText: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, fontWeight: '700' },
  actions: { marginTop: 'auto', paddingTop: spacing.xl, paddingHorizontal: spacing.xxl, gap: spacing.md },
  guestBtn: { alignSelf: 'center', paddingVertical: spacing.sm },
  guestText: { fontFamily: fonts.body, fontSize: 13.5, color: colors.inkSoft, textDecorationLine: 'underline' },
  link: { textDecorationLine: 'underline', color: colors.red },
  fineprint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 16,
  },
});
