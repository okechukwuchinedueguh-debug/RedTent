export const phaseLabels = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
} as const;

export const phaseDescriptions = {
  menstrual: "Your reset window. Notice what helps you feel restored, supported, and ready for what comes next.",
  follicular: "Your momentum may be building. Use this phase to spot the routines, meals, and moments that help you feel more like yourself.",
  ovulation: "Your body is moving through a short, active phase. Keep your day grounded with the choices that make you feel steady.",
  luteal: "Your cue to make room for comfort and consistency. Small supportive habits can carry you through a busy week.",
} as const;

export const phaseColors = {
  menstrual: "bg-[#C66E78] text-white",
  follicular: "bg-[#E9B56C] text-[#51332A]",
  ovulation: "bg-[#7E9C7B] text-white",
  luteal: "bg-[#90708E] text-white",
} as const;

export const symptoms = ["Cramps", "Bloating", "Headache", "Breast tenderness", "Acne", "Fatigue", "Back pain", "Cravings"];

export const localDateInput = (date = new Date()) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 10);
};

export const parseInputDate = (value: string) => new Date(`${value}T12:00:00.000Z`);

export const displayDate = (value: Date | string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) => new Intl.DateTimeFormat(undefined, options).format(new Date(value));

export const copy = {
  tagline: "Your body. Your cycle. Your story.",
  appDescription: "Redtent is an AI-powered women’s wellness companion for understanding your cycle, food, symptoms, mood, habits, and personal patterns with more clarity.",
  safety: "Redtent shares general wellness information, not medical advice. Cycle forecasts, food observations, and personal patterns are estimates based on what you choose to log. For symptoms that feel severe, persistent, unusual, or worrying, speak with a qualified healthcare professional.",
  privateSpace: "Your cycle, reflections, check-ins, and Food Lens snapshots stay inside your private Redtent space.",
  foodLens: "Snap it. Ask it. Understand it.",
} as const;
