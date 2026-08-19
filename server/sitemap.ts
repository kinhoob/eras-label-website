/**
 * Gerador Dinâmico de Sitemap XML e Robots.txt para a Eras Label
 * Este módulo mapeia todas as rotas públicas principais e os produtos ativos do banco de dados
 * para gerar um sitemap XML otimizado para o Googlebot e motores de busca.
 */

import { Express, Request, Response } from "express";
import { getDb } from "./db";
import { products, categories } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export function registerSitemapRoutes(app: Express) {
  // Rota para o ficheiro robots.txt orientando o rastreio dos robôs de busca
  app.get("/robots.txt", (req: Request, res: Response) => {
    const robotsContent = `# Robots.txt oficial da Eras Label
User-agent: *
Allow: /
Disallow: /admin
Disallow: /account
Disallow: /checkout
Disallow: /api/

Sitemap: https://www.eraslabel.com/sitemap.xml
`;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(robotsContent);
  });

  // Rota dinâmica para o sitemap.xml incluindo páginas estáticas e produtos ativos
  app.get("/sitemap.xml", async (req: Request, res: Response) => {
    try {
      const domain = "https://www.eraslabel.com";
      const now = new Date().toISOString().split("T")[0];

      // Páginas institucionais e públicas estáticas da Eras Label
      const staticPages = [
        { url: "", changefreq: "daily", priority: "1.0" },
        { url: "/manifesto", changefreq: "monthly", priority: "0.8" },
        { url: "/archive", changefreq: "weekly", priority: "0.8" },
        { url: "/events", changefreq: "weekly", priority: "0.8" },
        { url: "/faq", changefreq: "weekly", priority: "0.7" },
        { url: "/contact", changefreq: "monthly", priority: "0.6" },
        { url: "/tracking", changefreq: "daily", priority: "0.6" },
        { url: "/privacy", changefreq: "yearly", priority: "0.3" },
        { url: "/returns", changefreq: "yearly", priority: "0.3" },
        { url: "/shipping", changefreq: "monthly", priority: "0.5" },
        { url: "/about", changefreq: "monthly", priority: "0.5" },
      ];

      // Buscar produtos ativos do banco de dados para indexação de e-commerce
      const database = await getDb();
      // O preview pode ser validado sem banco conectado. Nesse caso, ainda
      // entregamos as páginas estáticas e deixamos produtos/categorias vazios.
      const activeProducts = database
        ? await database.select().from(products).where(eq(products.status, "published"))
        : [];
      const activeCategories = database ? await database.select().from(categories) : [];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Adicionar páginas estáticas
      for (const page of staticPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${domain}${page.url}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
      }

      // Adicionar páginas de categorias
      for (const cat of activeCategories) {
        xml += `  <url>\n`;
        xml += `    <loc>${domain}/category/${encodeURIComponent(cat.slug || cat.name.toLowerCase())}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }

      // Adicionar páginas individuais de produtos publicados
      for (const prod of activeProducts) {
        xml += `  <url>\n`;
        xml += `    <loc>${domain}/product/${prod.id}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
      }

      xml += `</urlset>`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.send(xml);
    } catch (error) {
      console.error("[Sitemap Error]", error);
      res.status(500).send("Erro ao gerar sitemap XML.");
    }
  });
}
