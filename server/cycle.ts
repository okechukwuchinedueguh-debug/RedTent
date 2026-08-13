import type { CycleLog } from "../drizzle/schema";

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export type CycleSummary = {
  cycleDay: number;
  phase: CyclePhase;
  phaseDay: number;
  daysUntilNextPhase: number;
  nextPhase: CyclePhase;
  nextPeriodAt: Date | null;
  currentCycleStartAt: Date | null;
  averageCycleLength: number;
  medianCycleLength: number;
  averagePeriodLength: number;
  variation: number;
  confidence: "building" | "low" | "medium" | "high";
};

export type CycleMoment = "menstrual" | "post-menstrual" | "follicular" | "ovulation" | "premenstrual" | "luteal";

export type CycleExperience = {
  id: CycleMoment;
  label: string;
  title: string;
  detail: string;
  checkIn: string;
  signals: string[];
};

export type CalendarMark = {
  date: Date;
  cycleDay: number | null;
  phase: CyclePhase | null;
  isLoggedPeriod: boolean;
  isPredictedPeriod: boolean;
  isFutureEstimate: boolean;
};

const DAY = 24 * 60 * 60 * 1000;

function utcDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function daysBetween(start: Date, end: Date): number {
  return Math.round((utcDay(end).getTime() - utcDay(start).getTime()) / DAY);
}

function median(values: number[]): number {
  if (!values.length) return 28;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

export function getPhaseForCycleDay(cycleDay: number, cycleLength: number, periodLength: number): CyclePhase {
  const ovulationStart = Math.max(periodLength + 1, cycleLength - 15);
  const ovulationEnd = Math.min(cycleLength, ovulationStart + 2);
  if (cycleDay <= periodLength) return "menstrual";
  if (cycleDay < ovulationStart) return "follicular";
  if (cycleDay <= ovulationEnd) return "ovulation";
  return "luteal";
}

export function getCycleSummary(logs: CycleLog[], now = new Date(), defaults = { cycleLength: 28, periodLength: 5 }): CycleSummary {
  const ordered = [...logs].sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
  const lengths = ordered
    .slice(0, -1)
    .map((log, index) => daysBetween(ordered[index + 1].startAt, log.startAt))
    .filter(length => length >= 18 && length <= 60);
  const observedPeriods = ordered
    .filter(log => log.endAt)
    .map(log => Math.max(1, daysBetween(log.startAt, log.endAt as Date) + 1))
    .filter(length => length <= 14);
  const averageCycleLength = lengths.length ? Math.round(lengths.reduce((sum, length) => sum + length, 0) / lengths.length) : defaults.cycleLength;
  const medianCycleLength = lengths.length ? median(lengths) : defaults.cycleLength;
  const averagePeriodLength = observedPeriods.length ? Math.round(observedPeriods.reduce((sum, length) => sum + length, 0) / observedPeriods.length) : defaults.periodLength;
  const variation = lengths.length > 1 ? Math.round(Math.max(...lengths) - Math.min(...lengths)) : 0;
  const confidence = lengths.length >= 4 && variation <= 4 ? "high" : lengths.length >= 2 ? "medium" : lengths.length === 1 ? "low" : "building";
  const currentCycleStartAt = ordered[0]?.startAt ?? null;
  const rawCycleDay = currentCycleStartAt ? daysBetween(currentCycleStartAt, now) + 1 : 1;
  const cycleDay = Math.max(1, rawCycleDay);
  const phase = getPhaseForCycleDay(cycleDay, averageCycleLength, averagePeriodLength);
  const nextPhase = phase === "menstrual" ? "follicular" : phase === "follicular" ? "ovulation" : phase === "ovulation" ? "luteal" : "menstrual";
  const ovulationStart = Math.max(averagePeriodLength + 1, averageCycleLength - 15);
  const ovulationEnd = Math.min(averageCycleLength, ovulationStart + 2);
  const nextPhaseDay = phase === "menstrual" ? averagePeriodLength + 1 : phase === "follicular" ? ovulationStart : phase === "ovulation" ? ovulationEnd + 1 : averageCycleLength + 1;
  const daysUntilNextPhase = Math.max(0, nextPhaseDay - cycleDay);
  const nextPeriodAt = currentCycleStartAt ? new Date(utcDay(currentCycleStartAt).getTime() + averageCycleLength * DAY) : null;

  return {
    cycleDay,
    phase,
    phaseDay: phase === "menstrual" ? cycleDay : phase === "follicular" ? cycleDay - averagePeriodLength : phase === "ovulation" ? cycleDay - ovulationStart + 1 : cycleDay - ovulationEnd,
    daysUntilNextPhase,
    nextPhase,
    nextPeriodAt,
    currentCycleStartAt,
    averageCycleLength,
    medianCycleLength,
    averagePeriodLength,
    variation,
    confidence,
  };
}

export function getCycleExperience(summary: CycleSummary): CycleExperience {
  if (summary.phase === "follicular" && summary.phaseDay <= 5) {
    return { id: "post-menstrual", label: "Post-menstrual context", title: "After your period", detail: "Your period has likely just ended. Some people notice shifts in energy, mood, appetite, skin, or discharge here. Treat this as a personal check-in, not a rule.", checkIn: "What feels different since your period ended?", signals: ["Energy shifts", "Mood changes", "Sleep", "Skin or discharge"] };
  }
  if (summary.phase === "luteal" && summary.daysUntilNextPhase <= 7) {
    return { id: "premenstrual", label: "Premenstrual context", title: "Your pre-period window", detail: "Your next period is estimated within about a week. Some people notice changes in energy, mood, sleep, appetite, breasts, skin, bloating, or cramps. Notice only what is true for you.", checkIn: "What would make the days before your period feel more supported?", signals: ["Energy or mood", "Sleep", "Appetite or cravings", "Bloating, cramps, breasts, or skin"] };
  }
  const experiences: Record<CyclePhase, CycleExperience> = {
    menstrual: { id: "menstrual", label: "Menstrual context", title: "During your period", detail: "A simple check-in can help you notice what supports you while you are bleeding. There is no expected way to feel.", checkIn: "What would feel supportive during your period today?", signals: ["Flow", "Cramps or comfort", "Energy", "Rest"] },
    follicular: { id: "follicular", label: "Follicular context", title: "Your post-period rhythm", detail: "This is an estimated part of your cycle after menstruation. Notice the routines, food, rest, and pace that feel useful for you.", checkIn: "What feels steady in your routine right now?", signals: ["Energy", "Mood", "Sleep", "Focus"] },
    ovulation: { id: "ovulation", label: "Ovulation context", title: "Your mid-cycle rhythm", detail: "This is an estimated mid-cycle window. Let your own check-ins, rather than expectations, guide what you notice.", checkIn: "What helps you stay grounded today?", signals: ["Energy", "Sleep", "Comfort", "Focus"] },
    luteal: { id: "luteal", label: "Luteal context", title: "Your later-cycle rhythm", detail: "This is an estimated later-cycle window. Gentle planning and a clear record of what you notice can be useful over time.", checkIn: "What would make this part of your cycle feel more manageable?", signals: ["Energy", "Mood", "Sleep", "Comfort"] },
  };
  return experiences[summary.phase];
}

export function phaseGuidance(phase: CyclePhase, moment?: CycleMoment) {
  if (moment === "post-menstrual") return { title: "Nourish after your period", description: "As bleeding ends, choose meals and routines that feel steady for you. Protein, fluids, fibre-rich plants, and iron-containing foods can be flexible options if they fit your usual way of eating.", foods: ["Beans or lentils", "Eggs or tofu", "Leafy greens", "Fruit with vitamin C"] };
  if (moment === "premenstrual") return { title: "Prepare for your pre-period window", description: "In the days before an estimated period, regular meals, fluids, fibre, protein, magnesium-rich foods, and satisfying snacks can be gentle options to explore, never rules to follow.", foods: ["Oats", "Yoghurt or alternatives", "Pumpkin seeds", "Plantain or whole grains"] };
  const guidance = {
    menstrual: {
      title: "Replenish with intention",
      description: "Choose meals that feel steady and restoring. If they fit your usual way of eating, iron-containing foods, vitamin C sources, fluids, and protein can be supportive options.",
      foods: ["Beans or lentils", "Leafy greens", "Eggs", "Citrus or berries"],
    },
    follicular: {
      title: "Build your momentum",
      description: "As your energy shifts, explore satisfying meals with protein, colourful plants, and carbohydrates that help you feel ready for the day.",
      foods: ["Yogurt or fortified alternatives", "Whole grains", "Colourful vegetables", "Nuts and seeds"],
    },
    ovulation: {
      title: "Stay nourished and steady",
      description: "Keep your routine simple. Regular meals, fluids, fibre-rich plants, and protein can be flexible anchors when life gets full.",
      foods: ["Tomatoes", "Chickpeas", "Fish or tofu", "Melon or cucumber"],
    },
    luteal: {
      title: "Choose comfort that lasts",
      description: "Make room for satisfying meals that help you feel grounded. Foods with fibre, magnesium, protein, and healthy fats are options to explore, never rules to follow.",
      foods: ["Oats", "Avocado", "Pumpkin seeds", "Dark leafy greens"],
    },
  } as const;
  return guidance[phase];
}

export function getCalendarMarks(
  logs: CycleLog[],
  rangeStart: Date,
  rangeEnd: Date,
  defaults = { cycleLength: 28, periodLength: 5 },
  now = new Date()
): CalendarMark[] {
  const start = utcDay(rangeStart);
  const end = utcDay(rangeEnd);
  const chronological = [...logs].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const cycleLengths = chronological
    .slice(1)
    .map((log, index) => daysBetween(chronological[index].startAt, log.startAt))
    .filter(length => length >= 18 && length <= 60);
  const cycleLength = cycleLengths.length ? Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length) : defaults.cycleLength;
  const periodLengths = chronological
    .filter(log => log.endAt)
    .map(log => Math.max(1, daysBetween(log.startAt, log.endAt as Date) + 1));
  const periodLength = periodLengths.length ? Math.round(periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length) : defaults.periodLength;
  const latestKnownStart = chronological[chronological.length - 1]?.startAt;
  const marks: CalendarMark[] = [];

  for (let date = start; date <= end; date = new Date(date.getTime() + DAY)) {
    const activeLog = chronological.filter(log => utcDay(log.startAt) <= date).at(-1);
    const loggedPeriod = chronological.some(log => {
      const logStart = utcDay(log.startAt);
      const logEnd = log.endAt ? utcDay(log.endAt) : new Date(logStart.getTime() + (periodLength - 1) * DAY);
      return date >= logStart && date <= logEnd;
    });
    if (!activeLog || !latestKnownStart) {
      marks.push({ date, cycleDay: null, phase: null, isLoggedPeriod: loggedPeriod, isPredictedPeriod: false, isFutureEstimate: date > utcDay(now) });
      continue;
    }
    const daysAfterStart = daysBetween(activeLog.startAt, date);
    const cycleDay = ((daysAfterStart % cycleLength) + cycleLength) % cycleLength + 1;
    const phase = getPhaseForCycleDay(cycleDay, cycleLength, periodLength);
    const isFutureEstimate = date > utcDay(now) && utcDay(activeLog.startAt).getTime() === utcDay(latestKnownStart).getTime();
    marks.push({
      date,
      cycleDay,
      phase,
      isLoggedPeriod: loggedPeriod,
      isPredictedPeriod: !loggedPeriod && isFutureEstimate && phase === "menstrual",
      isFutureEstimate,
    });
  }
  return marks;
}
