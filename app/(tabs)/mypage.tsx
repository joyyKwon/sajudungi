import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { colors, radius, spacing, fonts } from '../../theme';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';
import { CalcBasisSheet } from '../../components/CalcBasisSheet';
import { useProgress } from '../../context/ProgressContext';
import { useProfile, useRequiredMe, useMySaju } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { LESSONS } from '../../lib/lessons';
import { STORAGE_KEYS, removeKeys } from '../../lib/storage';
import { describeBasis, formatBirthDate, formatTime } from '../../lib/format';

export default function MyPage() {
  const profile = useRequiredMe();
  const saju = useMySaju();
  const { completed, resetProgress } = useProgress();
  const { resetProfile, people } = useProfile();
  const { session, email, signOut, requestAccountDeletion } = useAuth();
  const [basisOpen, setBasisOpen] = useState(false);

  const wipeDevice = () => {
    removeKeys([STORAGE_KEYS.consent]);
    resetProgress();
    resetProfile(); // route guards send the user back to the start screen
  };

  const confirmDelete = () =>
    Alert.alert(
      '내 정보를 삭제할까요?',
      session
        ? `내 정보${people.length > 1 ? `와 사주 목록에 저장한 ${people.length - 1}명` : ''}, 학습 진도, 설정이 이 기기에서 지워져요. 계정과 서버에 백업된 내용은 남아있고, 로그인하면 다시 받아올 수 있어요.`
        : `내 정보${people.length > 1 ? `와 사주 목록에 저장한 ${people.length - 1}명` : ''}, 학습 진도, 설정이 이 기기에서 모두 삭제돼요. 삭제한 정보는 되돌릴 수 없어요.`,
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: wipeDevice },
      ],
    );

  const confirmLogout = () =>
    Alert.alert('로그아웃할까요?', '이 기기에 남은 사주 목록과 학습 진도를 함께 지울까요? 계정의 내용은 그대로 남아요.', [
      { text: '취소', style: 'cancel' },
      { text: '기기 정보는 남기기', onPress: () => signOut(false) },
      { text: '기기 정보도 지우기', style: 'destructive', onPress: () => signOut(true) },
    ]);

  const confirmAccountDeletion = () =>
    Alert.alert(
      '계정을 삭제할까요?',
      '지금부터 30일 뒤에 서버에 저장된 사주 목록과 학습 진도가 완전히 삭제돼요. 그 안에 다시 로그인하면 삭제가 취소돼요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제 요청',
          style: 'destructive',
          onPress: () =>
            Alert.alert('이 기기의 정보도 지울까요?', '', [
              { text: '기기 정보는 남기기', onPress: () => requestAccountDeletion(false) },
              { text: '기기 정보도 지우기', style: 'destructive', onPress: () => requestAccountDeletion(true) },
            ]),
        },
      ],
    );

  const doneCount = LESSONS.filter((l) => completed.includes(l.id)).length;
  const birth = `${formatBirthDate(profile)} ${
    profile.hour === null ? '(시간 모름)' : formatTime(profile.hour, profile.minute ?? 0)
  }`;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <Mascot pose={saju.dayGanElement} width={72} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.name}님</Text>
            <Text style={styles.birth}>{birth}</Text>
            <Text style={styles.birthSub}>
              {profile.gender === 'female' ? '여성' : '남성'} · 일주 {saju.day.hangul}({saju.day.ganZhi})
            </Text>
          </View>
        </Card>

        <View style={styles.list}>
          <Row label="내 정보 수정" onPress={() => router.push('/info-input')} />
          <Row label="계산 기준" value={describeBasis(saju.basis)} onPress={() => setBasisOpen(true)} />
          <Row label="학습 진도" value={`${doneCount}/${LESSONS.length}`} onPress={() => router.push('/(tabs)/lessons')} last />
        </View>

        <View style={styles.list}>
          {session ? (
            <>
              <StaticRow label="계정" value={email ?? ""} />
              <Row label="로그아웃" onPress={confirmLogout} />
              <Row label="계정 삭제" onPress={confirmAccountDeletion} last />
            </>
          ) : (
            <Row label="로그인 / 회원가입" value="사주 목록을 백업할 수 있어요" onPress={() => router.push('/auth')} last />
          )}
        </View>

        <View style={styles.list}>
          <Row label="서비스 이용 안내" onPress={() => router.push('/legal/notice')} />
          <Row label="이용약관" onPress={() => router.push('/legal/terms')} />
          <Row label="개인정보처리방침" onPress={() => router.push('/legal/privacy')} />
          <Row label="내 정보 삭제" onPress={confirmDelete} last />
        </View>

        <Text style={styles.notice}>
          사주 해석은 관점에 따라 달라질 수 있는 참고용 콘텐츠예요. 재미로 즐겨주세요.
        </Text>
        <Text style={styles.version}>사주둥이 v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </ScrollView>

      <CalcBasisSheet visible={basisOpen} onClose={() => setBasisOpen(false)} />
    </SafeAreaView>
  );
}

function Row({ label, value, onPress, last }: { label: string; value?: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {!!value && (
          <Text style={styles.rowValue} numberOfLines={1}>
            {value}
          </Text>
        )}
        <Icon name="chevronRight" size={16} color="#cbbfae" />
      </View>
    </Pressable>
  );
}

/** A non-interactive row, e.g. showing the signed-in email — no chevron, since there's nothing to tap. */
function StaticRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: 20, paddingBottom: 8 },
  headerTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.amberSoft, borderWidth: 0 },
  name: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  birth: { fontFamily: fonts.body, fontSize: 13, color: colors.ink, marginTop: 4 },
  birthSub: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  list: { backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 16, paddingHorizontal: spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  rowLabel: { fontFamily: fonts.body, fontSize: 14.5, fontWeight: '700', color: colors.ink },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  rowValue: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, flexShrink: 1 },
  notice: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, lineHeight: 18, textAlign: 'center', paddingHorizontal: spacing.md },
  version: { fontFamily: fonts.body, fontSize: 11, color: colors.inkFaint, textAlign: 'center' },
});
