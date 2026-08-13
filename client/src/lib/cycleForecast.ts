export type PeriodForecastStatus = {
  kind: "setup" | "today" | "upcoming" | "late" | "later";
  title: string;
  detail: string;
  expectedAt: Date | null;
  daysFromExpected: number | null;
};

function localDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function calendarDaysBetween(from: Date, to: Date) {
  return Math.round((localDay(to).getTime() - localDay(from).getTime()) / 86_400_000);
}

export function getPeriodForecastStatus(nextPeriodAt: Date | null, now = new Date()): PeriodForecastStatus {
  if (!nextPeriodAt) {
    return { kind: "setup", title: "Add your first period date", detail: "One date is enough to begin a personal cycle forecast.", expectedAt: null, daysFromExpected: null };
  }
  const daysFromExpected = calendarDaysBetween(now, nextPeriodAt);
  if (daysFromExpected < 0) {
    const daysLate = Math.abs(daysFromExpected);
    return { kind: "late", title: `Expected ${daysLate === 1 ? "yesterday" : `${daysLate} days ago`}`, detail: "Cycle timing can shift. Add a period date when you have one. If anything feels concerning, consider speaking with a qualified healthcare professional.", expectedAt: nextPeriodAt, daysFromExpected };
  }
  if (daysFromExpected === 0) {
    return { kind: "today", title: "Expected today", detail: "This is a personal estimate, not a promise. Add a period date whenever it begins.", expectedAt: nextPeriodAt, daysFromExpected };
  }
  if (daysFromExpected <= 7) {
    return { kind: "upcoming", title: `Period in ${daysFromExpected} ${daysFromExpected === 1 ? "day" : "days"}`, detail: "Your calendar marks this as an estimated window based on the dates you have logged.", expectedAt: nextPeriodAt, daysFromExpected };
  }
  return { kind: "later", title: `Expected in ${daysFromExpected} days`, detail: "This is a personal estimate that becomes clearer with more logged cycle dates.", expectedAt: nextPeriodAt, daysFromExpected };
}
