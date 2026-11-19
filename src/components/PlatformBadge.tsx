import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { ConsoleType } from '../db/schema/enums';
import { CONSOLE_TYPE_LABELS } from '../utils/consoleLabels';
import { useThemeColors } from '../utils/theme';
import { PLAYSTATION_SYMBOL, PLAYSTATION_WORDMARKS, type LogoPath } from './platformLogos';
import { Text } from './ui/text';

type Props = { consoleType: ConsoleType };

// Pastilla con la plataforma de la consola, como en la tarjeta de VN: borde fino, esquinas
// completas y el logo de marca. Para PlayStation se dibujan el símbolo y el modelo (PS3, PS4,
// PS5); Xbox y Switch muestran el nombre en texto.
export function PlatformBadge({ consoleType }: Props) {
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
      className="h-10 flex-row items-center gap-2 self-start rounded-full border border-foreground/80 px-4"
    >
      {wordmark ? (
        <>
          <Logo logo={PLAYSTATION_SYMBOL} height={18} color={foreground} />
          <Logo logo={wordmark} height={11} color={foreground} />
        </>
      ) : (
        <Text className="text-sm font-bold tracking-wide">{label}</Text>
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
