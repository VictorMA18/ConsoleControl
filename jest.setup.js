/* eslint-env jest */
// Reanimated 4 no corre en Jest (su mock oficial falla con este preset). La app solo usa
// Animated.View y useReducedMotion, así que basta con este reemplazo mínimo.
jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View },
    useReducedMotion: jest.fn(() => false),
  };
});
