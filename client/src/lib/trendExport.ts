export type TrendExportDashboard = {
  sample: { cyclesTracked: number; checkIns: number; reflections: number };
  timing: { averageLength: number | null; shortestLength: number | null; longestLength: number | null; variation: number | null; intervalsTracked: number };
  coverage: { cyclesWithCheckIns: number; cyclesWithReflections: number };
  moodCounts: Array<{ label: string; count: number }>;
  energyCounts: Array<{ label: string; count: number }>;
  topSignals: Array<{ label: string; count: number }>;
  recentCycles: Array<{ startAt: Date; length: number | null; checkIns: number; reflectionCount: number }>;
  recentReflections: Array<{ moment: string; whatHelped: string; entryAt: Date }>;
  note: string;
};

const csvCell = (value: string | number | null | undefined) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const row = (values: Array<string | number | null | undefined>) => values.map(csvCell).join(",");

export function buildTrendExportCsv(dashboard: TrendExportDashboard, generatedAt = new Date()) {
  const lines = [
    row(["Redtent personal trends export"]),
    row(["Generated", generatedAt.toISOString()]),
    row(["Privacy", "This export contains only your own logged trend summary."]),
    "",
    row(["Summary", "Value"]),
    row(["Cycle starts", dashboard.sample.cyclesTracked]),
    row(["Wellness check-ins", dashboard.sample.checkIns]),
    row(["What-helped reflections", dashboard.sample.reflections]),
    row(["Average logged timing (days)", dashboard.timing.averageLength]),
    row(["Shortest logged timing (days)", dashboard.timing.shortestLength]),
    row(["Longest logged timing (days)", dashboard.timing.longestLength]),
    row(["Logged timing range (days)", dashboard.timing.variation]),
    row(["Cycles with check-ins", dashboard.coverage.cyclesWithCheckIns]),
    row(["Cycles with reflections", dashboard.coverage.cyclesWithReflections]),
    "",
    row(["Recent cycle start", "Days to next logged start", "Check-ins", "Reflections"]),
    ...dashboard.recentCycles.map(cycle => row([cycle.startAt.toISOString().slice(0, 10), cycle.length, cycle.checkIns, cycle.reflectionCount])),
    "",
    row(["Mood", "Count"]),
    ...dashboard.moodCounts.map(entry => row([entry.label, entry.count])),
    "",
    row(["Energy", "Count"]),
    ...dashboard.energyCounts.map(entry => row([entry.label, entry.count])),
    "",
    row(["Logged signal", "Count"]),
    ...dashboard.topSignals.map(entry => row([entry.label, entry.count])),
    "",
    row(["Cycle moment", "What helped", "Logged on"]),
    ...dashboard.recentReflections.map(entry => row([entry.moment, entry.whatHelped, entry.entryAt.toISOString().slice(0, 10)])),
    "",
    row(["Note", dashboard.note]),
  ];
  return lines.join("\n");
}

export function downloadTrendExport(dashboard: TrendExportDashboard) {
  const blob = new Blob([buildTrendExportCsv(dashboard)], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = `redtent-personal-trends-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(href);
}
