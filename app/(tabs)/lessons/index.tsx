import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, radius, spacing, fonts } from '../../../theme';
import { Icon } from '../../../components/Icon';
import { Mascot } from '../../../components/Mascot';
import { useProgress } from '../../../context/ProgressContext';
import { LESSONS } from '../../../lib/lessons';

export default function LessonList() {
  const { completed } = useProgress();
  const total = LESSONS.length;
  const doneCount = LESSONS.filter((l) => completed.includes(l.id)).length;
  const activeId = LESSONS.find((l) => !completed.includes(l.id))?.id;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>사주 공부</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressCard}>
          <Mascot pose="studying" width={60} />
          <View style={{ flex: 1 }}>
            <Text style={styles.progressLabel}>
              {doneCount === total ? '입문 과정을 모두 마쳤어! 대단해!' : '오늘도 한 걸음, 함께 배워볼까?'}
            </Text>
            <View style={styles.progressBarRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${(doneCount / total) * 100}%` }]} />
              </View>
              <Text style={styles.progressCount}>
                {doneCount}/{total}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.levelRow}>
          <View style={styles.levelPill}>
            <Text style={styles.levelPillText}>입문</Text>
          </View>
          <Text style={styles.levelNote}>초급·중급 과정은 준비 중이에요</Text>
        </View>

        <View style={{ gap: 10 }}>
          {LESSONS.map((lesson) => {
            const done = completed.includes(lesson.id);
            const active = lesson.id === activeId;
            const locked = !done && !active;
            return (
              <Pressable
                key={lesson.id}
                disabled={locked}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
                style={[styles.row, active && styles.rowActive, locked && { opacity: 0.55 }]}
              >
                <View style={[styles.num, done && { backgroundColor: colors.amberDeep }, active && { backgroundColor: colors.red }, locked && { backgroundColor: '#F1E9DA' }]}>
                  {done && <Icon name="check" size={16} color={colors.ink} strokeWidth={2.4} />}
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
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  levelPill: { paddingVertical: 9, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.red },
  levelPillText: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: colors.white },
  levelNote: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg },
  rowActive: { borderColor: colors.red, borderWidth: 2 },
  num: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: fonts.body, fontSize: 14, fontWeight: '700', color: colors.white },
  rowTitle: { fontFamily: fonts.body, fontSize: 14.5, fontWeight: '700', color: colors.ink },
  rowSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  activeLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.red, fontWeight: '700' },
});
