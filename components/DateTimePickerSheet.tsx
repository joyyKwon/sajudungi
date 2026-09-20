import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, fonts, spacing } from '../theme';

type Props = {
  visible: boolean;
  mode: 'date' | 'time';
  title: string;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

export function DateTimePickerSheet({ visible, mode, title, value, minimumDate, maximumDate, onConfirm, onCancel }: Props) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  if (!visible || Platform.OS === 'web') return null;

  // Android shows its own system dialog, so there's no sheet to render.
  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={value}
        mode={mode}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onValueChange={(_, date) => onConfirm(date)}
        onDismiss={onCancel}
      />
    );
  }

  return (
    <Modal transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Pressable onPress={onCancel} hitSlop={12}>
            <Text style={styles.cancel}>취소</Text>
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={() => onConfirm(draft)} hitSlop={12}>
            <Text style={styles.confirm}>확인</Text>
          </Pressable>
        </View>
        <DateTimePicker
          value={draft}
          mode={mode}
          display="spinner"
          locale="ko-KR"
          themeVariant="light"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onValueChange={(_, date) => setDraft(date)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(59,42,29,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 32,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  title: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  cancel: { fontFamily: fonts.body, fontSize: 15, color: colors.inkSoft },
  confirm: { fontFamily: fonts.body, fontSize: 15, fontWeight: '700', color: colors.red },
});
