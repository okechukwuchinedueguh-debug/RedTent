import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { nextThemeTransition, resolveThemePreference, type ResolvedTheme, type ThemePreference } from "@/lib/themePreference";
import { runThemeTransition } from "@/lib/themeTransition";

interface ThemeContextType {
  theme: ResolvedTheme;
  preference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function readInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return "auto";
  const requested = new URLSearchParams(window.location.search).get("appearance");
  if (requested === "light" || requested === "dark" || requested === "auto") return requested;
  const stored = window.localStorage.getItem("redtent-theme-preference");
  return stored === "light" || stored === "dark" || stored === "auto" ? stored : "auto";
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [preference, setPreference] = useState<ThemePreference>(readInitialPreference);
  const [now, setNow] = useState(() => new Date());
  const theme = useMemo(() => resolveThemePreference(preference, now), [preference, now]);
  const previousTheme = useRef<ResolvedTheme | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      root.classList.toggle("dark", theme === "dark");
      root.style.colorScheme = theme;
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanup = runThemeTransition({ root, previousTheme: previousTheme.current, nextTheme: theme, prefersReducedMotion: reduceMotion, applyTheme, requestFrame: callback => window.requestAnimationFrame(callback), cancelFrame: id => window.cancelAnimationFrame(id), scheduleTimeout: (callback, delay) => window.setTimeout(callback, delay), clearScheduledTimeout: id => window.clearTimeout(id) });
    previousTheme.current = theme;
    return cleanup;
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("redtent-theme-preference", preference);
  }, [preference]);

  useEffect(() => {
    const next = nextThemeTransition(preference, now);
    if (!next) return;
    const timeout = window.setTimeout(() => setNow(new Date()), Math.max(1_000, next.getTime() - Date.now() + 500));
    return () => window.clearTimeout(timeout);
  }, [now, preference]);

  return (
    <ThemeContext.Provider value={{ theme, preference, setThemePreference: setPreference, toggleTheme: () => setPreference(theme === "light" ? "dark" : "light") }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
