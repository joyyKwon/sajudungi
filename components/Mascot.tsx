import { Image, ImageStyle, StyleProp } from 'react-native';

const POSES = {
  front: { source: require('../assets/mascot/mascot_front.png'), ratio: 1 },
  analyzing: { source: require('../assets/mascot/mascot_analyzing.png'), ratio: 639 / 640 },
  studying: { source: require('../assets/mascot/mascot_studying.png'), ratio: 640 / 507 },
  elements: { source: require('../assets/mascot/mascot_elements.png'), ratio: 215 / 113 },
  // One per 오행; shown for the person's day-stem element (see WuXing in lib/saju).
  wood: { source: require('../assets/mascot/mascot_wood.png'), ratio: 1 },
  fire: { source: require('../assets/mascot/mascot_fire.png'), ratio: 1 },
  earth: { source: require('../assets/mascot/mascot_earth.png'), ratio: 1 },
  metal: { source: require('../assets/mascot/mascot_metal.png'), ratio: 1 },
  water: { source: require('../assets/mascot/mascot_water.png'), ratio: 1 },
} as const;

export type MascotPose = keyof typeof POSES;

type Props = {
  pose: MascotPose;
  width: number;
  style?: StyleProp<ImageStyle>;
};

// 시안이 바뀌어 캐릭터 에셋이 교체되면 POSES의 require 경로만 바꾸면 된다.
export function Mascot({ pose, width, style }: Props) {
  const { source, ratio } = POSES[pose];
  return (
    <Image
      source={source}
      style={[{ width, aspectRatio: ratio }, style]}
      resizeMode="contain"
    />
  );
}
