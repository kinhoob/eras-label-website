export const ALLOWED_MELHOR_ENVIO_SERVICES = [
  { id: 1, name: "Correios PAC", provider: "Correios" },
  { id: 2, name: "Correios SEDEX", provider: "Correios" },
  { id: 3, name: "Jadlog Econômico", provider: "Jadlog" },
  { id: 4, name: "Jadlog Rápido", provider: "Jadlog" },
  { id: 19, name: "Loggi", provider: "Loggi" },
] as const;

export function isAllowedShippingService(serviceId: number, serviceName?: string) {
  const allowedIds = [1, 2, 3, 4, 19];
  if (allowedIds.includes(serviceId)) return true;
  if (!serviceName) return false;
  const name = serviceName.toLowerCase();
  return (
    (name.includes("pac") && name.includes("correios")) ||
    (name.includes("sedex") && name.includes("correios")) ||
    name.includes("jadlog") ||
    name.includes("loggi")
  );
}
