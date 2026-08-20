import { describe, expect, it } from "vitest";
import { resolveThemePreference } from "./ThemeContext";

describe("resolveThemePreference", () => {
  it("preserves a valid dark preference", () => {
    expect(resolveThemePreference("dark")).toBe("dark");
  });

  it("preserves a valid light preference", () => {
    expect(resolveThemePreference("light")).toBe("light");
  });

  it("falls back to light for invalid or missing storage values", () => {
    expect(resolveThemePreference("sepia")).toBe("light");
    expect(resolveThemePreference(null)).toBe("light");
    expect(resolveThemePreference(undefined)).toBe("light");
  });

  it("honors a custom default when storage is invalid", () => {
    expect(resolveThemePreference("", "dark")).toBe("dark");
  });
});
