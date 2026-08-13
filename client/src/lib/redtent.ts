export const phaseLabels = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
} as const;

export const phaseDescriptions = {
  menstrual: "A time for gentle replenishment and rest, if that is what your body needs.",
  follicular: "A phase that can bring a gradual lift in energy for some people.",
  ovulation: "A brief phase in which steady meals and hydration can be practical anchors.",
  luteal: "A phase where regular, satisfying meals and self-kindness can feel supportive.",
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

export const displayDate = (value: Date | string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) =>
  new Intl.DateTimeFormat(undefined, options).format(new Date(value));
