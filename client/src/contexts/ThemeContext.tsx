import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_THEME_PREFERENCE, nextThemeTransition, resolveThemePreference, type ResolvedTheme, type ThemePreference } from "@/lib/themePreference";
import { runThemeTransition } from "@/lib/themeTransition";
import { toast } from "sonner";

interface ThemeContextType {
  theme: ResolvedTheme;
  preference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
  accentIntensity: AccentIntensity;
  setAccentIntensity: (intensity: AccentIntensity) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

export type AccentIntensity = "soft" | "balanced" | "bold";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function readInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return DEFAULT_THEME_PREFERENCE;
  const requested = new URLSearchParams(window.location.search).get("appearance");
  if (requested === "light" || requested === "dark" || requested === "auto") return requested;
  const stored = window.localStorage.getItem("redtent-theme-preference");
  return stored === "light" || stored === "dark" || stored === "auto" ? stored : DEFAULT_THEME_PREFERENCE;
}

function readAccentIntensity(): AccentIntensity {
  if (typeof window === "undefined") return "balanced";
  const stored = window.localStorage.getItem("redtent-accent-intensity");
  return stored === "soft" || stored === "bold" || stored === "balanced" ? stored : "balanced";
}

function readHighContrastPreference() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("redtent-high-contrast") === "true";
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [preference, setPreference] = useState<ThemePreference>(readInitialPreference);
  const [accentIntensity, setAccentIntensityState] = useState<AccentIntensity>(readAccentIntensity);
  const [highContrast, setHighContrastState] = useState(readHighContrastPreference);
  const [now, setNow] = useState(() => new Date());
  const theme = useMemo(() => resolveThemePreference(preference, now), [preference, now]);
  const previousAppearance = useRef<string | null>(null);
  const appearanceSignature = `${theme}:${accentIntensity}:${highContrast ? "high" : "standard"}`;

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      root.classList.toggle("dark", theme === "dark");
      root.classList.toggle("high-contrast", highContrast);
      root.dataset.accentIntensity = accentIntensity;
      root.style.colorScheme = theme;
    };
    const reduceMotion = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanup = runThemeTransition({ root, previousAppearance: previousAppearance.current, nextAppearance: appearanceSignature, prefersReducedMotion: reduceMotion, applyTheme, requestFrame: callback => window.requestAnimationFrame(callback), cancelFrame: id => window.cancelAnimationFrame(id), scheduleTimeout: (callback, delay) => window.setTimeout(callback, delay), clearScheduledTimeout: id => window.clearTimeout(id) });
    previousAppearance.current = appearanceSignature;
    return cleanup;
  }, [theme, accentIntensity, highContrast, appearanceSignature]);

  useEffect(() => {
    window.localStorage.setItem("redtent-theme-preference", preference);
  }, [preference]);

  useEffect(() => {
    window.localStorage.setItem("redtent-accent-intensity", accentIntensity);
  }, [accentIntensity]);

  useEffect(() => {
    window.localStorage.setItem("redtent-high-contrast", String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    const next = nextThemeTransition(preference, now);
    if (!next) return;
    const timeout = window.setTimeout(() => setNow(new Date()), Math.max(1_000, next.getTime() - Date.now() + 500));
    return () => window.clearTimeout(timeout);
  }, [now, preference]);

  const setThemePreference = (nextPreference: ThemePreference) => {
    if (nextPreference === preference) return;
    setPreference(nextPreference);
    const label = nextPreference === "auto" ? "Automatic mode" : `${nextPreference[0].toUpperCase()}${nextPreference.slice(1)} mode`;
    toast.success(`Appearance updated: ${label}.`);
  };

  const setAccentIntensity = (nextIntensity: AccentIntensity) => {
    if (nextIntensity === accentIntensity) return;
    setAccentIntensityState(nextIntensity);
    const label = nextIntensity === "soft" ? "Gentle" : nextIntensity === "bold" ? "Bold" : "Balanced";
    toast.success(`Appearance updated: ${label} accents.`);
  };

  const setHighContrast = (enabled: boolean) => {
    if (enabled === highContrast) return;
    setHighContrastState(enabled);
    toast.success(`Appearance updated: High contrast ${enabled ? "on" : "off"}.`);
  };

  return (
    <ThemeContext.Provider value={{ theme, preference, setThemePreference, toggleTheme: () => setThemePreference(theme === "light" ? "dark" : "light"), accentIntensity, setAccentIntensity, highContrast, setHighContrast }}>
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
