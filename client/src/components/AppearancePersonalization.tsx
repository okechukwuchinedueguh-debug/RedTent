import React from "react";
import { Contrast, Palette } from "lucide-react";
import { useTheme, type AccentIntensity } from "@/contexts/ThemeContext";

const intensities: Array<{ value: AccentIntensity; label: string; detail: string }> = [
  { value: "soft", label: "Gentle", detail: "Quieter highlights" },
  { value: "balanced", label: "Balanced", detail: "Everyday contrast" },
  { value: "bold", label: "Bold", detail: "Stronger highlights" },
];

export function AppearancePersonalization() {
  const { accentIntensity, setAccentIntensity, highContrast, setHighContrast } = useTheme();
  return <article className="rose-card p-5"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F8E8E5] text-[#A84D5F]"><Palette className="h-5 w-5" /></div><div><p className="eyebrow">Personalization</p><h2 className="mt-1 font-display text-2xl">Tune the visual emphasis.</h2></div></div><p className="mt-3 text-sm leading-6 text-[#806A63]">Choose how prominent Redtent’s rose highlights feel. These appearance choices stay on this device.</p><fieldset className="mt-5"><legend className="text-xs font-bold uppercase tracking-wide text-[#806A63]">Accent intensity</legend><div className="mt-2 grid gap-2 sm:grid-cols-3">{intensities.map(option => <button type="button" key={option.value} onClick={() => setAccentIntensity(option.value)} aria-pressed={accentIntensity === option.value} className={`appearance-intensity-choice ${accentIntensity === option.value ? "active" : ""}`}><span>{option.label}</span><small>{option.detail}</small></button>)}</div></fieldset><div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-[#E7D8D3] bg-[#FFFDFB] p-3"><div className="flex items-start gap-3"><Contrast className="mt-0.5 h-4 w-4 shrink-0 text-[#A84D5F]" /><div><p className="text-sm font-bold text-[#5E3E38]">High contrast</p><p className="mt-0.5 text-xs leading-5 text-[#806A63]">Increase the difference between text, borders, and surfaces.</p></div></div><button type="button" role="switch" aria-checked={highContrast} onClick={() => setHighContrast(!highContrast)} className={`accessibility-switch ${highContrast ? "active" : ""}`}><span className="sr-only">Enable high contrast</span><i /></button></div></article>;
}
