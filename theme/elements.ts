import type { ViewStyle } from 'react-native';
import type { WuXing } from '../lib/saju';
import { colors } from './colors';

/** Text color for each 오행's glyphs and labels. */
export const ELEMENT_INK: Record<WuXing, string> = {
  wood: colors.wood,
  fire: colors.fire,
  earth: colors.earth,
  metal: colors.metal,
  water: colors.water,
};

/** Fill for 오행 bars; 금's white would vanish against the track, so it uses a mid gray. */
export const ELEMENT_FILL: Record<WuXing, string> = { ...ELEMENT_INK, metal: '#BDBDBD' };

/**
 * Background of a box holding a glyph of this 오행: a light tint of its color, except 금,
 * which follows the 오방색 white with an outline (a gray tint read as an empty cell).
 */
export function elementBox(element: WuXing, alpha = '38'): ViewStyle {
  if (element === 'metal') return { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.metalLine };
  return { backgroundColor: ELEMENT_INK[element] + alpha };
}

/** A small legend dot in this 오행's color (white with an outline for 금). */
export function elementDot(element: WuXing): ViewStyle {
  if (element === 'metal') return { backgroundColor: colors.white, borderWidth: 1, borderColor: '#AFAFAF' };
  return { backgroundColor: ELEMENT_INK[element] };
}
