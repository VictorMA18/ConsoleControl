/* eslint-env jest */
// Reanimated 4 no corre en Jest (su mock oficial falla con este preset). La app solo usa
// Animated.View y useReducedMotion, así que basta con este reemplazo mínimo.
// Las animaciones de entrada y reacomodo (FadeIn, LinearTransition, Keyframe) se reemplazan por un
// objeto encadenable que no hace nada.
jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  const chainable = () => {
    const builder = new Proxy({}, { get: () => () => builder });
    return builder;
  };
  return {
    __esModule: true,
    default: { View },
    useReducedMotion: jest.fn(() => false),
    cubicBezier: () => 'ease-out',
    Easing: { bezier: () => () => 0 },
    ReduceMotion: { System: 'system' },
    FadeIn: chainable(),
    LinearTransition: chainable(),
    Keyframe: function Keyframe() {
      return chainable();
    },
  };
});
