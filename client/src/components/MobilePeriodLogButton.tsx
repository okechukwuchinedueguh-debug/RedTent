import React from "react";
import { CirclePlus } from "lucide-react";
import { startPeriodLogAction } from "@/lib/periodLogAction";

export function MobilePeriodLogButton({ navigate }: { navigate: (path: string) => void }) {
  return <button type="button" onClick={() => startPeriodLogAction(navigate)} className="mobile-period-log-action -mt-7 flex w-[4.5rem] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl bg-[#B64F64] px-1 pb-2 pt-2.5 text-[0.61rem] font-bold text-white shadow-[0_10px_24px_rgba(148,56,76,0.34)] transition hover:bg-[#9C4054]" aria-label="Log a new period"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/18"><CirclePlus className="h-5 w-5" strokeWidth={2.4} /></span><span>Log period</span></button>;
}
