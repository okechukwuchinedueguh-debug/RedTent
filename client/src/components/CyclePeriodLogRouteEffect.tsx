import { useEffect } from "react";
import { openPeriodLogFromRoute } from "@/lib/periodLogAction";

export function CyclePeriodLogRouteEffect({ location, openSheet, replaceLocation }: { location: string; openSheet: () => void; replaceLocation: (path: string) => void }) {
  useEffect(() => { openPeriodLogFromRoute(`${location}${window.location.search}`, openSheet, replaceLocation); }, [location, openSheet, replaceLocation]);
  return null;
}
