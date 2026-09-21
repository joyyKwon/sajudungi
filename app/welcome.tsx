import { View, Text, Image, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, TextPath, Text as SvgText } from 'react-native-svg';
import { colors, radius, spacing, fonts } from '../theme';
import { Button } from '../components/Button';
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
          {/* MOCK: onPress just navigates to info-input. Replace with real Supabase OAuth (Kakao/Google/Apple) sign-in. */}
          <Button
            variant="outline"
            label="카카오로 시작하기"
            onPress={() => router.push('/info-input')}
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M12 3C6.9 3 3 6.4 3 10.6c0 2.7 1.7 5 4.3 6.4l-1 3.7c-.1.4.3.7.6.5l4.3-2.7c.3 0 .5.1.8.1 5.1 0 9-3.4 9-7.6S17.1 3 12 3z"
                  fill="#3c1e1e"
                />
              </Svg>
            }
          />
          <Button
            variant="outline"
            label="Google로 계속하기"
            onPress={() => router.push('/info-input')}
            icon={
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Circle cx={12} cy={12} r={10} fill="none" stroke="#4a4a4a" strokeWidth={1.6} />
                <SvgText x={12} y={16} textAnchor="middle" fontSize={12} fill="#4a4a4a">
                  G
                </SvgText>
              </Svg>
            }
          />
          <Button
            variant="outline"
            label="Apple로 계속하기"
            onPress={() => router.push('/info-input')}
            icon={
              <Svg width={17} height={17} viewBox="0 0 24 24">
                <Path
                  d="M16.5 1.5c.1 1.2-.4 2.4-1.1 3.2-.7.9-1.9 1.6-3 1.5-.1-1.2.4-2.4 1.1-3.2.7-.9 2-1.6 3-1.5zm4.1 16.3c-.4 1-.9 1.9-1.6 2.8-1 1.3-2 2.6-3.5 2.7-1.5 0-1.9-.9-3.6-.9s-2.2.9-3.6.9c-1.5.1-2.6-1.4-3.6-2.7-2-2.8-3.5-8-1.4-11.5.9-1.7 2.6-2.8 4.4-2.8 1.4 0 2.3.9 3.5.9 1.1 0 1.9-.9 3.6-.9 1.5 0 3.1.8 4.1 2.2-3.6 2-3 7.3 1.7 9.3z"
                  fill="#1a1a1a"
                />
              </Svg>
            }
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* MOCK: should open email/password sign-up form + Supabase auth.signUp, not jump straight to info-input. */}
          <Button label="이메일로 시작하기" onPress={() => router.push('/info-input')} />

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
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerText: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
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
