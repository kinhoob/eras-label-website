import { describe, expect, it } from "vitest";
import {
  getAdminPreferenceStorageKey,
  readAdminPreference,
  writeAdminPreference,
} from "./admin-preferences";

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("admin preferences", () => {
  it("uses a safe default when a preference is not persisted", () => {
    const storage = createStorage();
    expect(readAdminPreference("compact", false, storage)).toBe(false);
    expect(readAdminPreference("autoRefresh", true, storage)).toBe(true);
  });

  it("round-trips boolean preferences using stable storage keys", () => {
    const storage = createStorage();
    writeAdminPreference("reducedMotion", true, storage);
    writeAdminPreference("autoRefresh", false, storage);

    expect(getAdminPreferenceStorageKey("reducedMotion")).toBe("eras-admin-reduced-motion");
    expect(readAdminPreference("reducedMotion", false, storage)).toBe(true);
    expect(readAdminPreference("autoRefresh", true, storage)).toBe(false);
  });
});
