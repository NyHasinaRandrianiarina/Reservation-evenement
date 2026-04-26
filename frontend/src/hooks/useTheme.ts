import { useCallback, useSyncExternalStore } from "react";
import {
  THEME_STORAGE_KEY,
  type Theme,
  applyTheme,
  readStoredTheme,
} from "@/lib/theme";

let themeState: Theme = readStoredTheme();
const listeners = new Set<() => void>();

function getSnapshot(): Theme {
  return themeState;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function setThemeState(next: Theme): void {
  themeState = next;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  applyTheme(next);
  listeners.forEach((l) => l());
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return { theme, setTheme, toggleTheme };
}
