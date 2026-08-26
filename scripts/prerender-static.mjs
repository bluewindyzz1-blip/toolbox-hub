import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "dist", "public");
const origin = "https://carculate.moneyko.co.kr";
const htmlTemplate = await fs.readFile(path.join(publicDir, "index.html"), "utf8");
const sitemap = await fs.readFile(path.join(root, "client", "public", "sitemap.xml"), "utf8");
const serverEntry = await import(pathToFileURL(path.join(root, "dist", "server-ssr", "entry-server.js")).href);

const escapeHtml = (value) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[character]));
const sitemapPaths = [...sitemap.matchAll(/<loc>https:\/\/carculate\.moneyko\.co\.kr([^<]*)<\/loc>/g)].map((match) => match[1] || "/");
const staticPaths = new Set([...sitemapPaths, "/guide", ...serverEntry.getStaticPrerenderPaths()]);

function buildHead(meta) {
  const canonical = `${origin}${meta.canonicalPath}`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: meta.breadcrumb.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${origin}${item.path}` })),
  };
  const app = { "@context": "https://schema.org", "@type": meta.type, name: meta.title, description: meta.description, url: canonical };
  const jsonLd = JSON.stringify([app, breadcrumb]).replace(/</g, "\\u003c");
  return `<title>${escapeHtml(meta.title)}</title><meta name="description" content="${escapeHtml(meta.description)}"><link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(meta.title)}"><meta property="og:description" content="${escapeHtml(meta.description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta name="twitter:card" content="summary"><script type="application/ld+json">${jsonLd}</script>`;
}

let renderedCount = 0;
for (const rawPath of staticPaths) {
  const route = rawPath.split("?")[0].replace(/\/$/, "") || "/";
  const meta = serverEntry.getStaticPageMeta(route);
  const body = serverEntry.render(route);
  const html = htmlTemplate.replace("<!--app-head-->", buildHead(meta)).replace("<!--app-html-->", body);
  const destination = route === "/" ? path.join(publicDir, "index.html") : path.join(publicDir, route.slice(1), "index.html");
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, html);
  renderedCount += 1;
}

console.log(`Prerendered ${renderedCount} static HTML routes.`);
