import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function GlobalThemeToggle() {
  const { theme, setThemePreference } = useTheme();
  return <fieldset className="global-theme-toggle" aria-label="Appearance preference">
    <legend className="global-theme-toggle__label">Appearance</legend>
    <div className="global-theme-toggle__choices" role="group" aria-label="Choose light or dark appearance">
      <button type="button" onClick={() => setThemePreference("light")} aria-pressed={theme === "light"} className={`global-theme-toggle__option ${theme === "light" ? "active" : ""}`}><Sun className="h-3.5 w-3.5" /> Light</button>
      <button type="button" onClick={() => setThemePreference("dark")} aria-pressed={theme === "dark"} className={`global-theme-toggle__option ${theme === "dark" ? "active" : ""}`}><Moon className="h-3.5 w-3.5" /> Dark</button>
    </div>
  </fieldset>;
}
