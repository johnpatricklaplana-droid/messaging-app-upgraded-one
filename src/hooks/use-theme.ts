/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { DARK_COLORS, LIGHT_COLORS } from '@/constants/themeMyVersion';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  return scheme === 'light' ? LIGHT_COLORS : DARK_COLORS;
}
