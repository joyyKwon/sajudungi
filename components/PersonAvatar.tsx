import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import type { PersonSummary } from '../lib/personSummary';

const ELEMENT_COLOR = { wood: colors.wood, fire: colors.fire, earth: colors.earth, metal: '#7d7d7d', water: colors.water } as const;

type Props = { name: string; summary: PersonSummary | null; size?: number };

/** The person's day stem (일간) in its 오행 color; falls back to the first letter of the name. */
export function PersonAvatar({ name, summary, size = 44 }: Props) {
  const color = summary ? ELEMENT_COLOR[summary.ganElement] : colors.inkSoft;
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.32, backgroundColor: color + '2E' }]}>
      <Text style={[styles.glyph, { color, fontSize: size * 0.45 }]}>{summary ? summary.gan : name.slice(0, 1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  glyph: { fontFamily: fonts.display, fontWeight: '700' },
});
