import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, fonts } from '../../theme';
import { Icon } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';

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

// MOCK: hardcoded for 서연님 · 1996-03-14 15:30. Replace all of PILLARS/ELEMENTS/DAEUN/SEUN
// with output from the real saju calculation engine (see project notes on manseryeok algorithm),
// keyed off the signed-in user's saved birth date/time/calendar-type.
const PILLARS: Pillar[] = [
  {
    key: 'year',
    label: '년주',
    stem: '丙',
    branch: '子',
    stemColor: colors.fire,
    branchColor: colors.water,
    hangul: '병자',
    calcReason: '년주는 태어난 \'해\'의 간지야. 서연님은 1996년에 태어났으니, 그해의 간지를 만세력에서 찾아보면 병자(丙子)가 나와!',
    interpretation: '병자년생은 밝고 따뜻한 기운을 타고났어요. 주변을 환하게 만드는 매력이 있어요.',
  },
  {
    key: 'month',
    label: '월주',
    stem: '辛',
    branch: '卯',
    stemColor: '#7a7a7a',
    branchColor: colors.wood,
    hangul: '신묘',
    calcReason: '월주는 태어난 \'달\'의 간지야. 3월은 절기상 묘월에 해당해서, 그 달의 천간과 합쳐 신묘(辛卯)가 나와!',
    interpretation: '신묘월생은 섬세하고 계획적인 편이에요. 꼼꼼하게 준비하는 걸 좋아해요.',
  },
  {
    key: 'day',
    label: '일주',
    stem: '甲',
    branch: '子',
    stemColor: colors.wood,
    branchColor: colors.water,
    hangul: '갑자',
    calcReason: '일주는 태어난 \'날\'의 간지야. 서연님은 1996년 3월 14일에 태어났으니, 그날의 일진을 만세력에서 찾아보면 갑자(甲子)가 나와!',
    interpretation: '갑자 일주는 큰 나무처럼 곧고 자라나려는 기운이 강해요. 리더십이 있고 새로운 일을 시작하는 데 두려움이 없는 편이에요.',
  },
  {
    key: 'hour',
    label: '시주',
    stem: '庚',
    branch: '午',
    stemColor: '#7a7a7a',
    branchColor: colors.fire,
    hangul: '경오',
    calcReason: '시주는 태어난 \'시각\'의 간지야. 오후 3시 30분은 신시(申時) 근처인데, 일간과 조합하면 경오(庚午)가 나와!',
    interpretation: '경오시생은 추진력이 좋고 결단이 빨라요. 마음먹은 건 바로 실행에 옮기는 타입이에요.',
  },
];

const ELEMENTS = [
  { label: '목 · 성장', color: colors.wood },
  { label: '화 · 열정', color: colors.fire },
  { label: '토 · 안정', color: colors.earth },
  { label: '금 · 결실', color: colors.metal },
  { label: '수 · 지혜', color: colors.water },
];

const DAEUN = [
  { age: '3세', ganji: '壬寅' },
  { age: '13세', ganji: '癸卯' },
  { age: '23세', ganji: '甲辰', active: true },
  { age: '33세', ganji: '乙巳' },
  { age: '43세', ganji: '丙午' },
];

const SEUN = [
  { year: '2024', ganji: '甲辰' },
  { year: '2025', ganji: '乙巳' },
  { year: '2026', ganji: '丙午', active: true },
  { year: '2027', ganji: '丁未' },
];

export default function Manseryeok() {
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
        <Icon name="info" size={20} color="#6b5a45" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hint}>
          <Icon name="search" size={14} color={colors.red} />
          <Text style={styles.hintText}>표를 눌러서 자세히 알아보세요</Text>
        </View>

        <View>
          {/* MOCK: hardcoded birth info label, tied to the PILLARS mock above. */}
          <Text style={styles.sectionLabel}>사주 원국 · 1996년 3월 14일 오후 3:30</Text>
          <View style={styles.pillarRow}>
            {PILLARS.map((p) => {
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
