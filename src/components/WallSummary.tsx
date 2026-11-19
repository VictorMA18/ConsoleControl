import { View } from 'react-native';

import { CARD_STATE_STYLES, type CardState } from '../utils/cardState';
import { cn } from '../utils/cn';
import { Text } from './ui/text';

type Props = { states: CardState[] };

// Los cuatro estados del resumen. "Por terminar" suma también las de tiempo cumplido: las dos piden
// atención pronto. Mantenimiento y averiadas no se cuentan arriba; se ven en su tarjeta.
const TILES: { state: CardState; counts: CardState[]; dot: string }[] = [
  { state: 'disponible', counts: ['disponible'], dot: 'bg-available-tone' },
  { state: 'en_juego', counts: ['en_juego'], dot: 'bg-playing' },
  { state: 'por_terminar', counts: ['por_terminar', 'tiempo_cumplido'], dot: 'bg-warning' },
  { state: 'por_cobrar', counts: ['por_cobrar'], dot: 'bg-pending' },
];

// Resumen del muro de un vistazo (ADR 0014): una sola tarjeta con la proporción de consolas por
// estado en una barra fina y, debajo, cuatro columnas con el número grande. El color va solo en la
// barra y en un punto junto a cada etiqueta; los números quedan en el color del texto.
export function WallSummary({ states }: Props) {
  const tiles = TILES.map((tile) => ({
    ...tile,
    total: states.filter((s) => tile.counts.includes(s)).length,
  }));
  const counted = tiles.reduce((sum, tile) => sum + tile.total, 0);
  return (
    <View
      accessibilityRole="summary"
      className="overflow-hidden rounded-3xl border border-border bg-card"
    >
      <View className="h-1.5 flex-row bg-secondary">
        {counted > 0
          ? tiles.map((tile) =>
              tile.total > 0 ? (
                <View key={tile.state} className={tile.dot} style={{ flex: tile.total }} />
              ) : null,
            )
          : null}
      </View>
      <View className="flex-row">
        {tiles.map((tile, index) => {
          const style = CARD_STATE_STYLES[tile.state];
          return (
            <View
              key={tile.state}
              testID={`resumen-${tile.state}`}
              accessibilityLabel={`${tile.total} ${style.label}`}
              className={cn('flex-1 gap-1 px-3 py-3', index > 0 && 'border-l border-border')}
            >
              <Text
                className={cn(
                  'text-2xl font-extrabold',
                  tile.total === 0 && 'text-muted-foreground',
                )}
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {tile.total}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <View className={cn('h-1.5 w-1.5 rounded-full', tile.dot)} />
                <Text
                  numberOfLines={1}
                  className="flex-1 text-[11px] font-bold text-muted-foreground"
                >
                  {style.label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
