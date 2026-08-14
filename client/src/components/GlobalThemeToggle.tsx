import React from "react";
import { Accessibility, Moon, SlidersHorizontal, Sun } from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function GlobalThemeToggle() {
  const { theme, setThemePreference } = useTheme();
  const [, setLocation] = useLocation();
  const openAppearanceSettings = () => {
    setLocation("/profile");
    window.setTimeout(() => document.getElementById("appearance-settings")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  return <fieldset className="global-theme-toggle" aria-label="Appearance preference">
    <legend className="sr-only">Appearance</legend>
    <div className="global-theme-toggle__choices" role="group" aria-label="Choose light or dark appearance">
      <button type="button" onClick={() => setThemePreference("light")} aria-pressed={theme === "light"} className={`global-theme-toggle__option ${theme === "light" ? "active" : ""}`}><Sun className="h-3.5 w-3.5" /> Light</button>
      <button type="button" onClick={() => setThemePreference("dark")} aria-pressed={theme === "dark"} className={`global-theme-toggle__option ${theme === "dark" ? "active" : ""}`}><Moon className="h-3.5 w-3.5" /> Dark</button>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><button type="button" className="global-theme-toggle__menu-trigger" aria-label="Open appearance and accessibility menu"><SlidersHorizontal className="h-3.5 w-3.5" /><span className="sr-only">Appearance options</span></button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="global-theme-toggle__menu">
        <DropdownMenuLabel className="global-theme-toggle__menu-label">Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={openAppearanceSettings} className="global-theme-toggle__menu-item"><Accessibility className="h-4 w-4" /> Appearance and accessibility settings</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </fieldset>;
}
