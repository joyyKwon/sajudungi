import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
});
