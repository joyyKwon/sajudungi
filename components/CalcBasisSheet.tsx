import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../theme';
import { Icon } from './Icon';
import { useProfile } from '../context/ProfileContext';

type Props = { visible: boolean; onClose: () => void };

export function CalcBasisSheet({ visible, onClose }: Props) {
  const { options, setOptions } = useProfile();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>계산 기준</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Icon name="close" size={20} color="#a89a86" />
          </Pressable>
        </View>

        <Row
          title="진태양시 보정 (−30분)"
          desc="한국 표준시는 실제 태양시보다 약 30분 빨라요. 켜면 동경 127.5° 기준으로 보정해서 시주·일주가 바뀌는 시각을 계산해요."
          value={options.longitudeCorrection}
          onChange={(v) => setOptions({ ...options, longitudeCorrection: v })}
        />
        <Row
          title="조자시 방식"
          desc="끄면 야자시 방식이에요. 자시(23시대)에 태어나도 일주는 당일이고 시주만 子시로 봐요. 켜면 자시가 시작되는 시점부터 일주도 다음날로 봐요."
          value={options.jasi === 'jojasi'}
          onChange={(v) => setOptions({ ...options, jasi: v ? 'jojasi' : 'yajasi' })}
        />

        <Text style={styles.note}>
          서머타임(1948~60년, 1987~88년)과 1954~61년 표준시 변경은 항상 자동으로 반영돼요. 만세력 앱마다 기준이 달라서 결과가 다를 수 있어요.
        </Text>
      </View>
    </Modal>
  );
}

function Row({ title, desc, value, onChange }: { title: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDesc}>{desc}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.red, false: colors.line }} thumbColor={colors.white} />
    </View>
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
    padding: spacing.xl,
    paddingBottom: 36,
    gap: spacing.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowTitle: { fontFamily: fonts.body, fontSize: 14.5, fontWeight: '700', color: colors.ink },
  rowDesc: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 3, lineHeight: 17 },
  note: { fontFamily: fonts.body, fontSize: 11.5, color: colors.inkSoft, lineHeight: 17 },
});
