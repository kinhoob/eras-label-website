export const RECENT_SEARCHES_STORAGE_KEY = "eras-label-recent-searches";
export const MAX_RECENT_SEARCHES = 6;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getStorage(storage?: StorageLike): StorageLike | undefined {
  if (storage) return storage;
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function normalizeSearch(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 80);
}

export function loadRecentSearches(storage?: StorageLike): string[] {
  const target = getStorage(storage);
  if (!target) return [];

  try {
    const raw = target.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((value): value is string => typeof value === "string")
      .map(normalizeSearch)
      .filter(Boolean)
      .filter((value, index, values) => values.indexOf(value) === index)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string, storage?: StorageLike): string[] {
  const normalized = normalizeSearch(query);
  const next = normalized
    ? [normalized, ...loadRecentSearches(storage).filter((value) => value.toLocaleLowerCase() !== normalized.toLocaleLowerCase())].slice(0, MAX_RECENT_SEARCHES)
    : loadRecentSearches(storage);
  const target = getStorage(storage);
  if (target) {
    try {
      target.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // A busca continua funcional mesmo quando o armazenamento está indisponível.
    }
  }
  return next;
}

export function removeRecentSearch(query: string, storage?: StorageLike): string[] {
  const normalized = normalizeSearch(query).toLocaleLowerCase();
  const next = loadRecentSearches(storage).filter((value) => value.toLocaleLowerCase() !== normalized);
  const target = getStorage(storage);
  if (target) {
    try {
      target.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // A limpeza é apenas uma melhoria; não impede a pesquisa.
    }
  }
  return next;
}

export function clearRecentSearches(storage?: StorageLike) {
  const target = getStorage(storage);
  if (!target) return;
  try {
    target.removeItem(RECENT_SEARCHES_STORAGE_KEY);
  } catch {
    // A limpeza é apenas uma melhoria; não impede a pesquisa.
  }
}
