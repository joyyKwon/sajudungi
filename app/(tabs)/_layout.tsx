import { Redirect, Tabs } from 'expo-router';
import { ColorValue } from 'react-native';
import { colors } from '../../theme';
import { Icon, IconName } from '../../components/Icon';
import { useProfile } from '../../context/ProfileContext';

function TabIcon(name: IconName) {
  return ({ color }: { color: ColorValue }) => <Icon name={name} size={20} color={color as string} />;
}

export default function TabsLayout() {
  const { me } = useProfile();
  if (!me) return <Redirect href="/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.red,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: { borderTopColor: colors.line, backgroundColor: colors.white },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: '홈', tabBarIcon: TabIcon('home') }} />
      <Tabs.Screen name="manseryeok" options={{ title: '만세력', tabBarIcon: TabIcon('calendar') }} />
      <Tabs.Screen name="lessons" options={{ title: '학습', tabBarIcon: TabIcon('book') }} />
      <Tabs.Screen name="mypage" options={{ title: '마이', tabBarIcon: TabIcon('user') }} />
    </Tabs>
  );
}
