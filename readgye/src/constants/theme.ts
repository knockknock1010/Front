import { Dimensions } from 'react-native';

// ─── 반응형 스케일링 ───
// 기준 디자인: 375 x 812 (iPhone X / 일반 안드로이드 기준)
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/** 수평 스케일 (width 기반) — 아이콘, 아바타, 수평 패딩 등 */
export const hs = (size: number) => Math.round((SCREEN_WIDTH / BASE_WIDTH) * size);

/** 수직 스케일 (height 기반) — 수직 패딩/마진 등 */
export const vs = (size: number) => Math.round((SCREEN_HEIGHT / BASE_HEIGHT) * size);

/** 폰트/아이콘 등 완만한 스케일 (factor 기본 0.5) */
export const ms = (size: number, factor = 0.5) =>
  Math.round(size + (hs(size) - size) * factor);

export const Colors = {
  primary: '#FBBF24',
  primaryDark: '#D97706',
  secondary: '#FFFBEB',
  accent: '#F59E0B',
  backgroundLight: '#FFFCF5',
  backgroundDark: '#1C1917',
  surfaceLight: '#FFFFFF',
  surfaceDark: '#292524',
  stone50: '#FAFAF9',
  stone100: '#F5F5F4',
  stone200: '#E7E5E4',
  stone300: '#D6D3D1',
  stone400: '#A8A29E',
  stone500: '#78716C',
  stone600: '#57534E',
  stone700: '#44403C',
  stone800: '#292524',
  stone900: '#1C1917',
  white: '#FFFFFF',
  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red500: '#EF4444',
  red600: '#DC2626',
  red800: '#991B1B',
  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green400: '#4ADE80',
  green500: '#22C55E',
  green600: '#16A34A',
  green800: '#166534',
  yellow50: '#FEFCE8',
  yellow100: '#FEF9C3',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 24,
  '3xl': 30,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
