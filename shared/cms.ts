export type CmsStoryBlock = {
  id: string;
  eyebrow?: string;
  title: string;
  text: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
};

export type CmsEventBlock = {
  id: string;
  /** Texto editorial apresentado no cartão, por exemplo “24 AGO 2026”. */
  date: string;
  /** Valor ISO opcional usado para ordenar e excluir eventos passados com segurança. */
  eventDate?: string;
  title: string;
  description: string;
  location?: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  /** Eventos novos começam como rascunho e só entram na loja quando publicados pelo admin. */
  published?: boolean;
};

const EVENT_MONTHS: Record<string, number> = {
  JAN: 0,
  FEV: 1,
  MAR: 2,
  ABR: 3,
  MAI: 4,
  JUN: 5,
  JUL: 6,
  AGO: 7,
  SET: 8,
  OUT: 9,
  NOV: 10,
  DEZ: 11,
};

/**
 * Converte a data editável do CMS ou a data editorial legada num Date local.
 * O retorno nulo faz com que eventos sem data válida nunca apareçam como próximos.
 */
export function getCmsEventDate(event: Pick<CmsEventBlock, "date" | "eventDate">): Date | null {
  const raw = (event.eventDate || event.date || "").trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-").map(Number);
    const parsed = new Date(year, month - 1, day, 23, 59, 59, 999);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const numeric = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (numeric) {
    const [, dayValue, monthValue, yearValue] = numeric;
    const year = Number(yearValue) < 100 ? 2000 + Number(yearValue) : Number(yearValue);
    const parsed = new Date(year, Number(monthValue) - 1, Number(dayValue), 23, 59, 59, 999);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const editorial = raw.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/^(\d{1,2})\s+([A-Z]{3})\s+(\d{2,4})$/);
  if (editorial) {
    const [, dayValue, monthValue, yearValue] = editorial;
    const month = EVENT_MONTHS[monthValue];
    if (month === undefined) return null;
    const year = Number(yearValue) < 100 ? 2000 + Number(yearValue) : Number(yearValue);
    const parsed = new Date(year, month, Number(dayValue), 23, 59, 59, 999);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

/**
 * Retorna uma cópia ordenada dos eventos que estão publicados e ainda não passaram.
 * A comparação usa o início do dia para manter o evento visível durante a sua data.
 */
export function getUpcomingPublishedEvents(events: CmsEventBlock[], referenceDate = new Date()): CmsEventBlock[] {
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  return events
    .filter((event) => event.published !== false)
    .map((event) => ({ event, parsedDate: getCmsEventDate(event) }))
    .filter((item): item is { event: CmsEventBlock; parsedDate: Date } => Boolean(item.parsedDate && item.parsedDate >= today))
    .sort((left, right) => left.parsedDate.getTime() - right.parsedDate.getTime())
    .map(({ event }) => event);
}

export type StructuredCmsContent = {
  version: 1;
  kind: "manifesto" | "events" | "generic";
  body?: string;
  storyBlocks?: CmsStoryBlock[];
  events?: CmsEventBlock[];
};

export function parseCmsContent(raw: string | null | undefined, kind: StructuredCmsContent["kind"] = "generic"): StructuredCmsContent {
  if (!raw?.trim()) return { version: 1, kind, body: "" };
  try {
    const parsed = JSON.parse(raw) as Partial<StructuredCmsContent>;
    if (parsed && parsed.version === 1 && parsed.kind) {
      return {
        version: 1,
        kind: parsed.kind,
        body: typeof parsed.body === "string" ? parsed.body : "",
        storyBlocks: Array.isArray(parsed.storyBlocks) ? parsed.storyBlocks : [],
        events: Array.isArray(parsed.events) ? parsed.events : [],
      };
    }
  } catch {
    // Conteúdo legado continua sendo exibido como corpo textual.
  }
  return { version: 1, kind, body: raw };
}

export function serializeCmsContent(content: StructuredCmsContent): string {
  return JSON.stringify({
    version: 1,
    kind: content.kind,
    body: content.body ?? "",
    storyBlocks: content.storyBlocks ?? [],
    events: content.events ?? [],
  });
}
