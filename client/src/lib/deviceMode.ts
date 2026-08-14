export type RedtentDeviceMode = "owner" | "partner" | "unset";

function keyFor(userId: number) { return `redtent-device-mode-${userId}`; }

export function readRedtentDeviceMode(userId: number): RedtentDeviceMode {
  try { const value = window.localStorage.getItem(keyFor(userId)); return value === "owner" || value === "partner" ? value : "unset"; } catch { return "owner"; }
}

export function saveRedtentDeviceMode(userId: number, mode: Exclude<RedtentDeviceMode, "unset">) {
  try { window.localStorage.setItem(keyFor(userId), mode); } catch { /* A restricted browser can continue in owner mode. */ }
}
