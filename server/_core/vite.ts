import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { pathToFileURL } from "url";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getSeoPage, SeoPage } from "../seo";

function escapeHtml(value: string) { return value.replace(/[&<>'\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character] ?? character)); }
function buildHead(page: SeoPage, origin: string) {
  const canonical = `${origin}${page.canonicalPath}`;
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: page.breadcrumb.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${origin}${item.path}` })) };
  const app = { "@context": "https://schema.org", "@type": page.type, name: page.title, description: page.description, url: canonical };
  const robots = page.noindex ? "<meta name=\"robots\" content=\"noindex,nofollow\">" : "<meta name=\"robots\" content=\"index,follow\">";
  return `<title>${escapeHtml(page.title)}</title><meta name="description" content="${escapeHtml(page.description)}"><link rel="canonical" href="${escapeHtml(canonical)}">${robots}<meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(page.title)}"><meta property="og:description" content="${escapeHtml(page.description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta name="twitter:card" content="summary"><script type="application/ld+json">${JSON.stringify([app, breadcrumb]).replace(/</g, "\\u003c")}</script>`;
}
function getOrigin(req: express.Request) { return process.env.CANONICAL_ORIGIN?.replace(/\/$/, "") ?? `${req.protocol}://${req.get("host")}`; }
async function renderHtml(template: string, url: string, origin: string, render: (url: string) => string) { const page = await getSeoPage(url.split("?")[0]); const html = render(url); return { page, content: template.replace("<!--app-head-->", () => buildHead(page, origin)).replace("<!--app-html-->", () => html) }; }

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/entry-client.tsx"`, `src="/src/entry-client.tsx?v=${nanoid()}"`);
      const serverEntry = await vite.ssrLoadModule("/src/entry-server.tsx");
      const rendered = await renderHtml(template, url, getOrigin(req), serverEntry.render);
      const page = await vite.transformIndexHtml(url, rendered.content);
      res.status(rendered.page.notFound ? 404 : 200).set({ "Content-Type": "text/html", "Cache-Control": "no-cache" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath, { index: false, redirect: false }));

  // fall through to index.html if the file doesn't exist
  app.use("*", async (req, res) => {
    try {
      const template = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
      const serverPath = path.resolve(import.meta.dirname, "server-ssr", "entry-server.js");
      const entry = await import(pathToFileURL(serverPath).href);
      const rendered = await renderHtml(template, req.originalUrl, getOrigin(req), entry.render);
      res.status(rendered.page.notFound ? 404 : 200).set({ "Content-Type": "text/html", "Cache-Control": "no-cache" }).end(rendered.content);
    } catch (error) {
      console.error("[SSR] render failed", error);
      res.status(200).sendFile(path.resolve(distPath, "index.html"));
    }
  });
}
