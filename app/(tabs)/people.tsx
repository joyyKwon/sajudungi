import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, radius, spacing, fonts } from '../../theme';
import { Icon } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';
import { PersonAvatar } from '../../components/PersonAvatar';
import { useProfile } from '../../context/ProfileContext';
import { Person, Relation, RELATIONS, SortMode, groupPeople, relationCounts } from '../../lib/people';
import { shortBirthDate, summarizePerson } from '../../lib/personSummary';

const SORT_LABEL: Record<SortMode, string> = { recent: '최근 본 순', name: '이름순' };

export default function PeopleScreen() {
  const { people, me, activeId, options, setActive, toggleFavorite, removePerson } = useProfile();
  const [query, setQuery] = useState('');
  const [relation, setRelation] = useState<Relation | null>(null);
  const [sort, setSort] = useState<SortMode>('recent');
  const [editing, setEditing] = useState(false);

  const groups = useMemo(() => groupPeople(people, { query, relation, sort }), [people, query, relation, sort]);
  const summaries = useMemo(() => new Map(people.map((p) => [p.id, summarizePerson(p, options)])), [people, options]);
  const counts = relationCounts(people);
  const filtering = query.trim() !== '' || relation !== null;
  const others = people.filter((p) => !p.isSelf);
  const nothingFound = filtering && groups.favorites.length === 0 && groups.others.length === 0;

  const open = (p: Person) => {
    setActive(p.isSelf ? null : p.id);
    router.navigate('/(tabs)');
  };
  const edit = (p: Person) => (p.isSelf ? router.push('/info-input') : router.push({ pathname: '/info-input', params: { id: p.id } }));
  const confirmRemove = (p: Person) =>
    Alert.alert(`${p.name}님을 삭제할까요?`, '저장된 정보와 메모가 이 기기에서 삭제돼요. 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => removePerson(p.id) },
    ]);

  const renderRow = (p: Person, last: boolean) => {
    const s = summaries.get(p.id) ?? null;
    const isActive = (activeId ?? me?.id) === p.id;
    return (
      <Pressable key={p.id} onPress={() => (editing ? edit(p) : open(p))} style={[styles.row, last && { borderBottomWidth: 0 }, isActive && styles.rowActive]}>
        <PersonAvatar name={p.name} summary={s} />
        <View style={{ flex: 1, gap: 3 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {p.name}
            </Text>
            <View style={[styles.tag, p.isSelf && styles.tagMe]}>
              <Text style={[styles.tagText, p.isSelf && { color: colors.white }]}>{p.isSelf ? '나' : p.relation}</Text>
            </View>
          </View>
          <Text style={styles.sub} numberOfLines={1}>
            {s ? `${s.iljuHangul}(${s.iljuHanja})일주 · ` : ''}
            {shortBirthDate(p)}
          </Text>
        </View>
        {editing ? (
          <View style={styles.actions}>
            <Pressable hitSlop={8} onPress={() => edit(p)} accessibilityLabel={`${p.name} 수정`} style={styles.iconBtn}>
              <Icon name="pencil" size={18} color={colors.inkSoft} />
            </Pressable>
            {!p.isSelf && (
              <Pressable hitSlop={8} onPress={() => confirmRemove(p)} accessibilityLabel={`${p.name} 삭제`} style={styles.iconBtn}>
                <Icon name="trash" size={18} color={colors.red} />
              </Pressable>
            )}
          </View>
        ) : (
          !p.isSelf && (
            <Pressable hitSlop={8} onPress={() => toggleFavorite(p.id)} accessibilityLabel={p.favorite ? '즐겨찾기 해제' : '즐겨찾기'} style={styles.iconBtn}>
              <Icon name={p.favorite ? 'starFilled' : 'star'} size={20} color={p.favorite ? colors.amberDeep : colors.inkFaint} />
            </Pressable>
          )
        )}
      </Pressable>
    );
  };

  const section = (title: string, list: Person[], right?: React.ReactNode) =>
    list.length === 0 ? null : (
      <View style={{ gap: 6 }}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {right}
        </View>
        <View style={styles.group}>{list.map((p, i) => renderRow(p, i === list.length - 1))}</View>
      </View>
    );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.topbar}>
        <Text style={styles.title}>사주 목록</Text>
        {others.length > 0 && (
          <Pressable onPress={() => setEditing((v) => !v)} hitSlop={12}>
            <Text style={styles.editText}>{editing ? '완료' : '편집'}</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {others.length > 0 && (
          <>
            <View style={styles.search}>
              <Icon name="search" size={18} color={colors.inkFaint} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="이름이나 메모로 찾기"
                placeholderTextColor={colors.inkFaint}
                style={styles.searchInput}
                returnKeyType="search"
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              <Chip label={`전체 ${people.length}`} on={relation === null} onPress={() => setRelation(null)} />
              {RELATIONS.filter((r) => counts[r] > 0).map((r) => (
                <Chip key={r} label={`${r} ${counts[r]}`} on={relation === r} onPress={() => setRelation(relation === r ? null : r)} />
              ))}
            </ScrollView>
          </>
        )}

        {!filtering && groups.me && section('나', [groups.me])}
        {section('즐겨찾기', groups.favorites)}
        {section(
          '전체',
          groups.others,
          <Pressable onPress={() => setSort(sort === 'recent' ? 'name' : 'recent')} hitSlop={8} style={styles.sortBtn}>
            <Text style={styles.sortText}>{SORT_LABEL[sort]}</Text>
            <Icon name="chevronDown" size={14} color={colors.inkSoft} />
          </Pressable>,
        )}

        {others.length === 0 && (
          <View style={styles.empty}>
            <Mascot pose="front" width={84} />
            <Text style={styles.emptyTitle}>아직 저장한 사주가 없어요</Text>
            <Text style={styles.emptyBody}>가족이나 친구의 사주도 저장해서 언제든 볼 수 있어요.</Text>
          </View>
        )}
        {nothingFound && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>찾는 사람이 없어요</Text>
            <Text style={styles.emptyBody}>이름이나 메모를 다시 확인해보세요.</Text>
          </View>
        )}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push({ pathname: '/info-input', params: { add: '1' } })}>
        <Icon name="plus" size={18} color={colors.white} strokeWidth={2.4} />
        <Text style={styles.fabText}>추가</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipText, on && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: 20, paddingBottom: 8 },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  editText: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, fontWeight: '700' },
  content: { paddingHorizontal: spacing.xl, paddingTop: 6, paddingBottom: 110, gap: spacing.lg },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 4 },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.ink, paddingVertical: 10 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line },
  chipOn: { backgroundColor: colors.red, borderColor: colors.red },
  chipText: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: colors.inkSoft },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 2 },
  sectionTitle: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, fontWeight: '700' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  group: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowActive: { backgroundColor: colors.redSoft },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontFamily: fonts.body, fontSize: 15.5, fontWeight: '700', color: colors.ink, flexShrink: 1 },
  tag: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: radius.pill, backgroundColor: colors.amberSoft },
  tagMe: { backgroundColor: colors.red },
  tagText: { fontFamily: fonts.body, fontSize: 11, fontWeight: '700', color: '#7a5a1f' },
  sub: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { padding: 6 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: spacing.xxl },
  emptyTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  emptyBody: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, textAlign: 'center', lineHeight: 19 },
  fab: { position: 'absolute', left: spacing.xl, right: spacing.xl, bottom: 16, height: 54, borderRadius: 18, backgroundColor: colors.red, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  fabText: { fontFamily: fonts.body, fontSize: 16, fontWeight: '700', color: colors.white },
});
