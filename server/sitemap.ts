import type { Express, Request } from "express";
import { listSitemapPaths } from "./catalog";

function getOrigin(req: Request) {
  const configured = process.env.CANONICAL_ORIGIN?.replace(/\/$/, "");
  if (configured) return configured;
  return `${req.protocol}://${req.get("host")}`;
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[character] ?? character));
}

export function registerSeoRoutes(app: Express) {
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const origin = getOrigin(req);
      const paths = await listSitemapPaths();
      const body = paths.map((path) => `<url><loc>${escapeXml(`${origin}${path}`)}</loc><changefreq>weekly</changefreq></url>`).join("");
      res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
    } catch (error) {
      console.error("[SEO] sitemap generation failed", error);
      res.status(503).type("text/plain").send("Sitemap temporarily unavailable");
    }
  });
}
