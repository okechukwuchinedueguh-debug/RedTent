import type { ReactNode } from "react";

export type CycleMomentCardData = {
  label: string;
  title: string;
  detail: string;
  checkIn: string;
  signals: string[];
};

export function CycleMomentCard({ experience, action }: { experience: CycleMomentCardData; action?: ReactNode }) {
  return <section className="rose-card border-[#E9D1D1] p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="max-w-2xl"><p className="eyebrow">{experience.label}</p><h2 className="mt-1 font-display text-2xl">{experience.title}</h2><p className="mt-2 text-sm leading-6 text-[#765E58]">{experience.detail}</p></div>{action}</div><div className="mt-4 rounded-xl bg-[#F8E9E5] px-4 py-3"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#A56472]">A gentle check-in</p><p className="mt-1 text-sm font-semibold text-[#654A44]">{experience.checkIn}</p></div><div className="mt-4 flex flex-wrap gap-2">{experience.signals.map(signal => <span key={signal} className="rounded-full bg-[#F7EAE6] px-3 py-1.5 text-xs font-semibold text-[#765D54]">{signal}</span>)}</div></section>;
}
