import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, radius, spacing, fonts } from '../theme';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { DateTimePickerSheet } from '../components/DateTimePickerSheet';
import { Profile, useProfile } from '../context/ProfileContext';
import { calculateSaju } from '../lib/saju';
import type { Gender, CalendarType } from '../lib/saju';
import { formatTime } from '../lib/format';

const MIN_DATE = new Date(1900, 0, 1);
const DEFAULT_DATE = new Date(1995, 5, 15);
const DEFAULT_TIME = new Date(2000, 0, 1, 12, 0);

export default function InfoInput() {
  const { setProfile } = useProfile();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthTime, setBirthTime] = useState<Date | null>(null);
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const [gender, setGender] = useState<Gender>('female');
  const [calendarType, setCalendarType] = useState<CalendarType>('solar');
  const [timeUnknown, setTimeUnknown] = useState(false);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Icon name="back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.topbarTitle}>내 정보 입력</Text>
      </View>

      <View style={styles.hintCard}>
        <Mascot pose="front" width={52} />
        <Text style={styles.hintText}>생년월일시를 알려주면{'\n'}정확한 사주를 봐줄게!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Field label="이름 (닉네임)">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="이름을 입력하세요"
            placeholderTextColor={colors.inkFaint}
            style={styles.fieldBox}
          />
        </Field>

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
                ? `${calendarType === 'lunar' ? '음력 ' : ''}${birthDate.getFullYear()}년 ${birthDate.getMonth() + 1}월 ${birthDate.getDate()}일`
                : '생년월일을 선택하세요'}
            </Text>
            <Icon name="calendarDate" size={18} color={colors.inkFaint} />
          </Pressable>
          {calendarType === 'lunar' && (
            <Text style={styles.fieldHint}>음력 날짜 그대로 선택해주세요. 존재하지 않는 날짜는 확인할 때 알려드려요.</Text>
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
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="사주 보러가기"
          onPress={() => {
            if (!name.trim()) return Alert.alert('이름(닉네임)을 입력해주세요');
            if (!birthDate) return Alert.alert('생년월일을 선택해주세요');
            if (!timeUnknown && !birthTime) return Alert.alert('태어난 시간을 선택하거나 "몰라요"를 체크해주세요');

            const next: Profile = {
              name: name.trim(),
              gender,
              calendarType,
              year: birthDate.getFullYear(),
              month: birthDate.getMonth() + 1,
              day: birthDate.getDate(),
              hour: timeUnknown || !birthTime ? null : birthTime.getHours(),
              minute: timeUnknown || !birthTime ? null : birthTime.getMinutes(),
            };

            try {
              calculateSaju(next);
            } catch {
              return Alert.alert(
                '올바르지 않은 날짜예요',
                calendarType === 'lunar' ? '존재하지 않는 음력 날짜예요. 다시 확인해주세요.' : '날짜를 다시 확인해주세요.',
              );
            }

            // MOCK: profile lives only in memory (ProfileContext). Persist to Supabase once profile storage exists.
            setProfile(next);
            router.replace('/(tabs)');
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
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 10 },
  checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.red, borderColor: colors.red },
  checkboxLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl },
});
