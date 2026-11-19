import { View } from 'react-native';

import type { ConsoleWithStock } from '../services/consoleService';
import { Badge } from './ui/badge';
import { Text } from './ui/text';

type Props = { consoles: ConsoleWithStock[] };

// Resumen del muro de un vistazo: cuántas consolas hay libres, en juego o en mantenimiento.
export function WallSummary({ consoles }: Props) {
  const free = consoles.filter((c) => c.status === 'disponible').length;
  const playing = consoles.filter((c) => c.status === 'en_juego').length;
  const maintenance = consoles.filter((c) => c.status === 'mantenimiento').length;
  return (
    <View accessibilityRole="summary" className="flex-row flex-wrap gap-2">
      <Badge className="border-transparent bg-available px-3 py-1">
        <Text className="text-sm text-available-foreground">
          {free} {free === 1 ? 'libre' : 'libres'}
        </Text>
      </Badge>
      <Badge className="border-transparent bg-playing px-3 py-1">
        <Text className="text-sm text-playing-foreground">{playing} en juego</Text>
      </Badge>
      {maintenance > 0 ? (
        <Badge variant="secondary" className="px-3 py-1">
          <Text className="text-sm">{maintenance} en mantenimiento</Text>
        </Badge>
      ) : null}
    </View>
  );
}
