import { defaultCatalog, getCategoryPath, getToolPath } from "../shared/catalog.ts";
import { writeFile } from "node:fs/promises";

const baseUrl = process.env.PREVIEW_BASE_URL || "http://localhost:3003";
const previewHost = new URL(baseUrl).host;
const staticPaths = ["/", "/about", "/guide", "/faq", "/privacy", "/terms", "/disclaimer", "/cookie-policy", "/contact", "/calculator", "/convert", "/units"];
const categoryPaths = defaultCatalog.categories
  .filter((category) => category.parentId === null || defaultCatalog.categories.some((root) => root.id === category.parentId && root.parentId === null))
  .map((category) => getCategoryPath(category, defaultCatalog.categories));
const toolPaths = defaultCatalog.tools.map((tool) => getToolPath(tool, defaultCatalog.categories));
const paths = [...new Set([...staticPaths, ...categoryPaths, ...toolPaths])];

const targets = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const target = targets.find((item) => item.type === "page" && item.url.includes(previewHost));
if (!target?.webSocketDebuggerUrl) throw new Error("로컬 Preview 브라우저 탭을 찾지 못했습니다.");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let sequence = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? reject(new Error(message.error.message)) : resolve(message.result);
  }
});
const cdp = (method, params = {}) => {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const failures = [];
for (const path of paths) {
  await cdp("Page.navigate", { url: `${baseUrl}${path}` });
  await delay(280);
  const evaluation = await cdp("Runtime.evaluate", {
    expression: "JSON.stringify({title:document.title, text:document.body.innerText.slice(0,700), notFound:document.body.innerText.includes('페이지를 찾을 수 없습니다')})",
    returnByValue: true,
  });
  const view = JSON.parse(evaluation.result.value);
  if (!view.title || view.notFound) failures.push({ path, ...view });
}
socket.close();
const report = { checked: paths.length, failures };
await writeFile("PUBLIC_ROUTE_CHECK.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
