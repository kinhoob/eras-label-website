import { describe, expect, it } from "vitest";
import { getUpcomingPublishedEvents, type CmsEventBlock } from "@shared/cms";

const referenceDate = new Date(2026, 7, 18, 12, 0, 0);

function event(overrides: Partial<CmsEventBlock>): CmsEventBlock {
  return {
    id: "event-default",
    date: "20 AGO 2026",
    title: "Encontro Eras",
    description: "Encontro editorial da marca.",
    published: true,
    ...overrides,
  };
}

describe("eventos públicos do CMS", () => {
  it("mantém apenas eventos publicados e futuros, incluindo o dia atual", () => {
    const result = getUpcomingPublishedEvents([
      event({ id: "past", eventDate: "2026-08-17", title: "Passado" }),
      event({ id: "draft", eventDate: "2026-08-19", published: false, title: "Rascunho" }),
      event({ id: "today", eventDate: "2026-08-18", title: "Hoje" }),
      event({ id: "future", eventDate: "2026-09-02", title: "Futuro" }),
    ], referenceDate);

    expect(result.map((item) => item.id)).toEqual(["today", "future"]);
  });

  it("aceita a data editorial legada quando eventDate ainda não foi preenchida", () => {
    const result = getUpcomingPublishedEvents([
      event({ id: "editorial", date: "25 AGO 2026", eventDate: undefined }),
    ], referenceDate);

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Encontro Eras");
  });

  it("não publica eventos sem uma data que possa ser validada", () => {
    const result = getUpcomingPublishedEvents([
      event({ id: "invalid", date: "Em breve", eventDate: undefined }),
    ], referenceDate);

    expect(result).toEqual([]);
  });
});
