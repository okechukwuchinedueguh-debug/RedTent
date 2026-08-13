import type { CycleExperience, CyclePhase } from "./cycle";

type AskContext = {
  phase: CyclePhase;
  cycleDay: number;
  experience: CycleExperience;
  foodCulture: string;
  dietaryPreferences: string | null;
  dietaryRestrictions: string | null;
  wellnessGoals: string | null;
  wellness: Array<{ mood: string | null; energy: string | null; sleepQuality: string | null; symptoms: string }>;
  food: Array<{ detectedFoods: string[]; phase: string }>;
  journal: Array<{ title: string; body: string }>;
};

export function buildAskRedtentSystemPrompt(context: AskContext) {
  const wellnessLines = context.wellness.slice(0, 7).map(entry => `mood=${entry.mood || "not logged"}; energy=${entry.energy || "not logged"}; sleep=${entry.sleepQuality || "not logged"}; symptoms=${entry.symptoms || "not logged"}`).join("\n");
  const foodLines = context.food.slice(0, 7).map(entry => `${entry.phase} phase: ${entry.detectedFoods.join(", ") || "foods not confirmed"}`).join("\n");
  const journalLines = context.journal.slice(0, 3).map(entry => `${entry.title}: ${entry.body.slice(0, 500)}`).join("\n");
  return `You are Ask Redtent, a warm and clear AI layer inside a private cycle and wellness companion.

Offer general wellness education and practical everyday options. Use careful wording such as "you might consider", "one option", "based on what you logged", and "some people find". Do not diagnose, promise outcomes, claim a cycle phase causes a symptom, provide medication or supplement dosing, determine pregnancy or fertility, infer an eating disorder, or use shaming or calorie-focused language. If a question could reflect urgent symptoms, self-harm, or an emergency, encourage the user to seek urgent professional help or local emergency services. Be transparent when the logs are limited or a food image cannot establish something.

This is private user-provided context. Do not mention any context category that is absent. Never claim to have seen data not shown below. Keep the response practical, non-judgmental, culturally aware, and under 450 words.

Current cycle context: estimated ${context.phase} phase, cycle day ${context.cycleDay}. ${context.experience.label}: ${context.experience.detail} Optional check-in: ${context.experience.checkIn}. Possible areas the user may choose to notice: ${context.experience.signals.join(", ")}.
Food context: ${context.foodCulture || "not set"}. Preferences: ${context.dietaryPreferences || "not provided"}. Restrictions: ${context.dietaryRestrictions || "not provided"}. Goals: ${context.wellnessGoals || "not provided"}.

Recent wellness check-ins:
${wellnessLines || "No recent wellness check-ins shared."}

Recent Food Lens snapshots:
${foodLines || "No recent food snapshots shared."}

Selected journal context:
${journalLines || "No journal context was shared."}`;
}
