import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, radius, spacing, fonts } from '../../theme';
import { Card } from '../../components/Card';
import { Icon, IconName } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';
import { useProfile } from '../../context/ProfileContext';

type MenuItem = {
  icon: IconName;
  title: string;
  subtitle: string;
  badge?: { label: string; tone: 'new' | 'soon' };
  disabled?: boolean;
  onPress?: () => void;
};

const MENU: MenuItem[] = [
  { icon: 'book', title: '사주풀이', subtitle: '내 사주팔자 기본 해석 보기', onPress: () => router.push('/saju-result') },
  { icon: 'calendar', title: '만세력', subtitle: '원국표, 대운·세운 상세 보기', onPress: () => router.push('/(tabs)/manseryeok') },
  { icon: 'book', title: '사주공부', subtitle: '사주둥이와 기초부터 배워요', badge: { label: 'NEW', tone: 'new' }, onPress: () => router.push('/(tabs)/lessons') },
  { icon: 'user', title: '궁합', subtitle: '우리 둘의 인연 알아보기', badge: { label: '준비중', tone: 'soon' }, disabled: true },
  { icon: 'calendar', title: '토정비결', subtitle: '2026년 신년운세', badge: { label: '준비중', tone: 'soon' }, disabled: true },
];

export default function Home() {
  const { profile } = useProfile();

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>안녕하세요</Text>
          <Text style={styles.name}>{profile?.name}님</Text>
        </View>
        <View style={styles.headerIcons}>
          <Icon name="bell" size={22} color="#6b5a45" />
          <Icon name="user" size={22} color="#6b5a45" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* MOCK: static copy. Replace with a real daily message generated from the user's saju (rotate daily). */}
        <View style={[styles.mascotCard]}>
          <Mascot pose="front" width={52} />
          <View style={{ flex: 1 }}>
            <Text style={styles.mascotLabel}>오늘의 한마디</Text>
            <Text style={styles.mascotText}>
              오늘은 미뤄뒀던 연락을 해보기 좋은 날이야. 작은 인연이 큰 기쁨이 될 수 있어!
            </Text>
          </View>
        </View>

        {/* MOCK: static fortune text/stars. Replace with real daily-fortune calculation, and wire "자세히 보기" to a real destination. */}
        <Card>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>오늘의 운세</Text>
            <Text style={styles.link}>자세히 보기 &gt;</Text>
          </View>
          <Text style={styles.cardBody}>
            전체운 ★★★★☆ · 재물운 ★★★☆☆{'\n'}대인관계에서 좋은 소식이 들려오는 하루예요.
          </Text>
        </Card>

        <View>
          <Text style={styles.sectionTitle}>무엇을 도와줄까요?</Text>
          {MENU.map((item, i) => (
            <Pressable
              key={item.title}
              onPress={item.onPress}
              disabled={item.disabled}
              style={[styles.menuRow, i < MENU.length - 1 && styles.menuRowBorder, item.disabled && { opacity: 0.5 }]}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.disabled ? '#F1E9DA' : item.badge?.tone === 'new' ? colors.redSoft : colors.amberSoft }]}>
                <Icon name={item.icon} size={22} color={item.disabled ? '#9a917f' : item.badge?.tone === 'new' ? '#8a2a12' : '#8a5a12'} />
              </View>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                {item.badge && (
                  <View style={[styles.badge, { backgroundColor: item.badge.tone === 'new' ? colors.amberDeep : '#F1E9DA' }]}>
                    <Text style={[styles.badgeText, { color: item.badge.tone === 'new' ? colors.ink : colors.inkSoft }]}>
                      {item.badge.label}
                    </Text>
                  </View>
                )}
              </View>
              {!item.disabled && <Icon name="chevronRight" size={16} color="#cbbfae" />}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: 22, paddingBottom: 10 },
  greeting: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  name: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginTop: 2 },
  headerIcons: { flexDirection: 'row', gap: 14 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg },
  mascotCard: {
    backgroundColor: colors.amberSoft,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  mascotLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.red, fontWeight: '700', marginBottom: 4 },
  mascotText: { fontFamily: fonts.body, fontSize: 13.5, color: colors.ink, lineHeight: 19 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  link: { fontFamily: fonts.body, fontSize: 12, color: colors.red, fontWeight: '700' },
  cardBody: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginTop: 8, lineHeight: 19 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.ink, marginBottom: 6, paddingHorizontal: 6 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 6 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  menuIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { fontFamily: fonts.body, fontSize: 14.5, fontWeight: '700', color: colors.ink },
  menuSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: radius.pill },
  badgeText: { fontFamily: fonts.body, fontSize: 10.5, fontWeight: '700' },
});
