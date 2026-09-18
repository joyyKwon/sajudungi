import { Image, ImageStyle, StyleProp } from 'react-native';

const POSES = {
  front: { source: require('../assets/mascot/mascot_front.png'), ratio: 120 / 103 },
  analyzing: { source: require('../assets/mascot/mascot_analyzing.png'), ratio: 170 / 95 },
  studying: { source: require('../assets/mascot/mascot_studying.png'), ratio: 153 / 95 },
  elements: { source: require('../assets/mascot/mascot_elements.png'), ratio: 215 / 113 },
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
