import fs from "node:fs";

const lines = fs.readFileSync(".manus-logs/networkRequests.log", "utf8").split("\n").filter((line) => line.includes("admin.getAnalytics"));
const line = lines.at(-1);
if (!line) { console.log("NO_ANALYTICS_REQUEST"); process.exit(0); }
const record = JSON.parse(line.slice(line.indexOf("{")));
const response = record.response ?? {};
let body = response.body;
for (let attempt = 0; attempt < 3 && typeof body === "string"; attempt += 1) {
  try { body = JSON.parse(body); } catch { break; }
}
const procedurePath = decodeURIComponent(record.url.split("/api/trpc/")[1]?.split("?")[0] ?? "");
const procedures = procedurePath.split(",");
const entries = Array.isArray(body) ? body : [];
const summary = entries.map((entry, index) => {
  const payload = entry?.result ?? entry;
  const data = payload?.data?.json;
  const error = payload?.error;
  return {
    index,
    procedure: procedures[index] ?? "unknown",
    hasData: data !== undefined,
    error: error ? { code: error.data?.code, message: error.message, shape: Object.keys(error) } : null,
    dataKeys: data && typeof data === "object" ? Object.keys(data) : [],
    analytics: procedures[index] === "admin.getAnalytics" ? {
      period: data?.period ?? null,
      summary: data?.summary ?? null,
      trendLength: Array.isArray(data?.salesTrend) ? data.salesTrend.length : null,
    } : undefined,
  };
});
console.log(JSON.stringify({ timestamp: record.timestamp, status: response.status, duration: record.duration, requestError: record.error, procedures, summary }, null, 2));
