import Svg, { Path, Circle, Rect } from 'react-native-svg';

export type IconName =
  | 'back'
  | 'close'
  | 'bell'
  | 'user'
  | 'home'
  | 'calendar'
  | 'book'
  | 'search'
  | 'lightbulb'
  | 'chevronRight'
  | 'check'
  | 'lock'
  | 'share'
  | 'info'
  | 'clock'
  | 'calendarDate';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 20, color = '#3B2A1D', strokeWidth = 1.8 }: Props) {
  const common = { stroke: color, strokeWidth, fill: 'none' as const, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (name) {
    case 'back':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M15 5l-7 7 7 7" {...common} />
        </Svg>
      );
    case 'close':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M6 6l12 12M18 6L6 18" {...common} />
        </Svg>
      );
    case 'bell':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" {...common} strokeLinejoin="round" />
          <Path d="M10 20a2 2 0 0 0 4 0" {...common} />
        </Svg>
      );
    case 'user':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx={12} cy={8} r={3.4} {...common} />
          <Path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" {...common} />
        </Svg>
      );
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 11.5 12 4l8 7.5" {...common} />
          <Path d="M6 10v9h5v-5h2v5h5v-9" {...common} strokeLinejoin="round" />
        </Svg>
      );
    case 'calendar':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x={5} y={4} width={14} height={17} rx={2} {...common} />
          <Path d="M9 9h6M9 13h6M9 17h4" {...common} />
        </Svg>
      );
    case 'book':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 0 4 23z" {...common} />
          <Path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 1 2.5 2z" {...common} />
        </Svg>
      );
    case 'search':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx={10} cy={10} r={6} {...common} />
          <Path d="M19 19l-4.5-4.5" {...common} />
        </Svg>
      );
    case 'lightbulb':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11.2c.6.4.9 1 .9 1.8h4.2c0-.8.3-1.4.9-1.8A6 6 0 0 0 12 3z"
            {...common}
          />
        </Svg>
      );
    case 'chevronRight':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M9 5l7 7-7 7" {...common} strokeWidth={strokeWidth + 0.2} />
        </Svg>
      );
    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 13l4 4 10-10" {...common} strokeWidth={strokeWidth + 0.6} />
        </Svg>
      );
    case 'lock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x={5} y={11} width={14} height={9} rx={2} {...common} />
          <Path d="M8 11V8a4 4 0 0 1 8 0v3" {...common} />
        </Svg>
      );
    case 'share':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 4v12M8 8l4-4 4 4" {...common} />
          <Path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" {...common} />
        </Svg>
      );
    case 'info':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={9} {...common} />
          <Path d="M12 8h.01M11 11h1v6h1" {...common} />
        </Svg>
      );
    case 'clock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={8} {...common} />
          <Path d="M12 8v4l3 2" {...common} />
        </Svg>
      );
    case 'calendarDate':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x={4} y={5} width={16} height={15} rx={2} {...common} />
          <Path d="M4 9h16M8 3v4M16 3v4" {...common} />
        </Svg>
      );
    default:
      return null;
  }
}
