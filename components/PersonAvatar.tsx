import { View, Text, StyleSheet } from 'react-native';
import { ELEMENT_INK, colors, elementBox, fonts } from '../theme';
import type { PersonSummary } from '../lib/personSummary';

type Props = { name: string; summary: PersonSummary | null; size?: number };

/** The person's day stem (일간) in its 오행 color; falls back to the first letter of the name. */
export function PersonAvatar({ name, summary, size = 44 }: Props) {
  const color = summary ? ELEMENT_INK[summary.ganElement] : colors.inkSoft;
  const box = summary ? elementBox(summary.ganElement, '2E') : { backgroundColor: color + '2E' };
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.32 }, box]}>
      <Text style={[styles.glyph, { color, fontSize: size * 0.45 }]}>{summary ? summary.gan : name.slice(0, 1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  glyph: { fontFamily: fonts.display, fontWeight: '700' },
});
