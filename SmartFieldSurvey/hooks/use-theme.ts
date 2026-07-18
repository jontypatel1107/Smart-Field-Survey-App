import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const THEME_FILE = `${FileSystem.documentDirectory}theme_preference.json`;

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  isDark: boolean;
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useSystemColorScheme() ?? 'light';
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [resolved, setResolved] = useState<ResolvedTheme>(systemTheme);

  useEffect(() => {
    FileSystem.readAsStringAsync(THEME_FILE)
      .then((data) => {
        const parsed = JSON.parse(data);
        if (parsed?.preference) {
          setPreferenceState(parsed.preference);
          if (parsed.preference === 'light' || parsed.preference === 'dark') {
            setResolved(parsed.preference);
          } else {
            setResolved(systemTheme);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (preference === 'system') {
      setResolved(systemTheme);
    } else {
      setResolved(preference);
    }
  }, [preference, systemTheme]);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    FileSystem.writeAsStringAsync(THEME_FILE, JSON.stringify({ preference: pref }));
  }, []);

  const isDark = resolved === 'dark';

  return (
    <ThemeContext.Provider value={{ preference, resolved, isDark, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
