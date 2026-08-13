import { copy } from "@/lib/redtent";
import { getPeriodForecastStatus } from "@/lib/cycleForecast";
import CycleCalendarCard from "@/components/CycleCalendarCard";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { CirclePlus, Heart, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useMemo, useState } from "react";

export default function Home() {
  const { data, isLoading, error } = trpc.dashboard.overview.useQuery();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const range = useMemo(() => ({ startAt: new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1), endAt: new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0) }), [visibleMonth]);
  const calendar = trpc.cycles.calendar.useQuery(range);
  if (isLoading) return <DashboardLoading />;
  if (error || !data) return <ErrorState title="Your cycle space is not loading yet" detail="Refresh to reconnect with your private Redtent calendar." />;
  const displayName = data.profile.username || user?.name || "there";
  const periodStatus = getPeriodForecastStatus(data.summary.nextPeriodAt);

  return <div className="mx-auto max-w-5xl px-4 pb-8 pt-4 sm:px-7 sm:pt-5 lg:px-10 lg:pt-9">
    <header className="flex items-start justify-between gap-4"><div><p className="eyebrow">{copy.tagline}</p><h1 className="mt-1 font-display text-3xl leading-[1.03] sm:text-4xl">Your cycle, {displayName.split(" ")[0]}.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#806A63]">Your calendar leads. The rest can wait.</p></div><button onClick={() => setLocation("/profile")} className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#E9D6D0] text-[#9E4B5A] transition hover:bg-[#DFBDB5]" aria-label="Open your profile">{data.profile.profilePhotoUrl ? <img src={data.profile.profilePhotoUrl} alt="Your Redtent profile" className="h-full w-full object-cover" /> : displayName.slice(0, 1).toUpperCase()}</button></header>
    <div className="mt-5 sm:mt-7"><CycleCalendarCard month={visibleMonth} marks={calendar.data} isLoading={calendar.isLoading} status={periodStatus} onPrevious={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))} onNext={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))} onOpenCycle={() => setLocation("/cycle")} /></div>
    <section className="mt-6"><div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Today, only if it helps</p><h2 className="mt-1 font-display text-2xl">A few small ways to check in.</h2></div><button onClick={() => setLocation("/wellness")} className="text-sm font-semibold text-[#A84D5F]">Open check-in</button></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><QuickAction icon={Heart} title="Mood" detail={data.todayWellness?.mood ? "Logged today" : "Name how you feel"} onClick={() => setLocation("/wellness")} /><QuickAction icon={CirclePlus} title="Energy" detail={data.todayWellness?.energy ? "Logged today" : "A small signal"} onClick={() => setLocation("/wellness")} /><QuickAction icon={Sparkles} title="Food Lens" detail="See food in context" onClick={() => setLocation("/food")} /></div></section>
    <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E8D6D0] bg-[#FFFDFB] px-5 py-4"><p className="text-sm leading-6 text-[#755E57]">Your forecast is personal and can shift. It is a planning tool, not a diagnosis or a promise.</p><button onClick={() => setLocation("/ask")} className="inline-flex items-center gap-2 rounded-xl bg-[#F4E5E0] px-4 py-2.5 text-sm font-semibold text-[#8E4B57] transition hover:bg-[#EBD2CC]"><Sparkles className="h-4 w-4" /> Ask Redtent</button></section>
  </div>;
}

function QuickAction({ icon: Icon, title, detail, onClick }: { icon: typeof Heart; title: string; detail: string; onClick: () => void }) { return <button onClick={onClick} className="rose-card flex items-center gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(113,71,61,0.12)]"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F7E7E3] text-[#B45263]"><Icon className="h-5 w-5" /></div><div><p className="font-semibold">{title}</p><p className="mt-0.5 text-xs text-[#8D756C]">{detail}</p></div></button>; }

export function DashboardLoading() { return <div className="mx-auto max-w-5xl px-4 py-6 sm:px-7 lg:px-10"><div className="h-10 w-56 animate-pulse rounded-xl bg-[#F1E5E0]" /><div className="mt-7 h-[32rem] animate-pulse rounded-[1.7rem] bg-[#EBD8D3]" /></div>; }
export function ErrorState({ title, detail }: { title: string; detail: string }) { return <div className="mx-auto grid min-h-[60vh] max-w-lg place-items-center px-5 text-center"><div className="rose-card p-8"><p className="font-display text-3xl">{title}</p><p className="mt-3 text-sm leading-6 text-[#806A63]">{detail}</p><button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-[#A84D5F] px-4 py-2.5 text-sm font-semibold text-white">Reconnect my space</button></div></div>; }
