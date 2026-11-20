import { HeartPulse, LayoutGrid, Settings2, Wallet } from 'lucide-react-native';
import { Tabs } from 'expo-router';

import { TabBar } from '../../src/components/TabBar';
import { useThemeColors } from '../../src/utils/theme';

// Barra de pestañas: Consolas (muro), Caja, Salud (HU-012) y Sistema.
// La barra es propia (TabBar, estilo Material 3) y suma el margen inferior del sistema. Al cambiar
// de pestaña el contenido se desliza un poco con un fundido hacia el lado de la pestaña elegida
// ('shift', 220 ms, ADR 0014).
export default function TabsLayout() {
  const colors = useThemeColors();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        transitionSpec: { animation: 'timing', config: { duration: 220 } },
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
