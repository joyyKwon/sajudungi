import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, radius, spacing, fonts } from '../../theme';
import { Card } from '../../components/Card';
import { Icon, IconName } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';
import { useProfile, useSaju } from '../../context/ProfileContext';
import { PersonSwitcher } from '../../components/PersonSwitcher';
import { dailyFlow } from '../../lib/daily';
import { useContent } from '../../context/ContentContext';

type MenuItem = {
  icon: IconName;
  title: string;
  subtitle: string;
  badge?: { label: string; tone: 'new' | 'soon' };
  disabled?: boolean;
  onPress?: () => void;
};

const buildMenu = (subject: string): MenuItem[] => [
  { icon: 'book', title: '사주풀이', subtitle: `${subject} 사주팔자 기본 해석 보기`, onPress: () => router.push('/saju-result') },
  { icon: 'calendar', title: '만세력', subtitle: '원국표, 대운·세운 상세 보기', onPress: () => router.push('/(tabs)/manseryeok') },
  { icon: 'book', title: '사주공부', subtitle: '사주둥이와 기초부터 배워요', badge: { label: 'NEW', tone: 'new' }, onPress: () => router.push('/(tabs)/lessons') },
  { icon: 'user', title: '궁합', subtitle: '우리 둘의 인연 알아보기', badge: { label: '준비중', tone: 'soon' }, disabled: true },
  { icon: 'calendar', title: '토정비결', subtitle: '2026년 신년운세', badge: { label: '준비중', tone: 'soon' }, disabled: true },
];

export default function Home() {
  const { profile, options } = useProfile();
  const saju = useSaju();
  const todayKey = new Date().toDateString();
  const flow = useMemo(() => dailyFlow(saju, options), [saju, options, todayKey]);
  const { content } = useContent();
  const god = content.TEN_GODS[flow.god];
  const own = profile!.isSelf;
  const MENU = buildMenu(own ? '내' : `${profile!.name}님의`);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.greeting}>{own ? '안녕하세요' : '보고 있는 사주'}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {profile!.name}님
          </Text>
        </View>
        <PersonSwitcher />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.mascotCard]}>
          <Mascot pose={saju.dayGanElement} width={56} />
          <View style={{ flex: 1 }}>
            <Text style={styles.mascotLabel}>오늘의 한마디</Text>
            <Text style={styles.mascotText}>{god.today}</Text>
          </View>
        </View>

        <Card>
          <Text style={styles.cardTitle}>오늘의 일진</Text>
          <Text style={styles.flowHeadline}>
            {flow.pillar.hangul}({flow.pillar.ganZhi})일 · {flow.god}({god.hanja})의 날
          </Text>
          <Text style={styles.cardBody}>{god.meaning}</Text>
          <Text style={styles.flowBasis}>
            {own ? '내' : `${profile!.name}님의`} 일간 {saju.dayGan} 기준으로 오늘의 천간 {flow.pillar.gan}은 {flow.god}이에요
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
  flowHeadline: { fontFamily: fonts.body, fontSize: 15, fontWeight: '700', color: colors.red, marginTop: 10 },
  flowBasis: { fontFamily: fonts.body, fontSize: 11.5, color: colors.inkFaint, marginTop: 8 },
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
