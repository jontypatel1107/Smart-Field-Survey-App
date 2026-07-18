import { useEffect, useState } from 'react';
import { useTheme } from './use-theme';

export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const { resolved } = useTheme();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (hasHydrated) {
    return resolved;
  }

  return 'light';
}
