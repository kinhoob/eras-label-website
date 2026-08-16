export type AdminPreferenceKey = "compact" | "reducedMotion" | "autoRefresh";

const STORAGE_KEYS: Record<AdminPreferenceKey, string> = {
  compact: "eras-admin-compact",
  reducedMotion: "eras-admin-reduced-motion",
  autoRefresh: "eras-admin-auto-refresh",
};

export function getAdminPreferenceStorageKey(key: AdminPreferenceKey): string {
  return STORAGE_KEYS[key];
}

export function readAdminPreference(key: AdminPreferenceKey, fallback: boolean, storage?: Pick<Storage, "getItem">): boolean {
  const source = storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);
  if (!source) return fallback;
  const value = source.getItem(STORAGE_KEYS[key]);
  return value === null ? fallback : value === "true";
}

export function writeAdminPreference(key: AdminPreferenceKey, value: boolean, storage?: Pick<Storage, "setItem">): void {
  const target = storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);
  target?.setItem(STORAGE_KEYS[key], String(value));
}
