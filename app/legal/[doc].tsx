import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, spacing, fonts } from '../../theme';
import { Icon } from '../../components/Icon';
import { LEGAL_DOCS, LegalDocId } from '../../lib/legal';

export default function LegalDocScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const legal = LEGAL_DOCS[doc as LegalDocId] ?? LEGAL_DOCS.notice;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Icon name="back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.topbarTitle}>{legal.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!!legal.intro && <Text style={styles.intro}>{legal.intro}</Text>}
        {legal.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.body.map((line, i) => (
              <Text key={i} style={styles.body}>
                {line}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: spacing.xl, paddingTop: 20, paddingBottom: 8 },
  topbarTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.xl },
  intro: { fontFamily: fonts.body, fontSize: 13.5, color: colors.inkSoft, lineHeight: 21 },
  section: { gap: 6 },
  heading: { fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, lineHeight: 20 },
});
