import { getCycleSummary } from "./cycle";
import type { CycleLog, FoodEntry, WellnessEntry } from "../drizzle/schema";

export type PatternObservation = {
  id: string;
  category: "energy" | "mood" | "symptoms" | "food" | "cycle";
  title: string;
  detail: string;
  confidence: "building" | "emerging" | "established";
};

function dayOfCycle(logs: CycleLog[], date: Date, cycleLength: number) {
  const recentStart = [...logs].sort((a, b) => b.startAt.getTime() - a.startAt.getTime()).find(log => log.startAt <= date);
  if (!recentStart) return null;
  const value = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(recentStart.startAt.getUTCFullYear(), recentStart.startAt.getUTCMonth(), recentStart.startAt.getUTCDate())) / 86_400_000) + 1;
  return value > 0 && value <= cycleLength ? value : null;
}

function confidenceFor(total: number): PatternObservation["confidence"] {
  return total >= 8 ? "established" : total >= 4 ? "emerging" : "building";
}

export function buildPatternObservations({ logs, wellness, food, cycleLength, periodLength }: { logs: CycleLog[]; wellness: WellnessEntry[]; food: FoodEntry[]; cycleLength: number; periodLength: number }): PatternObservation[] {
  const observations: PatternObservation[] = [];
  const summary = getCycleSummary(logs, new Date(), { cycleLength, periodLength });
  const dated = wellness.map(entry => ({ entry, cycleDay: dayOfCycle(logs, entry.entryAt, summary.averageCycleLength) })).filter((item): item is { entry: WellnessEntry; cycleDay: number } => item.cycleDay !== null);
  const lowEnergy = dated.filter(({ entry }) => entry.energy === "low");
  if (lowEnergy.length >= 2) {
    const averageDay = Math.round(lowEnergy.reduce((sum, item) => sum + item.cycleDay, 0) / lowEnergy.length);
    observations.push({ id: "low-energy", category: "energy", confidence: confidenceFor(lowEnergy.length), title: "Your lower-energy check-ins", detail: `You have reported lower energy most often around cycle day ${averageDay} in your recent entries. This is an observation from your logs, not a diagnosis.` });
  }
  const symptomCounts = new Map<string, number>();
  dated.forEach(({ entry }) => {
    try { (JSON.parse(entry.symptoms) as string[]).forEach(symptom => symptomCounts.set(symptom, (symptomCounts.get(symptom) || 0) + 1)); } catch { /* Existing malformed legacy entry: safely ignore. */ }
  });
  const topSymptom = Array.from(symptomCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  if (topSymptom && topSymptom[1] >= 2) {
    observations.push({ id: `symptom-${topSymptom[0]}`, category: "symptoms", confidence: confidenceFor(topSymptom[1]), title: `A recurring ${topSymptom[0]} check-in`, detail: `You have reported ${topSymptom[0]} in ${topSymptom[1]} recent check-ins. Keeping an eye on your own notes can help you discuss changes with a qualified clinician if needed.` });
  }
  if (food.length >= 3) {
    observations.push({ id: "food-rhythm", category: "food", confidence: confidenceFor(food.length), title: "Your Food Lens is taking shape", detail: `You have saved ${food.length} food snapshots. More meals across different days help Redtent surface a fuller picture of what you choose to eat.` });
  }
  if (logs.length >= 2) {
    observations.push({ id: "cycle-rhythm", category: "cycle", confidence: summary.confidence === "high" ? "established" : "emerging", title: "Your cycle forecast is becoming more personal", detail: `Redtent is using ${logs.length} logged cycles to refine your estimated timing. Forecasts remain estimates and can change as you add new information.` });
  }
  return observations.slice(0, 4);
}

export function buildTomorrowBriefing({ phase, nextPhase, daysUntilNextPhase, todayWellness, observations }: { phase: string; nextPhase: string; daysUntilNextPhase: number; todayWellness?: WellnessEntry; observations: PatternObservation[] }) {
  const energy = todayWellness?.energy === "low" ? "If tomorrow feels lower-energy, an easy meal or a little extra rest may be one option to consider." : "Choose one small action that helps tomorrow feel a little more supported.";
  const pattern = observations[0]?.detail || "As you add more check-ins, Redtent can reflect back the patterns you choose to share.";
  return {
    title: "Here is what tomorrow may look like",
    phase: phase === nextPhase ? phase : `${phase} moving toward ${nextPhase}`,
    cycleNote: daysUntilNextPhase === 0 ? `Your estimated ${nextPhase} phase may begin tomorrow.` : `Your estimated ${nextPhase} phase is about ${daysUntilNextPhase} days away.`,
    nutrition: "A simple option: plan one meal that includes foods you enjoy and that feel practical for your day.",
    wellness: energy,
    journalPrompt: "What would make tomorrow feel a little easier?",
    pattern,
    safety: "These are gentle, general suggestions based on what you have logged. They are not medical predictions or advice.",
  };
}
