import { readFileSync, writeFileSync } from "node:fs";

const adminPath = "client/src/pages/Admin.tsx";
const panelPath = "scripts/new-storefront-settings-panel.tsx";
const source = readFileSync(adminPath, "utf8");
const replacement = readFileSync(panelPath, "utf8").trimEnd();
const start = source.indexOf("function StorefrontSettingsPanel({");
const end = source.indexOf("function AdminLoginScreen() {", start);

if (start < 0 || end < 0 || end <= start) {
  throw new Error("Limites do StorefrontSettingsPanel não encontrados.");
}

const next = `${source.slice(0, start)}${replacement}\n\n${source.slice(end)}`;
writeFileSync(adminPath, next);
