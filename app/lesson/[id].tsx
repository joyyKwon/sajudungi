import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, radius, spacing, fonts } from '../../theme';
import { Icon } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';

const CHEONGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// MOCK: only lessons 1-3 have real content, and each is a single static card (no multi-step
// swipe-through card-news yet — see the `progress` segbar, which currently just marks "this
// lesson's index" rather than "current card within the lesson"). Content for lessons 4-6 falls
// back to lesson 2's copy below. Replace with the full curriculum (ideally from a CMS/DB so
// non-engineers can edit lesson text) and real per-lesson card sequences.
const LESSON_CONTENT: Record<string, { title: string; body: string; progress: number }> = {
  '1': { title: '사주란 무엇일까?', body: '태어난 순간의 하늘과 땅의 기운을 4개의 기둥으로 읽는 것, 그게 바로 사주예요.', progress: 1 },
  '2': {
    title: '천간이 뭐예요?',
    body: '하늘의 기운을 나타내는 10개의 글자예요.\n마치 알파벳처럼 순서가 있고, 이 순서대로\n내 사주의 각 기둥에 하나씩 들어가요.',
    progress: 2,
  },
  '3': { title: '지지, 땅의 기운', body: '땅의 기운을 나타내는 12개의 글자예요. 띠를 나타내는 동물들이 바로 지지랍니다.', progress: 3 },
};

export default function LessonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = LESSON_CONTENT[id ?? '2'] ?? LESSON_CONTENT['2'];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.topRow}>
        <View style={styles.segbar}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={[styles.seg, i < lesson.progress && styles.segDone]} />
          ))}
        </View>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Icon name="close" size={20} color="#6b5a45" />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Mascot pose="studying" width={200} />

        <View>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.description}>{lesson.body}</Text>
        </View>

        {id === '2' && (
          <View style={styles.grid}>
            {CHEONGAN.map((c) => (
              <View key={c} style={styles.chip}>
                <Text style={styles.chipText}>{c}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* MOCK: "다음"/"건너뛰기" both just go back to the list. Needs real multi-card navigation
          within a lesson, and "다음" on the last card should mark the lesson done (updating
          LESSONS status/progress in Supabase) before returning. */}
      <View style={styles.footer}>
        <Pressable style={styles.nextButton} onPress={() => router.back()}>
          <Text style={styles.nextButtonText}>다음</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.amberSoft, paddingHorizontal: spacing.xl, paddingTop: 16, paddingBottom: 28 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  segbar: { flex: 1, flexDirection: 'row', gap: 5 },
  seg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(178,58,34,0.18)' },
  segDone: { backgroundColor: colors.red },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26 },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.red, textAlign: 'center' },
  description: { fontFamily: fonts.body, fontSize: 14.5, color: colors.inkSoft, marginTop: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%', justifyContent: 'center' },
  chip: { width: '17.5%', paddingVertical: 8, borderRadius: 10, backgroundColor: colors.white, alignItems: 'center' },
  chipText: { fontFamily: fonts.display, fontSize: 16, fontWeight: '700', color: colors.red },
  footer: { gap: spacing.md },
  nextButton: { backgroundColor: colors.amberDeep, borderRadius: radius.lg, height: 54, alignItems: 'center', justifyContent: 'center' },
  nextButtonText: { fontFamily: fonts.body, fontSize: 16, fontWeight: '700', color: colors.ink },
  skipText: { textAlign: 'center', fontFamily: fonts.body, fontSize: 12.5, color: colors.inkSoft },
});
