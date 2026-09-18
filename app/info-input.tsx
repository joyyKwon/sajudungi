import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, radius, spacing, fonts } from '../theme';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';

type Gender = 'female' | 'male';
type CalendarType = 'solar' | 'lunar';

export default function InfoInput() {
  const [name, setName] = useState('');
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
          {/* MOCK: static date text, no picker wired. Needs real date state + @react-native-community/datetimepicker (or similar), plus 음력 conversion when calendarType === 'lunar'. */}
          <Pressable style={[styles.fieldBox, styles.fieldRow]}>
            <Text style={styles.fieldValue}>1996년 3월 14일</Text>
            <Icon name="calendarDate" size={18} color={colors.inkFaint} />
          </Pressable>
        </Field>

        <Field label="태어난 시간">
          {/* MOCK: static time text, no picker wired. Needs real time state + time picker. */}
          <Pressable style={[styles.fieldBox, styles.fieldRow]} disabled={timeUnknown}>
            <Text style={[styles.fieldValue, timeUnknown && { color: colors.inkFaint }]}>
              {timeUnknown ? '모름' : '오후 3시 30분'}
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
        {/* MOCK: form fields are not persisted anywhere. On submit this should save the profile
            (name, gender, birth date/time, calendar type) to Supabase and run it through the
            saju calculation engine before landing on the tabs. */}
        <Button label="사주 보러가기" onPress={() => router.replace('/(tabs)')} />
      </View>
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
