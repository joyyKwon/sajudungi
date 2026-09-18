import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, radius, spacing, fonts } from '../../../theme';
import { Icon } from '../../../components/Icon';
import { Mascot } from '../../../components/Mascot';

type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  status: 'done' | 'active' | 'locked';
};

// title/subtitle here are real curriculum copy and can stay as-is (or move to a CMS later).
// MOCK: `status` (done/active/locked) must come from the signed-in user's per-lesson progress
// in Supabase, not be hardcoded — right now every user sees the same fake progress.
const LESSONS: Lesson[] = [
  { id: '1', title: '1강 · 사주란 무엇일까?', subtitle: '사주팔자의 기본 개념 이해하기', status: 'done' },
  { id: '2', title: '2강 · 천간, 하늘의 기운', subtitle: '갑을병정무기경신임계', status: 'done' },
  { id: '3', title: '3강 · 지지, 땅의 기운', subtitle: '자축인묘진사오미신유술해', status: 'active' },
  { id: '4', title: '4강 · 오행: 목화토금수', subtitle: '다섯 가지 기운의 상생상극', status: 'locked' },
  { id: '5', title: '5강 · 나의 일간 찾기', subtitle: '내 사주에서 일간 읽는 법', status: 'locked' },
  { id: '6', title: '6강 · 십신이란?', subtitle: '사주 해석의 핵심 열쇠', status: 'locked' },
];

export default function LessonList() {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>사주 공부</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressCard}>
          <Mascot pose="studying" width={60} />
          <View style={{ flex: 1 }}>
            <Text style={styles.progressLabel}>오늘도 한 걸음, 함께 배워볼까?</Text>
            {/* MOCK: "12/40" and the 30% fill are hardcoded — derive both from LESSONS status / real progress count. */}
            <View style={styles.progressBarRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '30%' }]} />
              </View>
              <Text style={styles.progressCount}>12/40</Text>
            </View>
          </View>
        </View>

        {/* MOCK: level tabs are static — only 입문 renders and there's no onPress/state to switch levels
            or filter LESSONS by level yet. */}
        <View style={styles.tabs}>
          <View style={[styles.tabPill, styles.tabPillActive]}>
            <Text style={[styles.tabPillText, { color: colors.white }]}>입문</Text>
          </View>
          <View style={styles.tabPill}>
            <Text style={styles.tabPillText}>초급</Text>
          </View>
          <View style={styles.tabPill}>
            <Text style={styles.tabPillText}>중급</Text>
          </View>
        </View>

        <View style={{ gap: 10 }}>
          {LESSONS.map((lesson) => {
            const locked = lesson.status === 'locked';
            const active = lesson.status === 'active';
            return (
              <Pressable
                key={lesson.id}
                disabled={locked}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
                style={[styles.row, active && styles.rowActive, locked && { opacity: 0.55 }]}
              >
                <View
                  style={[
                    styles.num,
                    lesson.status === 'done' && { backgroundColor: colors.amberDeep },
                    active && { backgroundColor: colors.red },
                    locked && { backgroundColor: '#F1E9DA' },
                  ]}
                >
                  {lesson.status === 'done' && <Icon name="check" size={16} color={colors.ink} strokeWidth={2.4} />}
                  {active && <Text style={styles.numText}>{lesson.id}</Text>}
                  {locked && <Icon name="lock" size={14} color="#9a917f" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{lesson.title}</Text>
                  <Text style={styles.rowSubtitle}>{lesson.subtitle}</Text>
                </View>
                {active && <Text style={styles.activeLabel}>진행중</Text>}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: 20, paddingBottom: 8 },
  headerTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg },
  progressCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.amberSoft, borderRadius: radius.lg, padding: spacing.lg },
  progressLabel: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: '#7a5a1f' },
  progressBarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 8 },
  progressTrack: { flex: 1, height: 6, backgroundColor: colors.white, borderRadius: radius.pill, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.red },
  progressCount: { fontFamily: fonts.body, fontSize: 11, color: '#7a5a1f', fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: spacing.sm },
  tabPill: { paddingVertical: 9, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  tabPillActive: { backgroundColor: colors.red, borderColor: colors.red },
  tabPillText: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: colors.inkSoft },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg },
  rowActive: { borderColor: colors.red, borderWidth: 2 },
  num: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: fonts.body, fontSize: 14, fontWeight: '700', color: colors.white },
  rowTitle: { fontFamily: fonts.body, fontSize: 14.5, fontWeight: '700', color: colors.ink },
  rowSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  activeLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.red, fontWeight: '700' },
});
