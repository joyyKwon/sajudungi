import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, radius, spacing, fonts } from '../../theme';
import { Icon } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';
import { useProgress } from '../../context/ProgressContext';
import { useProfile, useMySaju } from '../../context/ProfileContext';
import { useContent } from '../../context/ContentContext';
import { LESSONS } from '../../lib/lessons';
import { resolveCard } from '../../lib/lessonCards';

export default function LessonDetailScreen() {
  const { me } = useProfile();
  return me ? <LessonDetail /> : null;
}

function LessonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = LESSONS.find((l) => l.id === id) ?? LESSONS[0];
  const { markDone } = useProgress();
  const saju = useMySaju(); // lesson cards talk about "내 사주", whoever is being viewed elsewhere
  useContent(); // re-render when server text updates
  const [index, setIndex] = useState(0);

  const card = lesson.cards[index];
  const { body, chips } = resolveCard(card, saju);
  const isLast = index === lesson.cards.length - 1;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.topRow}>
        <View style={styles.segbar}>
          {lesson.cards.map((_, i) => (
            <View key={i} style={[styles.seg, i <= index && styles.segDone]} />
          ))}
        </View>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Icon name="close" size={20} color="#6b5a45" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Mascot pose="studying" width={chips && chips.length > 5 ? 130 : 170} />

        <View>
          <Text style={styles.lessonTag}>{lesson.title}</Text>
          <Text style={styles.title}>{card.title}</Text>
          <Text style={styles.description}>{body}</Text>
        </View>

        {chips && (
          <View style={styles.grid}>
            {chips.map((c, i) => (
              <View key={`${c.glyph}-${i}`} style={styles.chip}>
                <Text style={styles.chipGlyph}>{c.glyph}</Text>
                {!!c.caption && <Text style={styles.chipCaption}>{c.caption}</Text>}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.nextButton}
          onPress={() => {
            if (isLast) {
              markDone(lesson.id);
              router.back();
            } else {
              setIndex((i) => i + 1);
            }
          }}
        >
          <Text style={styles.nextButtonText}>{isLast ? '완료' : '다음'}</Text>
        </Pressable>
        <View style={styles.footerRow}>
          {index > 0 ? (
            <Pressable onPress={() => setIndex((i) => i - 1)}>
              <Text style={styles.skipText}>이전</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable onPress={() => router.back()}>
            <Text style={styles.skipText}>나중에 하기</Text>
          </Pressable>
        </View>
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
  body: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 22, paddingVertical: spacing.lg },
  lessonTag: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, textAlign: 'center', marginBottom: 8 },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.red, textAlign: 'center' },
  description: { fontFamily: fonts.body, fontSize: 14.5, color: colors.inkSoft, marginTop: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%', justifyContent: 'center' },
  chip: { minWidth: '17.5%', paddingVertical: 8, paddingHorizontal: 6, borderRadius: 10, backgroundColor: colors.white, alignItems: 'center' },
  chipGlyph: { fontFamily: fonts.display, fontSize: 16, fontWeight: '700', color: colors.red },
  chipCaption: { fontFamily: fonts.body, fontSize: 10, color: colors.inkSoft, marginTop: 2, textAlign: 'center' },
  footer: { gap: spacing.md },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.sm },
  nextButton: { backgroundColor: colors.amberDeep, borderRadius: radius.lg, height: 54, alignItems: 'center', justifyContent: 'center' },
  nextButtonText: { fontFamily: fonts.body, fontSize: 16, fontWeight: '700', color: colors.ink },
  skipText: { fontFamily: fonts.body, fontSize: 12.5, color: colors.inkSoft },
});
