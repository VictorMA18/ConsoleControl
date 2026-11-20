import { LayoutGrid, Wallet } from 'lucide-react-native';
import { Tabs } from 'expo-router';

import { COLORS, FONTS } from '../../src/utils/theme';

// Barra de pestañas: Consolas (muro) y Caja. Sprint 3 agrega Salud.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.foreground,
        tabBarInactiveTintColor: COLORS.mutedForeground,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          height: 68,
          paddingTop: 6,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontFamily: FONTS.semibold, fontSize: 12 },
        sceneStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Consolas',
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="caja"
        options={{
          title: 'Caja',
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
