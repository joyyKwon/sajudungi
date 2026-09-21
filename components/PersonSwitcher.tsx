import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { router } from 'expo-router';
import { colors, radius, spacing, fonts } from '../theme';
import { Icon } from './Icon';
import { PersonAvatar } from './PersonAvatar';
import { useProfile } from '../context/ProfileContext';
import { Person, recentPeople } from '../lib/people';
import { summarizePerson } from '../lib/personSummary';

const QUICK_COUNT = 3;

/**
 * Header chip showing whose chart the app is showing, plus the bottom sheet to
 * switch person. The chip gets a red ring while someone other than "나" is chosen.
 */
export function PersonSwitcher() {
  const { people, me, profile, activeId, options, setActive } = useProfile();
  const [open, setOpen] = useState(false);
  if (!profile || !me) return null;

  const viewingOther = !profile.isSelf;
  const quick = recentPeople(people, QUICK_COUNT);
  // Keep the chosen person visible even if they are not among the most recent.
  if (viewingOther && !quick.some((p) => p.id === profile.id)) quick.splice(QUICK_COUNT - 1, 1, profile);
  const rows: Person[] = [me, ...quick];
  const othersCount = people.length - 1;

  const pick = (p: Person) => {
    setActive(p.isSelf ? null : p.id);
    setOpen(false);
  };
  const go = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${profile.name}, 사주 바꾸기`}
        style={[styles.chip, viewingOther && styles.chipOther]}
      >
        <View style={[styles.chipDot, profile.isSelf ? styles.dotMe : styles.dotOther]}>
          <Text style={[styles.chipDotText, profile.isSelf && { color: colors.white }]}>{profile.isSelf ? '나' : profile.relation}</Text>
        </View>
        <Text style={styles.chipName} numberOfLines={1}>
          {profile.name}
        </Text>
        <Icon name="chevronDown" size={16} color={colors.inkSoft} strokeWidth={2} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>누구의 사주를 볼까요?</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={12}>
              <Icon name="close" size={20} color="#a89a86" />
            </Pressable>
          </View>

          <View style={{ gap: 2 }}>
            {rows.map((p) => {
              const selected = p.id === profile.id;
              const s = summarizePerson(p, options);
              return (
                <Pressable key={p.id} onPress={() => pick(p)} style={[styles.sheetRow, selected && styles.sheetRowOn]}>
                  <PersonAvatar name={p.name} summary={s} size={40} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.rowName}>
                      <Text style={styles.sheetName} numberOfLines={1}>
                        {p.name}
                      </Text>
                      <View style={[styles.tag, p.isSelf && styles.tagMe]}>
                        <Text style={[styles.tagText, p.isSelf && { color: colors.white }]}>{p.isSelf ? '나' : p.relation}</Text>
                      </View>
                    </View>
                    {s && (
                      <Text style={styles.sheetSub}>
                        {s.iljuHangul}({s.iljuHanja})일주
                      </Text>
                    )}
                  </View>
                  {selected ? (
                    <Icon name="check" size={20} color={colors.red} />
                  ) : p.favorite ? (
                    <Icon name="starFilled" size={18} color={colors.amberDeep} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {othersCount > QUICK_COUNT && (
            <Pressable onPress={() => go(() => router.navigate('/(tabs)/people'))} style={styles.allRow}>
              <Text style={styles.allText}>사주 목록 전체 보기 ({people.length}명)</Text>
              <Icon name="chevronRight" size={16} color={colors.red} />
            </Pressable>
          )}
          {othersCount === 0 && <Text style={styles.emptyHint}>가족이나 친구의 사주도 저장해서 바꿔 볼 수 있어요.</Text>}

          <Pressable onPress={() => go(() => router.push({ pathname: '/info-input', params: { add: '1' } }))} style={styles.addBtn}>
            <Icon name="plus" size={18} color={colors.red} strokeWidth={2.4} />
            <Text style={styles.addText}>추가</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.white, borderRadius: radius.pill, paddingVertical: 6, paddingLeft: 6, paddingRight: 12, maxWidth: 190 },
  // Only the ring changes when viewing someone else; colors stay the same.
  chipOther: { borderWidth: 2, borderColor: colors.red, paddingVertical: 5.5, paddingLeft: 5.5, paddingRight: 11.5 },
  chipDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  dotMe: { backgroundColor: colors.red },
  dotOther: { backgroundColor: colors.amberSoft },
  chipDotText: { fontFamily: fonts.body, fontSize: 11, fontWeight: '700', color: '#7a5a1f' },
  chipName: { fontFamily: fonts.body, fontSize: 14, fontWeight: '700', color: colors.ink, flexShrink: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(59,42,29,0.45)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, paddingBottom: 32, gap: 10 },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 4 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, paddingHorizontal: 12, borderRadius: radius.md },
  sheetRowOn: { backgroundColor: colors.redSoft },
  rowName: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sheetName: { fontFamily: fonts.body, fontSize: 15, fontWeight: '700', color: colors.ink, flexShrink: 1 },
  sheetSub: { fontFamily: fonts.body, fontSize: 11.5, color: colors.inkSoft },
  tag: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: radius.pill, backgroundColor: colors.amberSoft },
  tagMe: { backgroundColor: colors.red },
  tagText: { fontFamily: fonts.body, fontSize: 11, fontWeight: '700', color: '#7a5a1f' },
  allRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingVertical: 4 },
  allText: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: colors.red },
  emptyHint: { fontFamily: fonts.body, fontSize: 12.5, color: colors.inkSoft, paddingHorizontal: 4 },
  addBtn: { height: 50, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.red, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addText: { fontFamily: fonts.body, fontSize: 15, fontWeight: '700', color: colors.red },
});
