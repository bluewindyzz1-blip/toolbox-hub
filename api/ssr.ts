import type { Request, Response } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { createApp } from "../server/_core/app";
import { listSitemapPaths } from "../server/catalog";
import { getSeoPage, type SeoPage } from "../server/seo";

function escapeHtml(value: string) {
  return value.replace(/[&<'"]/g, (character) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character] ?? character
  ));
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => (
    { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[character] ?? character
  ));
}

function getOrigin(req: Request) {
  const configured = process.env.CANONICAL_ORIGIN?.replace(/\/$/, "");
  if (configured) return configured;
  const protocol = req.get("x-forwarded-proto")?.split(",")[0]?.trim() || req.protocol;
  const host = req.get("x-forwarded-host") || req.get("host");
  return `${protocol}://${host}`;
}

function buildHead(page: SeoPage, origin: string) {
  const canonical = `${origin}${page.canonicalPath}`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: page.breadcrumb.map((item, index) => ({
      "@type": "ListItem", position: index + 1, name: item.name, item: `${origin}${item.path}`,
    })),
  };
  const application = {
    "@context": "https://schema.org", "@type": page.type, name: page.title,
    description: page.description, url: canonical,
  };
  const robots = page.noindex || process.env.VERCEL_ENV === "preview" ? "noindex,nofollow" : "index,follow";
  return `<title>${escapeHtml(page.title)}</title><meta name="description" content="${escapeHtml(page.description)}"><link rel="canonical" href="${escapeHtml(canonical)}"><meta name="robots" content="${robots}"><meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(page.title)}"><meta property="og:description" content="${escapeHtml(page.description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta name="twitter:card" content="summary"><script type="application/ld+json">${JSON.stringify([application, breadcrumb]).replace(/</g, "\\u003c")}</script>`;
}

function getRequestedPath(req: Request) {
  const route = req.query.route;
  if (typeof route === "string" && route.startsWith("/")) return route;
  if (Array.isArray(route) && route[0]?.startsWith("/")) return route[0];
  return "/";
}

async function renderSitemap(origin: string) {
  const paths = await listSitemapPaths();
  const urls = paths.map((item) => `<url><loc>${escapeXml(`${origin}${item}`)}</loc><changefreq>weekly</changefreq></url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

async function renderPage(req: Request, res: Response, requestedPath: string) {
  const root = process.cwd();
  const template = await fs.readFile(path.join(root, "dist", "public", "index.html"), "utf-8");
  const entry = await import(pathToFileURL(path.join(root, "dist", "server-ssr", "entry-server.js")).href);
  const page = await getSeoPage(requestedPath);
  const html = template
    .replace("<!--app-head-->", () => buildHead(page, getOrigin(req)))
    .replace("<!--app-html-->", () => entry.render(requestedPath) as string);
  res.status(page.notFound ? 404 : 200).set({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" }).send(html);
}

const app = createApp();

app.use(async (req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  try {
    const requestedPath = getRequestedPath(req);
    const origin = getOrigin(req);
    if (requestedPath === "/sitemap.xml") return res.type("application/xml").send(await renderSitemap(origin));
    if (requestedPath === "/robots.txt") return res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /404\nSitemap: ${origin}/sitemap.xml\n`);
    await renderPage(req, res, requestedPath);
  } catch (error) {
    console.error("[SSR] Vercel rendering failed", error);
    next(error);
  }
});

export default app;
