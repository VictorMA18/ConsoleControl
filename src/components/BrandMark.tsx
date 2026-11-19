import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

// Dibujo del ícono de la app (assets/brand/icon.svg): mando blanco roto sobre grafito. La marca es
// en blanco y negro y no cambia con el tema; los dos tonos son HSL, sin negro ni blanco puros.
const GRAPHITE = 'hsl(225 14% 10%)';
const WHITE = 'hsl(220 20% 97%)';
const BODY =
  'M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z';

export function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect width={24} height={24} rx={6} fill={GRAPHITE} />
      <G transform="translate(12 12.2) scale(0.66) translate(-12 -12)">
        <Path d={BODY} fill={WHITE} stroke={WHITE} strokeWidth={1.2} strokeLinejoin="round" />
        <Line
          x1={6.3}
          y1={11}
          x2={9.7}
          y2={11}
          stroke={GRAPHITE}
          strokeWidth={1.7}
          strokeLinecap="round"
        />
        <Line
          x1={8}
          y1={9.3}
          x2={8}
          y2={12.7}
          stroke={GRAPHITE}
          strokeWidth={1.7}
          strokeLinecap="round"
        />
        <Circle cx={15.2} cy={12} r={1.15} fill={GRAPHITE} />
        <Circle cx={17.8} cy={9.8} r={1.15} fill={GRAPHITE} />
      </G>
    </Svg>
  );
}
