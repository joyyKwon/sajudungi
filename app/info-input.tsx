import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, radius, spacing, fonts } from '../theme';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { DateTimePickerSheet } from '../components/DateTimePickerSheet';
import { PersonInput, useProfile } from '../context/ProfileContext';
import type { Gender, CalendarType } from '../lib/saju';
import { formatBirthDate, formatTime } from '../lib/format';
import { validateLunarDate } from '../lib/lunar';
import { MEMO_MAX_LENGTH, NAME_MAX_LENGTH, RELATIONS, Relation } from '../lib/people';
import { LEGAL_VERSION } from '../lib/legal';
import { STORAGE_KEYS, saveJson } from '../lib/storage';

const MIN_DATE = new Date(1900, 0, 1);
const DEFAULT_DATE = new Date(1995, 5, 15);
const DEFAULT_TIME = new Date(2000, 0, 1, 12, 0);
const TITLE = { first: '내 정보 입력', self: '내 정보 수정', add: '사주 추가', edit: '사주 수정' } as const;

export default function InfoInput() {
  // One form for four jobs: first input of "나", editing "나", adding someone, editing someone.
  const { id, add } = useLocalSearchParams<{ id?: string; add?: string }>();
  const { me, people, setProfile, addPerson, updatePerson } = useProfile();
  const found = id ? people.find((p) => p.id === id) ?? null : null;
  const mode: 'first' | 'self' | 'add' | 'edit' =
    add === '1' || (id && !found) ? 'add' : found ? (found.isSelf ? 'self' : 'edit') : me ? 'self' : 'first';
  const profile = mode === 'edit' ? found : mode === 'self' ? found ?? me : null;
  const forOther = mode === 'add' || mode === 'edit';
  const [name, setName] = useState(profile?.name ?? '');
  const [birthDate, setBirthDate] = useState<Date | null>(profile ? new Date(profile.year, profile.month - 1, profile.day) : null);
  const [birthTime, setBirthTime] = useState<Date | null>(
    profile && profile.hour !== null ? new Date(2000, 0, 1, profile.hour, profile.minute ?? 0) : null,
  );
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const [gender, setGender] = useState<Gender>(profile?.gender ?? 'female');
  const [calendarType, setCalendarType] = useState<CalendarType>(profile?.calendarType ?? 'solar');
  const [timeUnknown, setTimeUnknown] = useState(profile ? profile.hour === null : false);
  const [isLeapMonth, setIsLeapMonth] = useState(profile?.isLeapMonth ?? false);
  const [relation, setRelation] = useState<Relation>(profile?.relation ?? '친구');
  const [memo, setMemo] = useState(profile?.memo ?? '');
  const [agreedAge, setAgreedAge] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Icon name="back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.topbarTitle}>{TITLE[mode]}</Text>
      </View>

      <View style={styles.hintCard}>
        <Mascot pose="front" width={52} />
        <Text style={styles.hintText}>
          {forOther ? '가족이나 친구의 사주도 저장해서 볼 수 있어.\n이름 대신 별명도 괜찮아!' : '생년월일시를 알려주면\n정확한 사주를 봐줄게!'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Field label={forOther ? '이름 (별명)' : '이름 (닉네임)'}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="이름을 입력하세요"
            placeholderTextColor={colors.inkFaint}
            style={styles.fieldBox}
            maxLength={NAME_MAX_LENGTH}
          />
        </Field>

        {forOther && (
          <Field label="관계">
            <View style={styles.relationRow}>
              {RELATIONS.map((r) => (
                <Pressable key={r} onPress={() => setRelation(r)} style={[styles.relationChip, relation === r && styles.relationChipOn]}>
                  <Text style={[styles.relationText, relation === r && { color: colors.white }]}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </Field>
        )}

        <Field label="성별">
          <Segmented
            options={[
              { value: 'female', label: '여성' },
              { value: 'male', label: '남성' },
            ]}
            value={gender}
            onChange={(v) => setGender(v as Gender)}
          />
        </Field>

        <Field label="생년월일">
          <Segmented
            options={[
              { value: 'solar', label: '양력' },
              { value: 'lunar', label: '음력' },
            ]}
            value={calendarType}
            onChange={(v) => setCalendarType(v as CalendarType)}
            style={{ marginBottom: spacing.sm }}
          />
          <Pressable style={[styles.fieldBox, styles.fieldRow]} onPress={() => setPicker('date')}>
            <Text style={[styles.fieldValue, !birthDate && { color: colors.inkFaint }]}>
              {birthDate
                ? formatBirthDate({
                    year: birthDate.getFullYear(),
                    month: birthDate.getMonth() + 1,
                    day: birthDate.getDate(),
                    calendarType,
                    isLeapMonth,
                  })
                : '생년월일을 선택하세요'}
            </Text>
            <Icon name="calendarDate" size={18} color={colors.inkFaint} />
          </Pressable>
          {calendarType === 'lunar' && (
            <>
              <Pressable style={styles.checkboxRow} onPress={() => setIsLeapMonth((v) => !v)}>
                <View style={[styles.checkbox, isLeapMonth && styles.checkboxChecked]}>
                  {isLeapMonth && <Icon name="check" size={12} color={colors.white} strokeWidth={3} />}
                </View>
                <Text style={styles.checkboxLabel}>윤달이에요</Text>
              </Pressable>
              <Text style={styles.fieldHint}>음력 날짜 그대로 선택해주세요. 존재하지 않는 날짜는 저장할 때 알려드려요.</Text>
            </>
          )}
        </Field>

        <Field label="태어난 시간">
          <Pressable style={[styles.fieldBox, styles.fieldRow]} disabled={timeUnknown} onPress={() => setPicker('time')}>
            <Text style={[styles.fieldValue, (timeUnknown || !birthTime) && { color: colors.inkFaint }]}>
              {timeUnknown ? '모름' : birthTime ? formatTime(birthTime.getHours(), birthTime.getMinutes()) : '태어난 시간을 선택하세요'}
            </Text>
            <Icon name="clock" size={18} color={colors.inkFaint} />
          </Pressable>
          <Pressable style={styles.checkboxRow} onPress={() => setTimeUnknown((v) => !v)}>
            <View style={[styles.checkbox, timeUnknown && styles.checkboxChecked]}>
              {timeUnknown && <Icon name="check" size={12} color={colors.white} strokeWidth={3} />}
            </View>
            <Text style={styles.checkboxLabel}>태어난 시간을 몰라요</Text>
          </Pressable>
        </Field>

        {forOther && (
          <>
            <Field label="메모 (선택)">
              <TextInput
                value={memo}
                onChangeText={setMemo}
                placeholder="예: 고등학교 동창"
                placeholderTextColor={colors.inkFaint}
                style={[styles.fieldBox, { minHeight: 64, textAlignVertical: 'top' }]}
                maxLength={MEMO_MAX_LENGTH}
                multiline
              />
            </Field>
            <Text style={styles.fieldHint}>
              입력한 정보는 이 기기에만 저장돼요. 다른 사람의 정보는 그 사람이 알고 있을 때만 저장해주세요.
            </Text>
          </>
        )}

        {mode === 'first' && (
          <View style={styles.consentBox}>
            <Pressable style={styles.checkboxRow} onPress={() => setAgreedAge((v) => !v)}>
              <View style={[styles.checkbox, agreedAge && styles.checkboxChecked]}>
                {agreedAge && <Icon name="check" size={12} color={colors.white} strokeWidth={3} />}
              </View>
              <Text style={styles.checkboxLabel}>(필수) 만 14세 이상이에요</Text>
            </Pressable>
            <View style={styles.checkboxRow}>
              <Pressable hitSlop={8} onPress={() => setAgreedTerms((v) => !v)}>
                <View style={[styles.checkbox, agreedTerms && styles.checkboxChecked]}>
                  {agreedTerms && <Icon name="check" size={12} color={colors.white} strokeWidth={3} />}
                </View>
              </Pressable>
              <Text style={styles.checkboxLabel} onPress={() => setAgreedTerms((v) => !v)}>
                (필수){' '}
                <Text style={styles.consentLink} onPress={() => router.push('/legal/terms')}>
                  이용약관
                </Text>
                과{' '}
                <Text style={styles.consentLink} onPress={() => router.push('/legal/privacy')}>
                  개인정보처리방침
                </Text>
                에 동의해요
              </Text>
            </View>
            <Text style={styles.fieldHint}>입력한 정보는 이 기기에만 저장되고 서버로 보내지 않아요.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={mode === 'first' ? '사주 보러가기' : '저장하기'}
          onPress={() => {
            if (!name.trim()) return Alert.alert(forOther ? '이름(별명)을 입력해주세요' : '이름(닉네임)을 입력해주세요');
            if (!birthDate) return Alert.alert('생년월일을 선택해주세요');
            if (!timeUnknown && !birthTime) return Alert.alert('태어난 시간을 선택하거나 "몰라요"를 체크해주세요');
            if (mode === 'first' && !(agreedAge && agreedTerms)) return Alert.alert('필수 항목에 동의해주세요', '만 14세 이상 확인과 이용약관·개인정보처리방침 동의가 필요해요.');

            const next: PersonInput = {
              name: name.trim(),
              gender,
              calendarType,
              year: birthDate.getFullYear(),
              month: birthDate.getMonth() + 1,
              day: birthDate.getDate(),
              hour: timeUnknown || !birthTime ? null : birthTime.getHours(),
              minute: timeUnknown || !birthTime ? null : birthTime.getMinutes(),
              isLeapMonth: calendarType === 'lunar' ? isLeapMonth : undefined,
              ...(forOther ? { relation, memo } : {}),
            };

            if (calendarType === 'lunar') {
              const problem = validateLunarDate(next.year, next.month, next.day, isLeapMonth);
              if (problem) return Alert.alert('올바르지 않은 날짜예요', problem);
            }

            // MOCK: everything is stored on-device only (AsyncStorage). Sync to Supabase once accounts exist.
            if (mode === 'add') {
              addPerson(next);
              router.back();
            } else if (mode === 'edit' && found) {
              updatePerson(found.id, next);
              router.back();
            } else {
              if (mode === 'first') saveJson(STORAGE_KEYS.consent, { version: LEGAL_VERSION, agreedAt: new Date().toISOString() });
              setProfile(next);
              router.replace('/(tabs)');
            }
          }}
        />
      </View>

      <DateTimePickerSheet
        visible={picker === 'date'}
        mode="date"
        title="생년월일"
        value={birthDate ?? DEFAULT_DATE}
        minimumDate={MIN_DATE}
        maximumDate={new Date()}
        onConfirm={(d) => {
          setBirthDate(d);
          setPicker(null);
        }}
        onCancel={() => setPicker(null)}
      />
      <DateTimePickerSheet
        visible={picker === 'time'}
        mode="time"
        title="태어난 시간"
        value={birthTime ?? DEFAULT_TIME}
        onConfirm={(d) => {
          setBirthTime(d);
          setPicker(null);
        }}
        onCancel={() => setPicker(null)}
      />
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  style?: object;
}) {
  return (
    <View style={[styles.seg, style]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segItem, active && styles.segItemActive]}
          >
            <Text style={[styles.segItemText, active && styles.segItemTextActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: spacing.xl, paddingTop: 20, paddingBottom: 8 },
  topbarTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.amberSoft,
    marginHorizontal: spacing.xl,
    marginTop: 14,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  hintText: { fontFamily: fonts.body, fontSize: 13, color: colors.ink, lineHeight: 19, flexShrink: 1 },
  form: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl, gap: spacing.xl },
  fieldLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, fontWeight: '700', marginBottom: spacing.sm },
  fieldBox: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.ink,
  },
  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldValue: { fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  fieldHint: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 8, lineHeight: 17 },
  seg: { flexDirection: 'row', backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, padding: 4 },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  segItemActive: { backgroundColor: colors.red },
  segItemText: { fontFamily: fonts.body, fontSize: 14, fontWeight: '700', color: colors.inkSoft },
  segItemTextActive: { color: colors.white },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4, paddingVertical: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.red, borderColor: colors.red },
  checkboxLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  relationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  relationChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line },
  relationChipOn: { backgroundColor: colors.red, borderColor: colors.red },
  relationText: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: colors.inkSoft },
  consentBox: { gap: 2, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 10 },
  consentLink: { textDecorationLine: 'underline', color: colors.red },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl },
});
