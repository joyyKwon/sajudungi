import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fonts } from '../../theme';
import { Mascot } from '../../components/Mascot';

// MOCK: entire screen is a placeholder stub — no profile data, edit form, saved-record list,
// or logout wired up yet.
export default function MyPage() {
  return (
    <View style={styles.screen}>
      <Mascot pose="front" width={90} />
      <Text style={styles.title}>마이페이지</Text>
      <Text style={styles.subtitle}>내 정보 수정, 저장한 기록은{'\n'}다음 업데이트에서 만나요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xxl },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginTop: spacing.sm },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, textAlign: 'center', lineHeight: 20 },
});
