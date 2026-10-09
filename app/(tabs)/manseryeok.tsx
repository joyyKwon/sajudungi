import { useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ELEMENT_INK, colors, elementBox, elementDot, radius, spacing, fonts } from '../../theme';
import { Icon } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';
import { Profile, useRequiredProfile, useSaju } from '../../context/ProfileContext';
import { PersonSwitcher } from '../../components/PersonSwitcher';
import { useContent } from '../../context/ContentContext';
import { CalcBasisSheet } from '../../components/CalcBasisSheet';
import {
  DaeunEntry,
  GAN_ELEMENT,
  Pillar as EnginePillar,
  PillarKey,
  SajuResult,
  WolunEntry,
  WuXing,
  ZHI_ELEMENT,
  ZHI_MAIN_GAN,
  elementCounts,
  sajuYearOf,
  tenGodOf,
  wolunOfYear,
} from '../../lib/saju';
import { FlowInfo, daeunFlow, monthFlow, yearFlow } from '../../lib/flow';
import { ELEMENT_ORDER, interpretPillar } from '../../lib/interpret';
import { describeBasis, formatBirthDate, formatTime } from '../../lib/format';
import { ELEMENT_HANGUL } from '../../lib/sajuContent';

type Pillar = {
  key: string;
  label: string;
  stem: string;
  branch: string;
  stemElement: WuXing;
  branchElement: WuXing;
  hangul: string;
  calcReason: string;
  interpretation: string;
};

const WOLUN_CHIP_WIDTH = 56;

function buildPillars(profile: Profile, saju: SajuResult): Pillar[] {
  const who = `${profile.name}님`;

  const toUi = (key: PillarKey, label: string, p: EnginePillar, calcReason: string): Pillar => ({
    key,
    label,
    stem: p.gan,
    branch: p.zhi,
    stemElement: p.ganElement,
    branchElement: p.zhiElement,
    hangul: p.hangul,
    calcReason,
    interpretation: interpretPillar(saju, key),
  });

  const list: Pillar[] = [
    toUi(
      'year',
      '년주',
      saju.year,
      `년주는 태어난 '해'의 간지야. 사주에서는 1월 1일이 아니라 입춘(立春)을 기준으로 해가 바뀌는데, ${who}의 년주는 ${saju.year.hangul}(${saju.year.ganZhi})로 나와!`,
    ),
    toUi(
      'month',
      '월주',
      saju.month,
      `월주는 태어난 '달'의 간지야. 사주의 달은 양력 달이 아니라 절기(節氣)를 기준으로 바뀌어서, ${who}이 태어난 시점의 월주는 ${saju.month.hangul}(${saju.month.ganZhi})가 나와!`,
    ),
    toUi(
      'day',
      '일주',
      saju.day,
      `일주는 태어난 '날'의 간지야. ${who}이 태어난 ${formatBirthDate(profile)}${profile.calendarType === 'lunar' ? `은 양력으로 ${saju.solarDate.year}년 ${saju.solarDate.month}월 ${saju.solarDate.day}일이야. 그` : '의'} 일진을 만세력에서 찾아보면 ${saju.day.hangul}(${saju.day.ganZhi})가 나와!`,
    ),
  ];

  if (saju.hour && profile.hour !== null) {
    list.push(
      toUi(
        'hour',
        '시주',
        saju.hour,
        `시주는 태어난 '시각'의 간지야. ${formatTime(profile.hour, profile.minute ?? 0)}은 하루를 12개로 나눈 시진 중 ${saju.hour.hangul.slice(1)}시에 해당하고, 일간과 조합하면 ${saju.hour.hangul}(${saju.hour.ganZhi})가 나와!`,
      ),
    );
  }

  return list;
}

const flowToUi = (info: FlowInfo, calcReason: string): Pillar => ({
  key: info.label,
  label: info.label,
  stem: info.ganZhi[0],
  branch: info.ganZhi[1],
  stemElement: GAN_ELEMENT[info.ganZhi[0]],
  branchElement: ZHI_ELEMENT[info.ganZhi[1]],
  hangul: info.hangul,
  calcReason,
  interpretation: [`${info.godLabel} · ${info.title}`, info.body, info.note].join('\n\n'),
});

function buildSeun(saju: SajuResult, year: number): Pillar {
  const info = yearFlow(saju, year);
  return flowToUi(
    info,
    `세운은 그 해의 간지예요. ${year}년의 간지는 ${info.hangul}(${info.ganZhi})이고, 사주에서 해는 입춘을 기준으로 바뀌어요.\n\n${info.basis} 이 관계가 그 해의 분위기를 읽는 열쇠예요.`,
  );
}

/** A 간지 as two stacked, element-tinted boxes — a smaller version of the 원국 table's glyphs. */
function GanZhiBoxes({ ganZhi }: { ganZhi: string }) {
  const parts = [
    { ch: ganZhi[0], element: GAN_ELEMENT[ganZhi[0]] },
    { ch: ganZhi[1], element: ZHI_ELEMENT[ganZhi[1]] },
  ];
  return (
    <View style={styles.ganZhiBoxes}>
      {parts.map((p, i) => (
        <View key={i} style={[styles.miniGlyph, elementBox(p.element)]}>
          <Text style={[styles.miniGlyphText, { color: ELEMENT_INK[p.element] }]}>{p.ch}</Text>
        </View>
      ))}
    </View>
  );
}

/** 천간 십신 and 지지(본기) 십신 of a luck-cycle 간지, for the small labels on the 대운/세운/월운 chips. */
const godsOf = (saju: SajuResult, ganZhi: string) => ({
  ganGod: tenGodOf(saju.dayGan, ganZhi[0]),
  zhiGod: tenGodOf(saju.dayGan, ZHI_MAIN_GAN[ganZhi[1]]),
});

const formatKst = (ms: number) => {
  const d = new Date(ms + 9 * 3_600_000);
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};

function buildWolun(saju: SajuResult, entry: WolunEntry): Pillar {
  const info = monthFlow(saju, entry);
  return flowToUi(
    info,
    `월운은 그 달의 간지예요. 사주의 달은 1일이 아니라 절기가 들어오는 순간(절입)에 바뀌어서, 이 달은 ${formatKst(entry.startMs)}부터 ${formatKst(entry.endMs)} 전까지예요. 이 달의 간지는 ${info.hangul}(${info.ganZhi})예요.\n\n${info.basis}`,
  );
}

function buildDaeun(saju: SajuResult, entry: DaeunEntry): Pillar {
  const info = daeunFlow(saju, entry);
  return flowToUi(
    info,
    `대운은 10년마다 바뀌는 큰 흐름이에요. 태어난 날에서 가장 가까운 절기까지의 날짜를 3일=1년으로 환산해 시작 나이(${entry.startAge}세, 세는나이)를 정하고, 월주에서 순서대로(또는 거꾸로) 이어가요. 이 대운은 ${entry.startYear}~${entry.endYear}년, ${entry.hangul}(${entry.ganZhi})예요.\n\n${info.basis}`,
  );
}

export default function Manseryeok() {
  const profile = useRequiredProfile();
  const saju = useSaju();
  const counts = elementCounts(saju);
  const { content } = useContent();
  const [basisOpen, setBasisOpen] = useState(false);
  const pillars = useMemo(() => buildPillars(profile, saju), [profile, saju, content]);

  const currentYear = new Date().getFullYear();
  const DAEUN = saju.daeun.slice(0, 9).map((d) => ({
    entry: d,
    age: `${d.startAge}세`,
    ganji: d.ganZhi,
    ...godsOf(saju, d.ganZhi),
    active: currentYear >= d.startYear && currentYear <= d.endYear,
  }));
  // 세운 and 월운 turn over at 입춘, so in January the running 세운 is still last year's.
  const thisSajuYear = useMemo(() => sajuYearOf(), []);
  const SEUN = saju.seun.map((s) => ({
    year: String(s.year),
    yearNum: s.year,
    ganji: s.ganZhi,
    ...godsOf(saju, s.ganZhi),
    active: s.year === thisSajuYear,
  }));

  const [wolunYear, setWolunYear] = useState(thisSajuYear);
  const wolun = useMemo(() => wolunOfYear(wolunYear), [wolunYear]);
  const nowMs = Date.now();
  const WOLUN = wolun.map((w) => ({
    entry: w,
    ganji: w.ganZhi,
    ...godsOf(saju, w.ganZhi),
    active: nowMs >= w.startMs && nowMs < w.endMs,
  }));
  const wolunScroll = useRef<ScrollView>(null);
  const activeWolunIndex = WOLUN.findIndex((w) => w.active);
  const scrollToActiveMonth = () => {
    // Chips are WOLUN_CHIP_WIDTH wide with an 8pt gap; keep one chip of context on the left.
    const x = activeWolunIndex > 0 ? (activeWolunIndex - 1) * (WOLUN_CHIP_WIDTH + 8) : 0;
    wolunScroll.current?.scrollTo({ x, animated: false });
  };

  const birthLabel = `사주 원국 · ${formatBirthDate(profile)} ${
    profile.hour === null ? '시간 모름' : formatTime(profile.hour, profile.minute ?? 0)
  }`;

  const [selected, setSelected] = useState<Pillar | null>(null);
  const [tab, setTab] = useState<'calc' | 'interpret'>('calc');

  const openSheet = (pillar: Pillar) => {
    setTab('calc');
    setSelected(pillar);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>만세력</Text>
        <PersonSwitcher />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hint}>
          <Icon name="search" size={14} color={colors.red} />
          <Text style={styles.hintText}>표와 대운·세운·월운을 눌러서 자세히 알아보세요</Text>
        </View>

        <View>
          <Text style={styles.sectionLabel}>{birthLabel}</Text>
          <Pressable onPress={() => setBasisOpen(true)} style={styles.basisRow}>
            <Text style={styles.basisText}>계산 기준 · {describeBasis(saju.basis)}</Text>
            <Icon name="chevronRight" size={12} color={colors.inkSoft} />
          </Pressable>
          <View style={styles.pillarRow}>
            {pillars.map((p) => {
              const isSelected = selected?.key === p.key;
              return (
                <Pressable key={p.key} onPress={() => openSheet(p)} style={[styles.pillarCell, isSelected && styles.pillarCellActive]}>
                  <Text style={[styles.pillarLabel, isSelected && { color: colors.red, fontWeight: '700' }]}>{p.label}</Text>
                  <View style={[styles.glyph, elementBox(p.stemElement)]}>
                    <Text style={[styles.glyphText, { color: ELEMENT_INK[p.stemElement] }]}>{p.stem}</Text>
                  </View>
                  <View style={[styles.glyph, elementBox(p.branchElement)]}>
                    <Text style={[styles.glyphText, { color: ELEMENT_INK[p.branchElement] }]}>{p.branch}</Text>
                  </View>
                  <Text style={[styles.pillarHangul, isSelected && { color: colors.red, fontWeight: '700' }]}>{p.hangul}</Text>
                </Pressable>
              );
            })}
            {!saju.hour && (
              <View style={[styles.pillarCell, { opacity: 0.55 }]}>
                <Text style={styles.pillarLabel}>시주</Text>
                <View style={[styles.glyph, { backgroundColor: colors.line }]}>
                  <Text style={[styles.glyphText, { color: colors.inkFaint }]}>?</Text>
                </View>
                <View style={[styles.glyph, { backgroundColor: colors.line }]}>
                  <Text style={[styles.glyphText, { color: colors.inkFaint }]}>?</Text>
                </View>
                <Text style={styles.pillarHangul}>모름</Text>
              </View>
            )}
          </View>
          {/* A quiet count of each 오행 in the chart, doubling as the color legend for the cells above. */}
          <View style={styles.elementLine}>
            {ELEMENT_ORDER.map((e) => (
              <View key={e} style={styles.elementItem}>
                <View style={[styles.dot, elementDot(e), !counts[e] && { opacity: 0.35 }]} />
                <Text style={[styles.elementLabel, !counts[e] && { color: colors.inkFaint }]}>
                  {ELEMENT_HANGUL[e]} {counts[e]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>대운 (10년 단위)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cycleRow}>
            {DAEUN.map((d) => (
              <Pressable key={d.age} onPress={() => openSheet(buildDaeun(saju, d.entry))} style={[styles.cycleChip, d.active && styles.cycleChipNow]}>
                <Text style={[styles.cycleTop, d.active && styles.cycleTopNow]}>{d.age}</Text>
                <Text style={styles.godText}>{d.ganGod}</Text>
                <GanZhiBoxes ganZhi={d.ganji} />
                <Text style={styles.godText}>{d.zhiGod}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View>
          <Text style={styles.sectionLabel}>세운 (연 단위)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cycleRow}>
            {SEUN.map((s) => (
              <Pressable
                key={s.year}
                onPress={() => {
                  setWolunYear(s.yearNum);
                  openSheet(buildSeun(saju, s.yearNum));
                }}
                style={[styles.cycleChip, s.active && styles.seunChipNow, s.yearNum === wolunYear && styles.cycleChipPicked]}
              >
                <Text style={[styles.cycleTop, s.active && { color: '#7a5a1f', fontWeight: '700' }]}>{s.year}</Text>
                <Text style={styles.godText}>{s.ganGod}</Text>
                <GanZhiBoxes ganZhi={s.ganji} />
                <Text style={styles.godText}>{s.zhiGod}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View>
          <Text style={styles.sectionLabel}>월운 ({wolunYear}년 · 절기 기준)</Text>
          <ScrollView
            ref={wolunScroll}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cycleRow}
            onContentSizeChange={scrollToActiveMonth}
          >
            {WOLUN.map((w) => (
              <Pressable
                key={w.entry.startMs}
                onPress={() => openSheet(buildWolun(saju, w.entry))}
                style={[styles.cycleChip, styles.wolunChip, w.active && styles.cycleChipNow]}
              >
                <Text style={[styles.cycleTop, w.active && styles.cycleTopNow]}>{w.entry.month}월</Text>
                <Text style={styles.godText}>{w.ganGod}</Text>
                <GanZhiBoxes ganZhi={w.ganji} />
                <Text style={styles.godText}>{w.zhiGod}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <CalcBasisSheet visible={basisOpen} onClose={() => setBasisOpen(false)} />

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelected(null)} />
        {selected && (
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.sheetSub}>{selected.label}</Text>
                <Text style={styles.sheetTitle}>
                  {selected.hangul} ({selected.stem}{selected.branch})
                </Text>
              </View>
              <Pressable onPress={() => setSelected(null)} hitSlop={12}>
                <Icon name="close" size={20} color="#a89a86" />
              </Pressable>
            </View>

            <View style={styles.seg}>
              <Pressable style={[styles.segItem, tab === 'calc' && styles.segItemActive]} onPress={() => setTab('calc')}>
                <Icon name="search" size={15} color={tab === 'calc' ? colors.red : colors.inkSoft} />
                <Text style={[styles.segText, tab === 'calc' && { color: colors.red }]}>계산근거</Text>
              </Pressable>
              <Pressable style={[styles.segItem, tab === 'interpret' && styles.segItemActive]} onPress={() => setTab('interpret')}>
                <Icon name="lightbulb" size={15} color={tab === 'interpret' ? colors.red : colors.inkSoft} />
                <Text style={[styles.segText, tab === 'interpret' && { color: colors.red }]}>해석</Text>
              </Pressable>
            </View>

            <View style={styles.explainBox}>
              <Mascot pose="analyzing" width={56} />
              <Text style={styles.explainText}>{tab === 'calc' ? selected.calcReason : selected.interpretation}</Text>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: 20, paddingBottom: 8 },
  topbarTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.redSoft, paddingVertical: 7, paddingHorizontal: 12, borderRadius: radius.pill },
  hintText: { fontFamily: fonts.body, fontSize: 12, color: colors.red },
  basisRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: -4, marginBottom: 10 },
  basisText: { fontFamily: fonts.body, fontSize: 11.5, color: colors.inkSoft },
  sectionLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, fontWeight: '700', marginBottom: 10 },
  pillarRow: { flexDirection: 'row', gap: 8 },
  pillarCell: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 4, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line },
  pillarCellActive: { borderColor: colors.red, backgroundColor: colors.redSoft },
  pillarLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft },
  glyph: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  glyphText: { fontFamily: fonts.display, fontSize: 18, fontWeight: '700' },
  pillarHangul: { fontFamily: fonts.body, fontSize: 10.5, color: colors.inkSoft },
  elementLine: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10 },
  elementItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  elementLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft },
  cycleRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  cycleChip: { minWidth: 56, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  // The current period is outlined rather than filled, so the element-colored boxes stay readable.
  cycleChipNow: { borderColor: colors.red, borderWidth: 1.5, backgroundColor: '#FDF2EE' },
  seunChipNow: { backgroundColor: '#FCF4E2', borderColor: '#EFD9A8' },
  cycleTop: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft },
  cycleTopNow: { color: colors.red, fontWeight: '700' },
  cycleChipPicked: { borderColor: '#d9b46a', borderWidth: 1.5 },
  wolunChip: { width: WOLUN_CHIP_WIDTH, minWidth: WOLUN_CHIP_WIDTH, paddingHorizontal: 2 },
  godText: { fontFamily: fonts.body, fontSize: 10, color: colors.inkSoft, marginTop: 3 },
  ganZhiBoxes: { gap: 4, marginTop: 5, marginBottom: 2 },
  miniGlyph: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  miniGlyphText: { fontFamily: fonts.display, fontSize: 15, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(59,42,29,0.45)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, paddingBottom: 32, gap: spacing.md },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 4 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetSub: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  sheetTitle: { fontFamily: fonts.display, fontSize: 19, color: colors.red, marginTop: 2 },
  seg: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 12, padding: 4, gap: 4 },
  segItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 9 },
  segItemActive: { backgroundColor: colors.white },
  segText: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: colors.inkSoft },
  explainBox: { flexDirection: 'row', gap: 10, backgroundColor: colors.bg, borderRadius: radius.lg, padding: 14 },
  explainText: { flex: 1, fontFamily: fonts.body, fontSize: 13.5, lineHeight: 21, color: colors.ink },
});
