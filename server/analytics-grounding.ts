const NUMERIC_TOKEN = /(?<![A-Za-zÀ-ÿ])\d+(?:[.,]\d+)?(?![A-Za-zÀ-ÿ])/g;
const PERCENT_TOKEN = /(?<![A-Za-zÀ-ÿ])\d+(?:[.,]\d+)?\s*%/g;
const EXTERNAL_BENCHMARK = /m[eé]dia\s+(?:de\s+)?mercado|benchmark|padr[aã]o\s+do\s+mercado|mercado\s+(?:flutua|varia|fica)|taxa\s+m[eé]dia/i;

function normalizeNumber(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? Number(parsed.toFixed(4)) : null;
}

function toAllowedSet(values: number[]) {
  return new Set(values.filter((value) => Number.isFinite(value)).map((value) => Number(value.toFixed(4))));
}

/**
 * Confere se um texto gerado por IA usa apenas números presentes no dataset fornecido.
 * Percentuais são validados separadamente para rejeitar benchmarks como "1% a 3%"
 * mesmo quando os números isolados aparecem em cabeçalhos ou métricas diferentes.
 */
export function isGroundedAiSummary(text: string, allowedNumbers: number[], allowedPercentages: number[] = []) {
  if (!text || EXTERNAL_BENCHMARK.test(text)) return false;
  const allowed = toAllowedSet(allowedNumbers);
  const allowedPercents = toAllowedSet(allowedPercentages);
  const percentages = text.match(PERCENT_TOKEN) ?? [];
  for (const token of percentages) {
    const parsed = normalizeNumber(token.replace(/%/g, "").trim());
    if (parsed === null || !allowedPercents.has(parsed)) return false;
  }
  const numericTokens = text.match(NUMERIC_TOKEN) ?? [];
  for (const token of numericTokens) {
    const parsed = normalizeNumber(token);
    if (parsed === null || !allowed.has(parsed)) return false;
  }
  return true;
}
