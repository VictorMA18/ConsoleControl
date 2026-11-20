import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { ConsoleType } from '../db/schema/enums';
import { cn } from '../utils/cn';
import { CONSOLE_TYPE_LABELS } from '../utils/consoleLabels';
import { useThemeColors } from '../utils/theme';
import {
  PLAYSTATION_SYMBOL,
  PLAYSTATION_WORDMARKS,
  SWITCH_SYMBOL,
  XBOX_SYMBOL,
  type LogoPath,
} from './platformLogos';
import { Text } from './ui/text';

// compact: versión de la tarjeta del muro, más baja para que quepa junto al nombre.
type Props = { consoleType: ConsoleType; compact?: boolean };

// Pastilla con la plataforma de la consola, como en la tarjeta de VN: borde fino, esquinas
// completas y el logo de marca. Para PlayStation se dibujan el símbolo y el modelo (PS3, PS4,
// PS5); Xbox y Switch, su símbolo y el nombre en texto.
export function PlatformBadge({ consoleType, compact }: Props) {
  const { foreground } = useThemeColors();
  const label = CONSOLE_TYPE_LABELS[consoleType];
  const wordmark =
    consoleType === 'ps3' || consoleType === 'ps4' || consoleType === 'ps5'
      ? PLAYSTATION_WORDMARKS[consoleType]
      : null;
  return (
    <View
      accessible
      accessibilityLabel={label}
      className={cn(
        'flex-row items-center self-start rounded-full border border-foreground/70',
        compact ? 'h-8 gap-1.5 px-3' : 'h-10 gap-2 px-4',
      )}
    >
      {wordmark ? (
        <>
          <Logo logo={PLAYSTATION_SYMBOL} height={compact ? 15 : 18} color={foreground} />
          <Logo logo={wordmark} height={compact ? 9 : 11} color={foreground} />
        </>
      ) : (
        <>
          <Logo
            logo={consoleType === 'xbox' ? XBOX_SYMBOL : SWITCH_SYMBOL}
            height={compact ? 15 : 18}
            color={foreground}
          />
          {/* Android mide corto el ancho con esta fuente y recorta la última letra («Xbo»): el
              margen derecho le deja el espacio que falta. */}
          <Text
            numberOfLines={1}
            className={cn('shrink-0 pr-1 font-bold tracking-wide', compact ? 'text-xs' : 'text-sm')}
          >
            {label}
          </Text>
        </>
      )}
    </View>
  );
}

function Logo({ logo, height, color }: { logo: LogoPath; height: number; color: string }) {
  return (
    <Svg width={(logo.width / logo.height) * height} height={height} viewBox={logo.viewBox}>
      <Path d={logo.d} fill={color} />
    </Svg>
  );
}
