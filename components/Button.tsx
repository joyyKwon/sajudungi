import { Pressable, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, fonts } from '../theme';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline';
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
};

export function Button({ label, onPress, variant = 'primary', style, icon }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.outline,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {icon}
      <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelOutline]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  primary: {
    backgroundColor: colors.amberDeep,
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  label: {
    fontSize: 15,
    fontFamily: fonts.body,
    fontWeight: '700',
  },
  labelPrimary: {
    color: colors.ink,
  },
  labelOutline: {
    color: colors.ink,
  },
});
