export const PERIOD_LOG_ACTION_PATH = "/cycle?log=period";

export function getPeriodLogRequest(location: string) {
  const [pathname, search = ""] = location.split("?");
  const parameters = new URLSearchParams(search);
  if (pathname !== "/cycle" || parameters.get("log") !== "period") return { shouldOpen: false, cleanPath: null as string | null };
  return { shouldOpen: true, cleanPath: "/cycle" };
}

export function startPeriodLogAction(navigate: (path: string) => void) {
  navigate(PERIOD_LOG_ACTION_PATH);
}

export function openPeriodLogFromRoute(location: string, openSheet: () => void, replaceLocation: (path: string) => void) {
  const request = getPeriodLogRequest(location);
  if (!request.shouldOpen || !request.cleanPath) return false;
  openSheet();
  replaceLocation(request.cleanPath);
  return true;
}
