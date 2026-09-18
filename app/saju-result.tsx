import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, radius, spacing, fonts } from '../theme';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';

// MOCK: hardcoded for 서연님. Replace with the saju calculation engine's output for the
// signed-in user (same source as app/(tabs)/manseryeok.tsx's PILLARS — consider sharing one
// hook/selector between the two screens once the engine exists).
const PILLARS = [
  { label: '년주', hanja: '丙子', hangul: '병자' },
  { label: '월주', hanja: '辛卯', hangul: '신묘' },
  { label: '일주', hanja: '甲子', hangul: '갑자', highlight: true },
  { label: '시주', hanja: '庚午', hangul: '경오' },
];

export default function SajuResult() {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.topbar}>
        <View style={styles.topbarLeft}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Icon name="back" size={22} color={colors.ink} />
          </Pressable>
          <Text style={styles.topbarTitle}>내 사주풀이</Text>
        </View>
        <Icon name="share" size={20} color="#6b5a45" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* MOCK: hardcoded name, same as app/(tabs)/index.tsx. */}
        <View style={styles.greetRow}>
          <Mascot pose="analyzing" width={64} />
          <Text style={styles.greetText}>서연님의 사주를 풀어봤어!</Text>
        </View>

        <Card>
          <Text style={styles.cardLabel}>나의 사주 원국</Text>
          <View style={styles.pillarRow}>
            {PILLARS.map((p) => (
              <View key={p.label} style={[styles.pillar, p.highlight && styles.pillarHighlight]}>
                <Text style={[styles.pillarLabel, p.highlight && { color: colors.red }]}>{p.label}</Text>
                <Text style={[styles.pillarHanja, p.highlight && { color: colors.red }]}>{p.hanja}</Text>
                <Text style={[styles.pillarHangul, p.highlight && { color: colors.red }]}>{p.hangul}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* MOCK: 일간 + 성격/재물운/애정운 해석 텍스트 전부 고정 문구. 실제로는 계산된 일간을 바탕으로
            해석 콘텐츠(정적 매핑 테이블이든 AI 생성이든)를 붙여야 함. */}
        <Card style={styles.ilganCard}>
          <Text style={styles.ilganLabel}>나의 일간</Text>
          <Text style={styles.ilganTitle}>갑목 (甲木)</Text>
          <Text style={styles.ilganBody}>
            큰 나무처럼 곧고 자라나려는 기운이 강해요. 리더십이 있고 새로운 일을 시작하는 데 두려움이 없는 편이에요.
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>성격</Text>
          <Text style={styles.sectionBody}>솔직하고 주도적이며, 목표가 생기면 끝까지 밀어붙이는 힘이 있어요. 다만 고집이 세다는 말을 들을 때도 있답니다.</Text>
        </Card>
        <Card>
          <Text style={styles.sectionTitle}>재물운</Text>
          <Text style={styles.sectionBody}>꾸준히 쌓아가는 재물운이에요. 급하게 불리려 하기보다 차근차근 모으는 방식이 잘 맞아요.</Text>
        </Card>
        <Card>
          <Text style={styles.sectionTitle}>애정운</Text>
          <Text style={styles.sectionBody}>한번 마음을 주면 오래가는 편. 다만 표현이 서툴러 오해를 살 때가 있으니 마음을 조금 더 자주 표현해보세요.</Text>
        </Card>

        <Pressable style={styles.ctaCard} onPress={() => router.push('/(tabs)/manseryeok')}>
          <View>
            <Text style={styles.ctaTitle}>더 깊이 알고 싶다면?</Text>
            <Text style={styles.ctaSubtitle}>만세력에서 대운·세운까지 자세히 봐요</Text>
          </View>
          <Icon name="chevronRight" size={18} color="#7a5a1f" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: 20, paddingBottom: 8 },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topbarTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  content: { paddingHorizontal: spacing.xl, paddingTop: 10, paddingBottom: spacing.xl, gap: spacing.lg },
  greetRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greetText: { fontFamily: fonts.body, fontSize: 13.5, color: colors.inkSoft },
  cardLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, fontWeight: '700', marginBottom: 10 },
  pillarRow: { flexDirection: 'row', gap: 8 },
  pillar: { flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  pillarHighlight: { backgroundColor: colors.redSoft, borderColor: colors.redSoft },
  pillarLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft },
  pillarHanja: { fontFamily: fonts.display, fontSize: 20, marginTop: 4, color: colors.ink },
  pillarHangul: { fontFamily: fonts.body, fontSize: 10.5, color: colors.inkSoft, marginTop: 2 },
  ilganCard: { backgroundColor: colors.red, borderWidth: 0 },
  ilganLabel: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '700' },
  ilganTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.white, marginTop: 6 },
  ilganBody: { fontFamily: fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 8, lineHeight: 20 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.ink, marginBottom: 6 },
  sectionBody: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, lineHeight: 20 },
  ctaCard: { backgroundColor: colors.amberSoft, borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  ctaTitle: { fontFamily: fonts.body, fontSize: 13.5, fontWeight: '700', color: colors.ink },
  ctaSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 2 },
});
