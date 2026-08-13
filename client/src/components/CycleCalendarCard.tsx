import React from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { PeriodForecastStatus } from "@/lib/cycleForecast";

type CalendarMark = {
  date: Date;
  cycleDay: number | null;
  phase: "menstrual" | "follicular" | "ovulation" | "luteal" | null;
  isLoggedPeriod: boolean;
  isPredictedPeriod: boolean;
};

type CycleCalendarCardProps = {
  month: Date;
  marks?: CalendarMark[];
  isLoading?: boolean;
  status: PeriodForecastStatus;
  onPrevious: () => void;
  onNext: () => void;
  onAddPeriod: () => void;
  onOpenCycle: () => void;
};

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function sameCalendarDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function statusStyles(kind: PeriodForecastStatus["kind"]) {
  if (kind === "late") return "border-[#D99AA1] bg-[#FFF2F2] text-[#984B59]";
  if (kind === "upcoming" || kind === "today") return "border-[#DAC185] bg-[#FFF9EA] text-[#806329]";
  return "border-[#E5D5D0] bg-[#FFFDFB] text-[#714B4A]";
}

export default function CycleCalendarCard({ month, marks, isLoading, status, onPrevious, onNext, onAddPeriod, onOpenCycle }: CycleCalendarCardProps) {
  const monthTitle = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(month);
  const leadingDays = (month.getDay() + 6) % 7;
  const expectedDay = status.expectedAt;

  return <section className="rose-card overflow-hidden p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="eyebrow">Cycle calendar</p><h2 className="mt-1 font-display text-2xl sm:text-3xl">Your cycle, at a glance.</h2></div>
      <button onClick={onAddPeriod} className="rounded-xl bg-[#A84D5F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8F3F50]">Add period date</button>
    </div>
    <div className={`calendar-status calendar-status--${status.kind} mt-5 rounded-2xl border p-4 ${statusStyles(status.kind)}`}><p className="text-xs font-bold uppercase tracking-[0.16em]">Next period estimate</p><p className="mt-1 font-display text-xl sm:text-2xl">{status.title}</p><p className="mt-1 max-w-2xl text-sm leading-6 opacity-90">{status.detail}</p></div>
    <div className="mt-6 flex items-center justify-between gap-3"><button onClick={onPrevious} className="grid h-9 w-9 place-items-center rounded-full text-[#7A5A53] transition hover:bg-[#F5E8E3]" aria-label="View previous month"><ChevronLeft className="h-5 w-5" /></button><h3 className="font-display text-xl sm:text-2xl">{monthTitle}</h3><button onClick={onNext} className="grid h-9 w-9 place-items-center rounded-full text-[#7A5A53] transition hover:bg-[#F5E8E3]" aria-label="View next month"><ChevronRight className="h-5 w-5" /></button></div>
    <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wide text-[#9B827A] sm:text-[11px]">{weekdayLabels.map(day => <span key={day} className="py-1">{day}</span>)}</div>
    {isLoading ? <div className="grid min-h-72 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-[#B45263]" /></div> : <div className="grid grid-cols-7 gap-1">{Array.from({ length: leadingDays }).map((_, index) => <div key={`empty-${index}`} className="aspect-square" />)}{marks?.map(mark => <CalendarDay key={mark.date.toString()} mark={mark} isExpectedPastDate={status.kind === "late" && expectedDay ? sameCalendarDay(mark.date, expectedDay) : false} />)}</div>}
    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#806A63]"><Legend className="bg-[#C66E78]" text="Logged period" /><Legend className="border border-dashed border-[#C66E78] bg-[#FFF3F3]" text="Estimated period" />{status.kind === "late" ? <Legend className="border-2 border-[#B85262] bg-[#FFF2F2]" text="Past estimate" /> : null}</div>
    <div className="mt-5 flex justify-end"><button onClick={onOpenCycle} className="text-sm font-semibold text-[#A84D5F] underline decoration-[#E2B8BA] underline-offset-4">Open full Cycle Forecast</button></div>
  </section>;
}

function CalendarDay({ mark, isExpectedPastDate }: { mark: CalendarMark; isExpectedPastDate: boolean }) {
  const today = new Date();
  const isToday = sameCalendarDay(mark.date, today);
  const state = mark.isLoggedPeriod ? "logged" : mark.isPredictedPeriod ? "estimated" : mark.phase || "empty";
  const color = mark.isLoggedPeriod ? "bg-[#C66E78] text-white" : mark.isPredictedPeriod ? "border border-dashed border-[#C66E78] bg-[#FFF3F3] text-[#A64B5C]" : mark.phase === "follicular" ? "bg-[#F8E1B3] text-[#5D4822]" : mark.phase === "ovulation" ? "bg-[#DCE9D9] text-[#436247]" : mark.phase === "luteal" ? "bg-[#DED0DF] text-[#5D4B69]" : mark.phase === "menstrual" ? "bg-[#F8E8E5] text-[#834C55]" : "border border-[#F0E5DF] bg-[#FFFCFA] text-[#9A837A]";
  return <div className={`calendar-day calendar-day--${state} relative flex aspect-square min-h-9 flex-col items-center justify-center rounded-lg text-[11px] sm:min-h-13 sm:rounded-xl sm:text-xs ${color} ${isToday ? "ring-2 ring-[#513039] ring-offset-2" : ""} ${isExpectedPastDate ? "calendar-day--past ring-2 ring-[#B85262] ring-offset-1" : ""}`} title={isExpectedPastDate ? "Past estimated period date" : mark.isPredictedPeriod ? "Estimated period day" : mark.isLoggedPeriod ? "Logged period day" : "Cycle day"}><span className="font-bold">{mark.date.getDate()}</span>{isExpectedPastDate ? <span className="mt-0.5 hidden text-[8px] font-bold sm:block">EST.</span> : null}</div>;
}

function Legend({ className, text }: { className: string; text: string }) { return <span className="inline-flex items-center gap-1.5"><i className={`h-3 w-3 rounded-full ${className}`} />{text}</span>; }
