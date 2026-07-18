import { useTheme as useThemeBase } from './use-theme';

export function useColorScheme() {
  return useThemeBase().resolved;
}
