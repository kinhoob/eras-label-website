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
  date: string;
  title: string;
  description: string;
  location?: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

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
