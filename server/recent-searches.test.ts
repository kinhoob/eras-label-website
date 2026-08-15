import { describe, expect, it } from "vitest";
import {
  clearRecentSearches,
  loadRecentSearches,
  removeRecentSearch,
  saveRecentSearch,
} from "../client/src/lib/recent-searches";

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("recent searches", () => {
  it("normalizes, deduplicates and caps saved searches", () => {
    const storage = createStorage();
    saveRecentSearch("  camisetas   oversized ", storage);
    saveRecentSearch("BONÉS", storage);
    saveRecentSearch("camisetas oversized", storage);

    expect(loadRecentSearches(storage)).toEqual(["camisetas oversized", "BONÉS"]);
  });

  it("keeps only the six most recent searches", () => {
    const storage = createStorage();
    for (let index = 1; index <= 7; index += 1) saveRecentSearch(`busca ${index}`, storage);

    expect(loadRecentSearches(storage)).toHaveLength(6);
    expect(loadRecentSearches(storage)[0]).toBe("busca 7");
    expect(loadRecentSearches(storage)).not.toContain("busca 1");
  });

  it("removes one search and clears the complete history", () => {
    const storage = createStorage();
    saveRecentSearch("paradox", storage);
    saveRecentSearch("manguebeat", storage);

    expect(removeRecentSearch("PARADOX", storage)).toEqual(["manguebeat"]);
    clearRecentSearches(storage);
    expect(loadRecentSearches(storage)).toEqual([]);
  });

  it("fails safely for malformed stored values", () => {
    const storage = createStorage({ "eras-label-recent-searches": "not-json" });
    expect(loadRecentSearches(storage)).toEqual([]);
  });
});
