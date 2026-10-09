import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Share, useWindowDimensions } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { colors, radius, spacing, fonts } from '../theme';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { useProfile, useRequiredProfile, useSaju } from '../context/ProfileContext';
import { ELEMENT_HANGUL, ELEMENT_HANJA } from '../lib/sajuContent';
import { describeBasis } from '../lib/format';
import { GAN_ELEMENT, GAN_HANGUL, elementCounts, sajuYearOf, wolunOfYear } from '../lib/saju';
import { ELEMENT_ORDER, elementInsights } from '../lib/interpret';
import { useContent } from '../context/ContentContext';
import { GROUP_ORDER } from '../lib/content/tenGodGroups';
import { analyzeGroups, tenGodGroupCounts } from '../lib/tenGodGroups';
import { daeunFlow, daeunState, monthFlow, yearFlow } from '../lib/flow';
import { zhiRelationsOf } from '../lib/zhiRelations';
import { DetailLine, loveDetail, personalityDetail, wealthDetail } from '../lib/detail';
import { POSITION_PILLAR_LABEL, POSITION_ZHI_LABEL, SinsalHit, sinsalOf } from '../lib/sinsal';
import type { SinsalKey } from '../lib/content/sinsal';
import { JohuStem, johuOf } from '../lib/johu';
import { careerOf } from '../lib/career';

const ELEMENT_COLOR = {
  wood: colors.wood,
  fire: colors.fire,
  earth: colors.earth,
  metal: colors.metal,
  water: colors.water,
} as const;

// The cards are grouped into tabs only at render time, so the grouping can change
// (or go back to one long page) without touching the cards themselves.
type TabKey = 'me' | 'analysis' | 'flow';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'me', label: '나' },
  { key: 'analysis', label: '기운 분석' },
  { key: 'flow', label: '운의 흐름' },
];

/** "10월 8일" in Korea time. */
const monthDay = (ms: number) => {
  const d = new Date(ms + 9 * 3_600_000);
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`;
};

const PRESENCE_LABEL: Record<JohuStem['presence'], string> = { visible: '사주에 드러나 있음', hidden: '사주 속에 숨어 있음', absent: '사주에 없음' };

/** A plain-language heading with the 사주 term for it as a small tag beside it. */
function FlowHeading({ title, term }: { title: string; term: string }) {
  return (
    <View style={styles.flowHeading}>
      <Text style={[styles.flowTitle, { marginBottom: 0 }]}>{title}</Text>
      <Text style={styles.termTag}>{term}</Text>
    </View>
  );
}

function StemBadge({ gan, size }: { gan: string; size: number }) {
  const color = ELEMENT_COLOR[GAN_ELEMENT[gan]];
  return (
    <View style={[styles.stemBadge, { width: size, height: size, borderRadius: size / 4, backgroundColor: color + '38' }]}>
      <Text style={[styles.stemBadgeText, { color, fontSize: size * 0.5 }]}>{gan}</Text>
    </View>
  );
}

export default function SajuResultScreen() {
  const { me } = useProfile();
  if (!me) return <Redirect href="/welcome" />;
  return <SajuResult />;
}

function SajuResult() {
  const profile = useRequiredProfile();
  const saju = useSaju();

  const { content } = useContent();
  const { ILGAN, ILJU, GROUP_INFO, ZHI_RELATION_NONE, SINSAL_POSITION, SINSAL_REPEATED, SINSAL_NONE, JOHU_INTRO } = content;
  const ilgan = ILGAN[saju.day.gan];
  const counts = elementCounts(saju);
  const maxCount = Math.max(...Object.values(counts), 1);
  const insights = elementInsights(saju);
  const groupCounts = tenGodGroupCounts(saju);
  const groupMax = Math.max(...GROUP_ORDER.map((g) => groupCounts[g]), 1);
  const groupAnalysis = analyzeGroups(groupCounts);
  const now = new Date();
  const thisYear = yearFlow(saju, now.getFullYear());
  // 월운 turns over at each 절입, so "this month" is the 절기 month containing now.
  const thisWolun = wolunOfYear(sajuYearOf(now)).find((w) => now.getTime() >= w.startMs && now.getTime() < w.endMs);
  const thisMonth = thisWolun ? monthFlow(saju, thisWolun) : null;
  const daeun = daeunState(saju, now);
  const currentDaeun = daeun.current ? daeunFlow(saju, daeun.current) : null;
  const nextDaeun = daeun.next ? daeunFlow(saju, daeun.next) : null;
  const ilganTag = `일간 ${saju.day.gan}(${ELEMENT_HANGUL[saju.dayGanElement]}) 기준`;
  const zhiRelations = zhiRelationsOf(saju);
  const sinsal = sinsalOf(saju);
  const johu = johuOf(saju, now);
  const career = careerOf(saju);
  const [openSinsal, setOpenSinsal] = useState<SinsalKey | null>(null);
  const [tab, setTab] = useState<TabKey>('me');
  const { width } = useWindowDimensions();
  const pagerRef = useRef<ScrollView>(null);
  // While a tapped tab is sliding into view, ignore the pages it passes on the way.
  const targetRef = useRef<number | null>(null);
  const settledRef = useRef(0);
  const pageRefs = useRef<(ScrollView | null)[]>([]);
  const goToTab = (index: number) => {
    targetRef.current = index;
    setTab(TABS[index].key);
    pagerRef.current?.scrollTo({ x: index * width, animated: true });
  };
  const onPagerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    if (targetRef.current !== null) {
      if (Math.abs(x - targetRef.current * width) > 1) return;
      targetRef.current = null;
    }
    const index = Math.min(TABS.length - 1, Math.max(0, Math.round(x / width)));
    setTab(TABS[index].key);
    // Once a page has fully settled, send the pages now out of view back to the top,
    // so every tab opens from its first card (out of sight, so the jump isn't seen).
    if (Math.abs(x - index * width) <= 1 && settledRef.current !== index) {
      settledRef.current = index;
      pageRefs.current.forEach((page, i) => i !== index && page?.scrollTo({ y: 0, animated: false }));
    }
  };
  // Keep the current page in place when the width changes (rotation, resized web window).
  useEffect(() => {
    pagerRef.current?.scrollTo({ x: TABS.findIndex((t) => t.key === tab) * width, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);
  const shownSinsal: SinsalHit | undefined = sinsal.find((s) => s.key === openSinsal) ?? sinsal[0];
  const details: { title: string; base: string; extra: DetailLine }[] = [
    { title: '성격', base: ilgan.personality, extra: personalityDetail(saju) },
    { title: '재물운', base: ilgan.wealth, extra: wealthDetail(saju) },
    { title: '애정운', base: ilgan.love, extra: loveDetail(saju) },
  ];

  const pillars = [
    { label: '년주', pillar: saju.year },
    { label: '월주', pillar: saju.month },
    { label: '일주', pillar: saju.day, highlight: true },
    { label: '시주', pillar: saju.hour },
  ];

  // Every tab is rendered side by side in a horizontal pager, so a tab can be reached
  // by swiping as well as by tapping; each page keeps its own vertical scroll.
  const renderPage = (page: TabKey) => (
    <>
          {page === 'me' && (
            <>
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

            </>
          )}

          {page === 'flow' && (
            <>
          {thisMonth && thisWolun && (
            <Card>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>이번 달의 흐름</Text>
                <Text style={styles.tag}>
                  {thisMonth.label} · {thisMonth.hangul}
                </Text>
              </View>
              <FlowHeading title={thisMonth.title} term={thisMonth.godLabel} />
              <Text style={styles.sectionBody}>{thisMonth.body}</Text>
              <Text style={[styles.sectionBody, { marginTop: 8 }]}>{thisMonth.note}</Text>
              <Text style={styles.footnote}>
                {thisMonth.basis} 사주의 달은 절기로 바뀌어서, 이 달은 {monthDay(thisWolun.startMs)}부터 {monthDay(thisWolun.endMs)} 전까지예요.
              </Text>
            </Card>
          )}

          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>올해의 흐름</Text>
              <Text style={styles.tag}>
                {thisYear.label} · {thisYear.hangul}
              </Text>
            </View>
            <FlowHeading title={thisYear.title} term={thisYear.godLabel} />
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
                <FlowHeading title={currentDaeun.title} term={currentDaeun.godLabel} />
                <Text style={styles.sectionBody}>{currentDaeun.body}</Text>
                <Text style={[styles.sectionBody, { marginTop: 8 }]}>{currentDaeun.note}</Text>
                <Text style={styles.footnote}>{currentDaeun.basis}</Text>
              </>
            ) : (
              <Text style={styles.sectionBody}>아직 첫 대운이 시작되기 전이에요. 대운은 {daeun.next?.startAge}세부터 시작해요.</Text>
            )}
            {nextDaeun && (
              <Text style={[styles.sectionBody, { marginTop: 10 }]}>
                다음 대운은 {nextDaeun.label.replace(' 대운', '')}에 {nextDaeun.hangul}로 바뀌어요 · {nextDaeun.title}
              </Text>
            )}
          </Card>

            </>
          )}

          {page === 'analysis' && (
            <>
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
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>태어난 계절과 필요한 기운</Text>
              <Text style={styles.tag}>조후 · {johu.seasonTitle}</Text>
            </View>
            <Text style={styles.sectionBody}>{johu.seasonBody}</Text>
            <View style={styles.johuMain}>
              <StemBadge gan={johu.primary.gan} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={styles.flowTitle}>
                  가장 필요한 기운 · {johu.primary.gan}({GAN_HANGUL[johu.primary.gan]})
                </Text>
                <Text style={styles.sectionBody}>{johu.primary.role}</Text>
              </View>
            </View>
            {johu.others.length > 0 && (
              <View style={{ gap: 8, marginTop: 12 }}>
                <Text style={styles.johuSubLabel}>함께 있으면 좋은 기운</Text>
                {johu.others.map((o) => (
                  <View key={o.gan} style={styles.johuOtherRow}>
                    <StemBadge gan={o.gan} size={28} />
                    <Text style={[styles.sectionBody, { flex: 1 }]}>
                      {o.gan}({GAN_HANGUL[o.gan]}) · {PRESENCE_LABEL[o.presence]} — {o.role}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={[styles.sectionBody, { marginTop: 12 }]}>
              {johu.presenceLine} {johu.timingLine}
            </Text>
            <Text style={styles.footnote}>{JOHU_INTRO}</Text>
            <Text style={[styles.footnote, { marginTop: 4 }]}>출처: {johu.source}</Text>
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
            <Text style={styles.sectionTitle}>지지 관계</Text>
            {zhiRelations.length === 0 ? (
              <Text style={styles.sectionBody}>{ZHI_RELATION_NONE}</Text>
            ) : (
              <View style={{ gap: 12 }}>
                {zhiRelations.map((r) => (
                  <View key={`${r.a}-${r.b}`} style={styles.relationRow}>
                    <View style={styles.rowBetween}>
                      <Text style={[styles.flowTitle, r.kind === 'chung' && { color: colors.metal }]}>{r.title}</Text>
                      <Text style={styles.tag}>{r.label}</Text>
                    </View>
                    <Text style={styles.sectionBody}>{r.body}</Text>
                    {r.transformsToLine && <Text style={[styles.sectionBody, { marginTop: 4 }]}>→ {r.transformsToLine}</Text>}
                    <Text style={styles.footnote}>{r.pairHangul}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={styles.footnote}>합과 충만 봤어요. 세 글자가 만나는 삼합·방합과 형·해·파는 아직 다루지 않아요.</Text>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>나의 신살</Text>
            {shownSinsal ? (
              <>
                <View style={styles.sinsalTags}>
                  {sinsal.map((s) => {
                    const active = s.key === shownSinsal.key;
                    return (
                      <Pressable key={s.key} onPress={() => setOpenSinsal(s.key)} style={[styles.sinsalTag, active && styles.sinsalTagActive]}>
                        <Text style={[styles.sinsalTagText, active && styles.sinsalTagTextActive]}>
                          {s.info.name}
                          {s.positions.length > 1 ? ` ×${s.positions.length}` : ''}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.relationRow}>
                  <Text style={styles.flowTitle}>
                    {shownSinsal.info.name}({shownSinsal.info.hanja}) · {shownSinsal.info.title}
                  </Text>
                  <Text style={styles.sectionBody}>{shownSinsal.info.body}</Text>
                  <Text style={[styles.sectionBody, { marginTop: 8 }]}>
                    어디에:{' '}
                    {shownSinsal.positions
                      .map((p) => `${SINSAL_POSITION[p]}(${(shownSinsal.byPillar ? POSITION_PILLAR_LABEL : POSITION_ZHI_LABEL)[p]})`)
                      .join(' · ')}
                    {shownSinsal.positions.length > 1 ? ` — ${SINSAL_REPEATED}` : ''}
                  </Text>
                  <Text style={styles.footnote}>{shownSinsal.basis}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.sectionBody}>{SINSAL_NONE}</Text>
            )}
            <Text style={styles.footnote}>
              신살은 유파마다 보는 기준이 조금씩 달라요. 태그를 누르면 설명이 바뀌어요.{saju.hour ? '' : ' 태어난 시간을 몰라 시간 자리는 빼고 봤어요.'}
            </Text>
          </Card>

            </>
          )}

          {page === 'me' && (
            <>
          {details.map((d) => (
            <Card key={d.title}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>{d.title}</Text>
                <Text style={styles.tag}>{ilganTag}</Text>
              </View>
              <Text style={styles.sectionBody}>{d.base}</Text>
              <Text style={[styles.sectionBody, { marginTop: 8 }]}>{d.extra.text}</Text>
              <Text style={styles.footnote}>{d.extra.basis}</Text>
              {d.extra.reference && <Text style={[styles.footnote, { marginTop: 4 }]}>참고: {d.extra.reference}</Text>}
            </Card>
          ))}

          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>직업·적성</Text>
              <Text style={styles.tag}>십신 분포 기준</Text>
            </View>
            <View style={styles.sinsalTags}>
              {career.keywords.map((k) => (
                <View key={k} style={[styles.sinsalTag, styles.sinsalTagActive]}>
                  <Text style={[styles.sinsalTagText, styles.sinsalTagTextActive]}>{k}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.johuSubLabel}>잘 맞는 분야</Text>
            {career.fields.map((f) => (
              <View key={f.group ?? 'balanced'} style={{ marginTop: 6 }}>
                <Text style={styles.sectionBody}>{f.body}</Text>
                <View style={[styles.sinsalTags, { marginTop: 10, marginBottom: 0 }]}>
                  {f.jobs.map((j) => (
                    <View key={j} style={styles.sinsalTag}>
                      <Text style={styles.sinsalTagText}>{j}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            <Text style={styles.footnote}>{career.fieldsBasis}</Text>

            <Text style={[styles.johuSubLabel, { marginTop: 16 }]}>일하는 방식</Text>
            <Text style={[styles.sectionBody, { marginTop: 6 }]}>{career.style.text}</Text>
            <Text style={styles.footnote}>{career.style.basis}</Text>

            {career.tips.length > 0 && (
              <>
                <Text style={[styles.johuSubLabel, { marginTop: 16 }]}>보완 팁</Text>
                {career.tips.map((t) => (
                  <Text key={t.group} style={[styles.sectionBody, { marginTop: 6 }]}>
                    {t.text}
                  </Text>
                ))}
                <Text style={styles.footnote}>{career.tipsBasis}</Text>
              </>
            )}
          </Card>
            </>
          )}

          <Text style={styles.disclaimer}>
            사주 해석은 관점에 따라 달라질 수 있는 참고용이에요. 타고난 경향을 풀어본 것이니 재미로 즐겨주세요.
          </Text>

          <Pressable style={styles.ctaCard} onPress={() => router.push('/(tabs)/manseryeok')}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>더 깊이 알고 싶다면?</Text>
              <Text style={styles.ctaSubtitle}>만세력에서 기둥마다 해석의 이유를 눌러서 확인해요</Text>
            </View>
            <Icon name="chevronRight" size={18} color="#7a5a1f" />
          </Pressable>
    </>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.topbar}>
        <View style={styles.topbarLeft}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Icon name="back" size={22} color={colors.ink} />
          </Pressable>
          <Text style={styles.topbarTitle}>{profile.isSelf ? '내 사주풀이' : `${profile.name}님의 사주풀이`}</Text>
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

      <View style={styles.tabs}>
        {TABS.map((t, i) => (
          <Pressable
            key={t.key}
            onPress={() => goToTab(i)}
            style={[styles.tabItem, tab === t.key && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onPagerScroll}
        style={{ flex: 1 }}
      >
        {TABS.map((t, i) => (
          <ScrollView
            key={t.key}
            ref={(page) => {
              pageRefs.current[i] = page;
            }}
            style={{ width }}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {renderPage(t.key)}
          </ScrollView>
        ))}
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
  tabs: { flexDirection: 'row', gap: 4, marginHorizontal: spacing.xl, marginBottom: 6, backgroundColor: '#F1E6D5', borderRadius: 12, padding: 4 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 9 },
  tabItemActive: { backgroundColor: colors.white },
  tabText: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: colors.inkSoft },
  tabTextActive: { color: colors.red },
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
  flowHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 6 },
  termTag: { fontFamily: fonts.body, fontSize: 10.5, color: colors.inkSoft, borderWidth: 1, borderColor: colors.line, paddingVertical: 2, paddingHorizontal: 7, borderRadius: radius.pill, overflow: 'hidden' },
  johuMain: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, backgroundColor: colors.white, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: colors.line },
  johuSubLabel: { fontFamily: fonts.body, fontSize: 12, fontWeight: '700', color: colors.inkSoft },
  johuOtherRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stemBadge: { alignItems: 'center', justifyContent: 'center' },
  stemBadgeText: { fontFamily: fonts.display, fontWeight: '700' },
  sinsalTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  sinsalTag: { paddingVertical: 6, paddingHorizontal: 11, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  sinsalTagActive: { backgroundColor: colors.redSoft, borderColor: colors.red },
  sinsalTagText: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  sinsalTagTextActive: { color: colors.red, fontWeight: '700' },
  relationRow: { backgroundColor: colors.white, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: colors.line },
  flowTitle: { fontFamily: fonts.body, fontSize: 13.5, fontWeight: '700', color: colors.red, marginBottom: 6, lineHeight: 20 },
  barCount: { width: 16, fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, textAlign: 'right' },
  footnote: { fontFamily: fonts.body, fontSize: 11, color: colors.inkFaint, marginTop: 10, lineHeight: 16 },
  disclaimer: { fontFamily: fonts.body, fontSize: 11.5, color: colors.inkSoft, textAlign: 'center', lineHeight: 17, paddingHorizontal: spacing.md },
  ctaCard: { backgroundColor: colors.amberSoft, borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  ctaTitle: { fontFamily: fonts.body, fontSize: 13.5, fontWeight: '700', color: colors.ink },
  ctaSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 2 },
});
