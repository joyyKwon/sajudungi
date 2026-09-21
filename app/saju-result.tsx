import { View, Text, Pressable, StyleSheet, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { colors, radius, spacing, fonts } from '../theme';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { useProfile, useRequiredProfile, useSaju } from '../context/ProfileContext';
import { ELEMENT_HANGUL, ELEMENT_HANJA } from '../lib/sajuContent';
import { describeBasis } from '../lib/format';
import { elementCounts } from '../lib/saju';
import { ELEMENT_ORDER, elementInsights } from '../lib/interpret';
import { useContent } from '../context/ContentContext';
import { GROUP_ORDER } from '../lib/content/tenGodGroups';
import { analyzeGroups, tenGodGroupCounts } from '../lib/tenGodGroups';
import { daeunFlow, daeunState, yearFlow } from '../lib/flow';

const ELEMENT_COLOR = {
  wood: colors.wood,
  fire: colors.fire,
  earth: colors.earth,
  metal: colors.metal,
  water: colors.water,
} as const;

export default function SajuResultScreen() {
  const { me } = useProfile();
  if (!me) return <Redirect href="/welcome" />;
  return <SajuResult />;
}

function SajuResult() {
  const profile = useRequiredProfile();
  const saju = useSaju();

  const { content } = useContent();
  const { ILGAN, ILJU, GROUP_INFO } = content;
  const ilgan = ILGAN[saju.day.gan];
  const counts = elementCounts(saju);
  const maxCount = Math.max(...Object.values(counts), 1);
  const insights = elementInsights(saju);
  const groupCounts = tenGodGroupCounts(saju);
  const groupMax = Math.max(...GROUP_ORDER.map((g) => groupCounts[g]), 1);
  const groupAnalysis = analyzeGroups(groupCounts);
  const now = new Date();
  const thisYear = yearFlow(saju, now.getFullYear());
  const daeun = daeunState(saju, now);
  const currentDaeun = daeun.current ? daeunFlow(saju, daeun.current) : null;
  const nextDaeun = daeun.next ? daeunFlow(saju, daeun.next) : null;
  const ilganTag = `일간 ${saju.day.gan}(${ELEMENT_HANGUL[saju.dayGanElement]}) 기준`;

  const pillars = [
    { label: '년주', pillar: saju.year },
    { label: '월주', pillar: saju.month },
    { label: '일주', pillar: saju.day, highlight: true },
    { label: '시주', pillar: saju.hour },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.topbar}>
        <View style={styles.topbarLeft}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Icon name="back" size={22} color={colors.ink} />
          </Pressable>
          <Text style={styles.topbarTitle}>내 사주풀이</Text>
        </View>
        <Pressable
          hitSlop={12}
          onPress={() =>
            Share.share({
              message: `${profile.name}님의 사주 · 년주 ${saju.year.ganZhi} 월주 ${saju.month.ganZhi} 일주 ${saju.day.ganZhi}${saju.hour ? ` 시주 ${saju.hour.ganZhi}` : ''} (사주둥이)`,
            })
          }
        >
          <Icon name="share" size={20} color="#6b5a45" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greetRow}>
          <Mascot pose="analyzing" width={64} />
          <Text style={styles.greetText}>{profile.name}님의 사주를 풀어봤어!</Text>
        </View>

        <Card>
          <Text style={styles.cardLabel}>나의 사주 원국</Text>
          <View style={styles.pillarRow}>
            {pillars.map((p) => (
              <View key={p.label} style={[styles.pillar, p.highlight && styles.pillarHighlight, !p.pillar && { opacity: 0.55 }]}>
                <Text style={[styles.pillarLabel, p.highlight && { color: colors.red }]}>{p.label}</Text>
                <Text style={[styles.pillarHanja, p.highlight && { color: colors.red }]}>{p.pillar ? p.pillar.ganZhi : '?'}</Text>
                <Text style={[styles.pillarHangul, p.highlight && { color: colors.red }]}>{p.pillar ? p.pillar.hangul : '모름'}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.basisText}>계산 기준 · {describeBasis(saju.basis)}</Text>
        </Card>

        <Card style={styles.ilganCard}>
          <Text style={styles.ilganLabel}>나의 일간</Text>
          <Text style={styles.ilganTitle}>
            {saju.dayGanHangul}
            {ELEMENT_HANGUL[saju.dayGanElement]} ({saju.dayGan}
            {ELEMENT_HANJA[saju.dayGanElement]})
          </Text>
          <Text style={styles.ilganBody}>{ilgan.summary}</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>
            나의 일주 · {saju.day.hangul}({saju.day.ganZhi})
          </Text>
          <Text style={styles.sectionBody}>{ILJU[saju.day.ganZhi]}</Text>
        </Card>

        <Card>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>올해의 흐름</Text>
            <Text style={styles.tag}>
              {thisYear.label} · {thisYear.hangul}
            </Text>
          </View>
          <Text style={styles.flowTitle}>{thisYear.title}</Text>
          <Text style={styles.sectionBody}>{thisYear.body}</Text>
          <Text style={[styles.sectionBody, { marginTop: 8 }]}>{thisYear.note}</Text>
          <Text style={styles.footnote}>{thisYear.basis}</Text>
        </Card>

        <Card>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>지금의 대운</Text>
            {currentDaeun && (
              <Text style={styles.tag}>
                {currentDaeun.label} · {currentDaeun.hangul}
              </Text>
            )}
          </View>
          {currentDaeun ? (
            <>
              <Text style={styles.flowTitle}>{currentDaeun.title}</Text>
              <Text style={styles.sectionBody}>{currentDaeun.body}</Text>
              <Text style={[styles.sectionBody, { marginTop: 8 }]}>{currentDaeun.note}</Text>
              <Text style={styles.footnote}>{currentDaeun.basis}</Text>
            </>
          ) : (
            <Text style={styles.sectionBody}>아직 첫 대운이 시작되기 전이에요. 대운은 {daeun.next?.startAge}세부터 시작해요.</Text>
          )}
          {nextDaeun && (
            <Text style={[styles.sectionBody, { marginTop: 10 }]}>
              다음 대운은 {nextDaeun.label.replace(' 대운', '')}에 {nextDaeun.hangul}로 바뀌어요 · {nextDaeun.ganGod}의 시기예요.
            </Text>
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>오행 분포</Text>
          <View style={styles.bars}>
            {ELEMENT_ORDER.map((el) => (
              <View key={el} style={styles.barRow}>
                <Text style={styles.barLabel}>{ELEMENT_HANJA[el]}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${(counts[el] / maxCount) * 100}%`, backgroundColor: ELEMENT_COLOR[el] }]} />
                </View>
                <Text style={styles.barCount}>{counts[el]}</Text>
              </View>
            ))}
          </View>
          {insights.map((line) => (
            <Text key={line} style={[styles.sectionBody, { marginTop: 8 }]}>
              {line}
            </Text>
          ))}
          <Text style={styles.footnote}>겉으로 드러난 글자 기준이며, 지지 속 숨은 기운(지장간)은 포함하지 않았어요.</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>십신 분포</Text>
          <View style={styles.bars}>
            {GROUP_ORDER.map((g) => (
              <View key={g} style={styles.barRow}>
                <Text style={styles.groupLabel}>{g}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${(groupCounts[g] / groupMax) * 100}%`, backgroundColor: groupAnalysis.dominant.includes(g) ? colors.red : colors.amberDeep }]} />
                </View>
                <Text style={styles.barCount}>{groupCounts[g]}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.sectionBody, { marginTop: 10 }]}>{groupAnalysis.headline}</Text>
          {groupAnalysis.insights.map((line) => (
            <Text key={line} style={[styles.sectionBody, { marginTop: 8 }]}>
              {line}
            </Text>
          ))}
          <Text style={styles.footnote}>
            일간을 뺀 천간과 지지 속 본기운 기준이에요. {GROUP_ORDER.map((g) => `${g}=${GROUP_INFO[g].meaning}`).join(' · ')}
          </Text>
        </Card>

        <Card>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>성격</Text>
            <Text style={styles.tag}>{ilganTag}</Text>
          </View>
          <Text style={styles.sectionBody}>{ilgan.personality}</Text>
        </Card>
        <Card>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>재물운</Text>
            <Text style={styles.tag}>{ilganTag}</Text>
          </View>
          <Text style={styles.sectionBody}>{ilgan.wealth}</Text>
        </Card>
        <Card>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>애정운</Text>
            <Text style={styles.tag}>{ilganTag}</Text>
          </View>
          <Text style={styles.sectionBody}>{ilgan.love}</Text>
        </Card>

        <Text style={styles.disclaimer}>
          사주 해석은 관점에 따라 달라질 수 있는 참고용이에요. 일간을 중심으로 한 경향이니 재미로 즐겨주세요.
        </Text>

        <Pressable style={styles.ctaCard} onPress={() => router.push('/(tabs)/manseryeok')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>더 깊이 알고 싶다면?</Text>
            <Text style={styles.ctaSubtitle}>만세력에서 기둥마다 해석의 이유를 눌러서 확인해요</Text>
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
  basisText: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft, marginTop: 10 },
  pillarRow: { flexDirection: 'row', gap: 8 },
  pillar: { flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  pillarHighlight: { backgroundColor: colors.redSoft, borderColor: colors.redSoft },
  pillarLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft },
  pillarHanja: { fontFamily: fonts.display, fontSize: 20, marginTop: 4, color: colors.ink },
  pillarHangul: { fontFamily: fonts.body, fontSize: 10.5, color: colors.inkSoft, marginTop: 2 },
  ilganCard: { backgroundColor: colors.red, borderWidth: 0 },
  ilganLabel: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '700' },
  ilganTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.white, marginTop: 6 },
  ilganBody: { fontFamily: fonts.body, fontSize: 13.5, color: 'rgba(255,255,255,0.92)', marginTop: 8, lineHeight: 20 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.ink, marginBottom: 6 },
  tag: { fontFamily: fonts.body, fontSize: 10.5, color: colors.inkSoft, backgroundColor: colors.amberSoft, paddingVertical: 3, paddingHorizontal: 8, borderRadius: radius.pill, overflow: 'hidden' },
  sectionBody: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, lineHeight: 20 },
  bars: { gap: 8, marginTop: 2 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 20, fontFamily: fonts.display, fontSize: 15, color: colors.ink, textAlign: 'center' },
  barTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.line, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  groupLabel: { width: 34, fontFamily: fonts.display, fontSize: 14, color: colors.ink },
  flowTitle: { fontFamily: fonts.body, fontSize: 13.5, fontWeight: '700', color: colors.red, marginBottom: 6, lineHeight: 20 },
  barCount: { width: 16, fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, textAlign: 'right' },
  footnote: { fontFamily: fonts.body, fontSize: 11, color: colors.inkFaint, marginTop: 10, lineHeight: 16 },
  disclaimer: { fontFamily: fonts.body, fontSize: 11.5, color: colors.inkSoft, textAlign: 'center', lineHeight: 17, paddingHorizontal: spacing.md },
  ctaCard: { backgroundColor: colors.amberSoft, borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  ctaTitle: { fontFamily: fonts.body, fontSize: 13.5, fontWeight: '700', color: colors.ink },
  ctaSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 2 },
});
