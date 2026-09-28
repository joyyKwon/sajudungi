import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { colors, spacing, fonts } from '../theme';
import { Button } from './Button';

// The same list of sign-in methods on the start screen and on 마이 > 로그인 / 회원가입.
// Kakao/Google/Apple need their native SDKs, which only run in an EAS build (not Expo Go),
// so for now they explain that and point to email instead of pretending to log in.
const notYet = (provider: string) =>
  Alert.alert(`${provider} 로그인은 준비 중이에요`, '지금은 이메일로 가입하거나 로그인할 수 있어요.', [
    { text: '닫기', style: 'cancel' },
    { text: '이메일로 계속하기', onPress: () => router.push('/auth/email') },
  ]);

export function LoginOptions() {
  return (
    <View style={styles.wrap}>
      <Button
        variant="outline"
        label="카카오로 계속하기"
        onPress={() => notYet('카카오')}
        icon={
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              d="M12 3C6.9 3 3 6.4 3 10.6c0 2.7 1.7 5 4.3 6.4l-1 3.7c-.1.4.3.7.6.5l4.3-2.7c.3 0 .5.1.8.1 5.1 0 9-3.4 9-7.6S17.1 3 12 3z"
              fill="#3c1e1e"
            />
          </Svg>
        }
      />
      <Button
        variant="outline"
        label="Google로 계속하기"
        onPress={() => notYet('Google')}
        icon={
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Circle cx={12} cy={12} r={10} fill="none" stroke="#4a4a4a" strokeWidth={1.6} />
            <SvgText x={12} y={16} textAnchor="middle" fontSize={12} fill="#4a4a4a">
              G
            </SvgText>
          </Svg>
        }
      />
      {/* Apple 로그인은 iOS 출시 때 붙인다(안드로이드 먼저 출시). */}
      {Platform.OS === 'ios' && (
        <Button
          variant="outline"
          label="Apple로 계속하기"
          onPress={() => notYet('Apple')}
          icon={
            <Svg width={17} height={17} viewBox="0 0 24 24">
              <Path
                d="M16.5 1.5c.1 1.2-.4 2.4-1.1 3.2-.7.9-1.9 1.6-3 1.5-.1-1.2.4-2.4 1.1-3.2.7-.9 2-1.6 3-1.5zm4.1 16.3c-.4 1-.9 1.9-1.6 2.8-1 1.3-2 2.6-3.5 2.7-1.5 0-1.9-.9-3.6-.9s-2.2.9-3.6.9c-1.5.1-2.6-1.4-3.6-2.7-2-2.8-3.5-8-1.4-11.5.9-1.7 2.6-2.8 4.4-2.8 1.4 0 2.3.9 3.5.9 1.1 0 1.9-.9 3.6-.9 1.5 0 3.1.8 4.1 2.2-3.6 2-3 7.3 1.7 9.3z"
                fill="#1a1a1a"
              />
            </Svg>
          }
        />
      )}

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button label="이메일로 계속하기" onPress={() => router.push('/auth/email')} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerText: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
});
