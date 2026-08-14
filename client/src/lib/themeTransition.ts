import type { ResolvedTheme } from "./themePreference";

export function shouldAnimateThemeTransition(previousAppearance: string | null, nextAppearance: string, prefersReducedMotion: boolean) {
  return previousAppearance !== null && previousAppearance !== nextAppearance && !prefersReducedMotion;
}

type ThemeTransitionRoot = { classList: { add: (name: string) => void; remove: (name: string) => void } };

export function runThemeTransition({ root, previousAppearance, nextAppearance, prefersReducedMotion, applyTheme, requestFrame, cancelFrame, scheduleTimeout, clearScheduledTimeout }: {
  root: ThemeTransitionRoot;
  previousAppearance: string | null;
  nextAppearance: string;
  prefersReducedMotion: boolean;
  applyTheme: () => void;
  requestFrame: (callback: () => void) => number;
  cancelFrame: (id: number) => void;
  scheduleTimeout: (callback: () => void, delay: number) => number;
  clearScheduledTimeout: (id: number) => void;
}) {
  if (!shouldAnimateThemeTransition(previousAppearance, nextAppearance, prefersReducedMotion)) {
    applyTheme();
    return undefined;
  }

  let timeoutId: number | null = null;
  root.classList.add("theme-transitioning");
  const frameId = requestFrame(() => {
    applyTheme();
    timeoutId = scheduleTimeout(() => root.classList.remove("theme-transitioning"), 300);
  });

  return () => {
    cancelFrame(frameId);
    if (timeoutId !== null) clearScheduledTimeout(timeoutId);
    root.classList.remove("theme-transitioning");
  };
}
