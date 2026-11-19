import { HeartPulse, LayoutGrid, Settings2, Wallet } from 'lucide-react-native';
import { Tabs } from 'expo-router';

import { useInsets } from '../../src/hooks/useBottomInset';
import { FONTS, useThemeColors } from '../../src/utils/theme';

// Barra de pestañas: Consolas (muro), Caja, Salud (HU-012) y Sistema.
// La app se dibuja de borde a borde: la barra suma el margen inferior del sistema (barra de gestos
// o botones de Android) para no quedar debajo de ella. Al cambiar de pestaña el contenido se desliza
// un poco con un fundido hacia el lado de la pestaña elegida ('shift', ADR 0014).
export default function TabsLayout() {
  const colors = useThemeColors();
  const { bottom } = useInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 62 + bottom,
          paddingTop: 8,
          paddingBottom: bottom + 8,
        },
        tabBarLabelStyle: { fontFamily: FONTS.semibold, fontSize: 12 },
        sceneStyle: { backgroundColor: colors.background },
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
      <Tabs.Screen
        name="salud"
        options={{
          title: 'Salud',
          tabBarIcon: ({ color, size }) => <HeartPulse color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sistema"
        options={{
          title: 'Sistema',
          tabBarIcon: ({ color, size }) => <Settings2 color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
