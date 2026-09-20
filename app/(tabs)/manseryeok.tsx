import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, fonts } from '../../theme';
import { Icon } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';
import { Profile, useRequiredProfile, useSaju } from '../../context/ProfileContext';
import { CalcBasisSheet } from '../../components/CalcBasisSheet';
import { Pillar as EnginePillar, SajuResult, WuXing } from '../../lib/saju';
import { ELEMENT_KO, ELEMENT_TRAIT } from '../../lib/sajuContent';
import { describeBasis, formatTime } from '../../lib/format';

type Pillar = {
  key: string;
  label: string;
  stem: string;
  branch: string;
  stemColor: string;
  branchColor: string;
  hangul: string;
  calcReason: string;
  interpretation: string;
};

const ELEMENT_COLOR: Record<WuXing, string> = {
  wood: colors.wood,
  fire: colors.fire,
  earth: colors.earth,
  metal: colors.metal,
  water: colors.water,
};

const ELEMENTS = [
  { label: '목 · 성장', color: colors.wood },
  { label: '화 · 열정', color: colors.fire },
  { label: '토 · 안정', color: colors.earth },
  { label: '금 · 결실', color: colors.metal },
  { label: '수 · 지혜', color: colors.water },
];

function buildPillars(profile: Profile, saju: SajuResult): Pillar[] {
  const who = `${profile.name}님`;
  const calLabel = profile.calendarType === 'lunar' ? '음력 ' : '';

  const toUi = (key: string, label: string, p: EnginePillar, calcReason: string): Pillar => ({
    key,
    label,
    stem: p.gan,
    branch: p.zhi,
    stemColor: ELEMENT_COLOR[p.ganElement],
    branchColor: ELEMENT_COLOR[p.zhiElement],
    hangul: p.hangul,
    calcReason,
    interpretation: `${p.hangul}(${p.ganZhi})의 천간은 ${ELEMENT_KO[p.ganElement]} 기운이에요. ${ELEMENT_TRAIT[p.ganElement]}`,
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
      `일주는 태어난 '날'의 간지야. ${who}이 태어난 ${calLabel}${profile.year}년 ${profile.month}월 ${profile.day}일의 일진을 만세력에서 찾아보면 ${saju.day.hangul}(${saju.day.ganZhi})가 나와!`,
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

export default function Manseryeok() {
  const profile = useRequiredProfile();
  const saju = useSaju();
  const [basisOpen, setBasisOpen] = useState(false);
  const pillars = useMemo(() => buildPillars(profile, saju), [profile, saju]);

  const currentYear = new Date().getFullYear();
  const DAEUN = saju.daeun.slice(0, 9).map((d) => ({
    age: `${d.startAge}세`,
    ganji: d.ganZhi,
    active: currentYear >= d.startYear && currentYear <= d.endYear,
  }));
  const SEUN = saju.seun.map((s) => ({
    year: String(s.year),
    ganji: s.ganZhi,
    active: s.year === currentYear,
  }));

  const birthLabel = `사주 원국 · ${profile.calendarType === 'lunar' ? '음력 ' : ''}${profile.year}년 ${profile.month}월 ${profile.day}일 ${
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
        <Pressable onPress={() => setBasisOpen(true)} hitSlop={12}>
          <Icon name="info" size={20} color="#6b5a45" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hint}>
          <Icon name="search" size={14} color={colors.red} />
          <Text style={styles.hintText}>표를 눌러서 자세히 알아보세요</Text>
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
                  <View style={[styles.glyph, { backgroundColor: p.stemColor + '38' }]}>
                    <Text style={[styles.glyphText, { color: p.stemColor }]}>{p.stem}</Text>
                  </View>
                  <View style={[styles.glyph, { backgroundColor: p.branchColor + '38' }]}>
                    <Text style={[styles.glyphText, { color: p.branchColor }]}>{p.branch}</Text>
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
        </View>

        <View style={styles.elementsCard}>
          <Mascot pose="elements" width={88} />
          <View style={{ gap: 5 }}>
            {ELEMENTS.map((e) => (
              <View key={e.label} style={styles.elementRow}>
                <View style={[styles.dot, { backgroundColor: e.color }]} />
                <Text style={styles.elementLabel}>{e.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>대운 (10년 단위)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cycleRow}>
            {DAEUN.map((d) => (
              <View key={d.age} style={[styles.cycleChip, d.active && styles.cycleChipActive]}>
                <Text style={[styles.cycleTop, d.active && { color: colors.redSoft }]}>{d.age}</Text>
                <Text style={[styles.cycleGanji, d.active && { color: colors.white }]}>{d.ganji}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View>
          <Text style={styles.sectionLabel}>세운 (연 단위)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cycleRow}>
            {SEUN.map((s) => (
              <View key={s.year} style={[styles.cycleChip, s.active && { backgroundColor: colors.amberSoft, borderColor: colors.amberSoft }]}>
                <Text style={[styles.cycleTop, s.active && { color: '#7a5a1f', fontWeight: '700' }]}>{s.year}</Text>
                <Text style={styles.cycleGanji}>{s.ganji}</Text>
              </View>
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
  elementsCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.amberSoft, borderRadius: radius.lg, padding: 12 },
  elementRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  elementLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft },
  cycleRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  cycleChip: { minWidth: 56, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  cycleChipActive: { backgroundColor: colors.red, borderColor: colors.red },
  cycleTop: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft },
  cycleGanji: { fontFamily: fonts.display, fontSize: 15, marginTop: 4, color: colors.ink },
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
