import React from "react";
import { MonitorCog, Moon, Sun } from "lucide-react";
import type { ResolvedTheme, ThemePreference } from "@/lib/themePreference";

const choices: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "auto", label: "Auto", icon: MonitorCog },
];

export default function ThemeChoiceGroup({ preference, resolvedTheme, onPreferenceChange }: { preference: ThemePreference; resolvedTheme: ResolvedTheme; onPreferenceChange: (preference: ThemePreference) => void }) {
  return <><div className="mt-5 grid grid-cols-3 gap-2" role="group" aria-label="Theme preference">{choices.map(({ value, label, icon: Icon }) => <button type="button" key={value} onClick={() => onPreferenceChange(value)} aria-pressed={preference === value} className={`theme-choice ${preference === value ? "active" : ""}`}><Icon className="h-4 w-4" /> {label}</button>)}</div><p className="mt-3 text-xs font-semibold text-[#8B7069]">Currently using {resolvedTheme} mode.</p></>;
}
