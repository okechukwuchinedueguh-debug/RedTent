export type ThemePreference = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

export function resolveThemePreference(preference: ThemePreference, now = new Date()): ResolvedTheme {
  if (preference === "light" || preference === "dark") return preference;
  const hour = now.getHours();
  return hour >= 19 || hour < 7 ? "dark" : "light";
}

export function nextThemeTransition(preference: ThemePreference, now = new Date()) {
  if (preference !== "auto") return null;
  const next = new Date(now);
  const hour = now.getHours();
  next.setHours(hour >= 7 && hour < 19 ? 19 : 7, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next;
}
