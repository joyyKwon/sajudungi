import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { Redirect, router } from 'expo-router';
import Svg, { Path, Circle, TextPath, Text as SvgText } from 'react-native-svg';
import { colors, radius, spacing, fonts } from '../theme';
import { Button } from '../components/Button';
import { useProfile } from '../context/ProfileContext';

export default function Onboarding() {
  const { profile } = useProfile();
  if (profile) return <Redirect href="/(tabs)" />;

  return (
    <View style={styles.screen}>
      <Image source={require('../assets/mascot/mascot_hero.jpg')} style={styles.hero} resizeMode="cover" />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.brandBlock}>
          <Text style={styles.title}>사주둥이</Text>
          <Text style={styles.tagline}>천년의 지혜, 쉽고 친근하게{'\n'}사주둥이와 함께 알아가요</Text>
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

          <Text style={styles.fineprint}>가입 시 이용약관 및 개인정보처리방침에 동의합니다</Text>
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
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { width: '100%', height: 250, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  body: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl, flexGrow: 1 },
  brandBlock: { alignItems: 'center', marginTop: spacing.xl },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.ink },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.inkSoft,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 21,
  },
  chipRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.amberSoft,
  },
  chipText: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, fontWeight: '700' },
  actions: { marginTop: 'auto', paddingTop: spacing.xl, gap: spacing.md },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerText: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  fineprint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 16,
  },
});
