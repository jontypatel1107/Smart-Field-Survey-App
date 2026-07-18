import { useState, useEffect, useCallback } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

let listeners: Array<() => void> = [];
let currentPreference: ThemePreference = 'system';

function notify() {
  listeners.forEach((l) => l());
}

export function setThemePreference(pref: ThemePreference) {
  currentPreference = pref;
  try {
    const fs = require('expo-file-system/legacy');
    const path = `${fs.documentDirectory}theme_preference.json`;
    fs.writeAsStringAsync(path, JSON.stringify({ preference: pref })).catch(() => {});
  } catch {}
  notify();
}

export function getThemePreference(): ThemePreference {
  return currentPreference;
}

export function useTheme() {
  const systemTheme = useSystemColorScheme() ?? 'light';
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  useEffect(() => {
    try {
      const fs = require('expo-file-system/legacy');
      const path = `${fs.documentDirectory}theme_preference.json`;
      fs.readAsStringAsync(path)
        .then((data: string) => {
          const parsed = JSON.parse(data);
          if (parsed?.preference) {
            currentPreference = parsed.preference;
            forceUpdate((n) => n + 1);
          }
        })
        .catch(() => {});
    } catch {}
  }, []);

  const resolved: ResolvedTheme =
    currentPreference === 'system' ? systemTheme : currentPreference;

  const setPreference = useCallback((pref: ThemePreference) => {
    setThemePreference(pref);
  }, []);

  return {
    preference: currentPreference,
    resolved,
    isDark: resolved === 'dark',
    setPreference,
  };
}
