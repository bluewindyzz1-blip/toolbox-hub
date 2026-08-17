import { writeFile } from "node:fs/promises";

const mobile = { width: 390, height: 844, deviceScaleFactor: 1, mobile: true };
const baseUrl = process.env.PREVIEW_BASE_URL || "http://localhost:3003";
const previewHost = new URL(baseUrl).host;
const pages = [
  { slug: "home", url: `${baseUrl}/` },
  { slug: "pdf-merge", url: `${baseUrl}/convert/pdf-edit/pdf-merge` },
  { slug: "csv-excel", url: `${baseUrl}/convert/document/csv-to-excel` },
  { slug: "unit-energy", url: `${baseUrl}/units/energy/unit-energy` },
];

const targets = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const target = targets.find((item) => item.type === "page" && item.url.includes(previewHost));
if (!target?.webSocketDebuggerUrl) throw new Error("로컬 도구 페이지의 디버그 연결을 찾지 못했습니다.");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let sequence = 0;
const pending = new Map();
socket.addEventListener("message", (event) => { const message = JSON.parse(event.data); if (message.id && pending.has(message.id)) { const { resolve, reject } = pending.get(message.id); pending.delete(message.id); message.error ? reject(new Error(message.error.message)) : resolve(message.result); } });
function cdp(method, params = {}) { const id = ++sequence; socket.send(JSON.stringify({ id, method, params })); return new Promise((resolve, reject) => pending.set(id, { resolve, reject })); }
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

await cdp("Emulation.setDeviceMetricsOverride", mobile);
const report = [];
for (const page of pages) {
  await cdp("Page.navigate", { url: page.url }); await delay(900);
  const evaluation = await cdp("Runtime.evaluate", { expression: "JSON.stringify({ title: document.title, viewport: window.innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, overflow: document.documentElement.scrollWidth > window.innerWidth })", returnByValue: true });
  const metrics = JSON.parse(evaluation.result.value);
  const image = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }); await writeFile(`/home/ubuntu/workspace/toolbox-hub/mobile-${page.slug}.png`, Buffer.from(image.data, "base64"));
  report.push({ page: page.url, ...metrics, screenshot: `mobile-${page.slug}.png` });
}
await cdp("Emulation.clearDeviceMetricsOverride"); socket.close(); console.log(JSON.stringify(report, null, 2));
