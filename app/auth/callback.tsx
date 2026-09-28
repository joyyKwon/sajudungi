import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../theme';

// Landing spot for sajudungi://auth/callback. The normal login flow never actually
// shows this (signInWithProvider in AuthContext reads the redirect straight out of
// WebBrowser.openAuthSessionAsync); this only renders in the rare case where the OS
// hands the link to the app directly, while app/_layout.tsx's listener finishes the
// login and redirects away.
export default function AuthCallbackScreen() {
  return (
    <View style={styles.screen}>
      <ActivityIndicator color={colors.red} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
});
