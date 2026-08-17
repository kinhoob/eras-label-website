/**
 * Testes unitários para o sitemap e robots.txt da Eras Label
 * Valida a presença de rotas públicas essenciais e o formato XML esperado pelos motores de busca.
 */

import { describe, expect, it } from "vitest";
import express from "express";
import { registerSitemapRoutes } from "./sitemap";
import { createServer } from "http";
import { AddressInfo } from "net";

describe("Eras SEO & Sitemap System", () => {
  it("serves robots.txt and sitemap.xml via http", async () => {
    const app = express();
    registerSitemapRoutes(app);
    const server = createServer(app);
    
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as AddressInfo).port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const robotsRes = await fetch(`${baseUrl}/robots.txt`);
      const robotsText = await robotsRes.text();
      expect(robotsRes.status).toBe(200);
      expect(robotsText).toContain("Sitemap: https://www.eraslabel.com/sitemap.xml");

      const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
      const sitemapText = await sitemapRes.text();
      expect(sitemapRes.status).toBe(200);
      expect(sitemapText).toContain("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
      expect(sitemapText).toContain("<loc>https://www.eraslabel.com</loc>");
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
