import { useEffect, useMemo, useState } from "react";
import { Check, Clipboard, Copy, Download, FileCode2, RefreshCcw } from "lucide-react";
import { CatalogBreadcrumb, SeoHead, ToolMetaResolver } from "@/components/CatalogSupport";
import { ToolFrame } from "@/components/ToolLayout";
import { downloadBlob } from "@/lib/file-utils";

export type TextMode = "json-pretty" | "json-minify" | "csv-to-tsv" | "tsv-to-csv" | "csv-to-markdown" | "json-to-markdown" | "markdown-to-html" | "html-to-text" | "url-encode" | "url-decode" | "base64-encode" | "base64-decode" | "timestamp-to-date" | "date-to-timestamp" | "hex-to-rgb" | "rgb-to-hex" | "html-encode" | "html-decode" | "normalize-lines" | "unique-lines";
type ModeSpec = { title: string; tab: string; description: string; placeholder: string; sample: string; outputLabel: string; downloadName: string; downloadType: string };

type CsvRow = string[];

const specs: Record<TextMode, ModeSpec> = {
  "json-pretty": { title: "JSON 정리", tab: "JSON 정리", description: "JSON 텍스트를 들여쓰기와 줄바꿈이 있는 읽기 쉬운 형식으로 정리합니다.", placeholder: '{"name":"도구상자","tools":20}', sample: '{"name":"도구상자","tools":20}', outputLabel: "정리된 JSON", downloadName: "formatted.json", downloadType: "application/json;charset=utf-8" },
  "json-minify": { title: "JSON 압축", tab: "JSON 압축", description: "공백과 줄바꿈을 제거한 한 줄 JSON을 만듭니다.", placeholder: '{\n  "name": "도구상자"\n}', sample: '{\n  "name": "도구상자",\n  "tools": 20\n}', outputLabel: "압축된 JSON", downloadName: "minified.json", downloadType: "application/json;charset=utf-8" },
  "csv-to-tsv": { title: "CSV → TSV 변환", tab: "CSV → TSV", description: "쉼표로 구분된 CSV 표를 탭으로 구분된 TSV 텍스트로 바꿉니다.", placeholder: "이름,점수\n민수,90", sample: "이름,점수\n민수,90\n지은,95", outputLabel: "TSV 결과", downloadName: "converted.tsv", downloadType: "text/tab-separated-values;charset=utf-8" },
  "tsv-to-csv": { title: "TSV → CSV 변환", tab: "TSV → CSV", description: "탭으로 구분된 TSV 표를 CSV 텍스트로 바꿉니다.", placeholder: "이름\t점수\n민수\t90", sample: "이름\t점수\n민수\t90\n지은\t95", outputLabel: "CSV 결과", downloadName: "converted.csv", downloadType: "text/csv;charset=utf-8" },
  "csv-to-markdown": { title: "CSV → Markdown 표", tab: "CSV → Markdown", description: "CSV 표를 문서와 노션 등에 붙여 넣기 쉬운 Markdown 표로 바꿉니다.", placeholder: "이름,점수\n민수,90", sample: "이름,점수\n민수,90\n지은,95", outputLabel: "Markdown 표", downloadName: "table.md", downloadType: "text/markdown;charset=utf-8" },
  "json-to-markdown": { title: "JSON → Markdown 표", tab: "JSON → Markdown", description: "객체 배열 JSON을 Markdown 표로 변환합니다.", placeholder: '[{"이름":"민수","점수":90}]', sample: '[{"이름":"민수","점수":90},{"이름":"지은","점수":95}]', outputLabel: "Markdown 표", downloadName: "table.md", downloadType: "text/markdown;charset=utf-8" },
  "markdown-to-html": { title: "Markdown → HTML", tab: "Markdown → HTML", description: "제목, 목록, 굵게, 기울임, 링크 등 기본 Markdown 문법을 HTML로 변환합니다.", placeholder: "# 제목\n\n**강조** 텍스트", sample: "# 도구상자\n\n- 빠른 변환\n- 기기 안 처리\n\n**중요한** 안내", outputLabel: "HTML 결과", downloadName: "converted.html", downloadType: "text/html;charset=utf-8" },
  "html-to-text": { title: "HTML → 텍스트", tab: "HTML → 텍스트", description: "HTML 태그를 제거하고 사람이 읽을 수 있는 일반 텍스트를 추출합니다.", placeholder: "<h1>제목</h1><p>본문</p>", sample: "<h1>도구상자</h1><p>브라우저 안에서 처리합니다.</p>", outputLabel: "텍스트 결과", downloadName: "extracted.txt", downloadType: "text/plain;charset=utf-8" },
  "url-encode": { title: "URL 인코딩", tab: "URL 인코딩", description: "한글과 특수문자를 URL 파라미터에 사용할 수 있는 퍼센트 인코딩 문자열로 바꿉니다.", placeholder: "검색어=도구상자", sample: "검색어=도구상자 & 정렬=최신", outputLabel: "인코딩 결과", downloadName: "url-encoded.txt", downloadType: "text/plain;charset=utf-8" },
  "url-decode": { title: "URL 디코딩", tab: "URL 디코딩", description: "퍼센트 인코딩된 URL 문자열을 일반 텍스트로 복원합니다.", placeholder: "%EB%8F%84%EA%B5%AC%EC%83%81%EC%9E%90", sample: "%EB%8F%84%EA%B5%AC%EC%83%81%EC%9E%90%20%EB%B3%80%ED%99%98", outputLabel: "디코딩 결과", downloadName: "url-decoded.txt", downloadType: "text/plain;charset=utf-8" },
  "base64-encode": { title: "Base64 인코딩", tab: "Base64 인코딩", description: "UTF-8 텍스트를 Base64 문자열로 인코딩합니다.", placeholder: "도구상자", sample: "도구상자", outputLabel: "Base64 결과", downloadName: "base64.txt", downloadType: "text/plain;charset=utf-8" },
  "base64-decode": { title: "Base64 디코딩", tab: "Base64 디코딩", description: "Base64 문자열을 UTF-8 일반 텍스트로 복원합니다.", placeholder: "64+E6rWs7IOB7J6Q", sample: "64+E6rWs7IOB7J6Q", outputLabel: "디코딩 결과", downloadName: "base64-decoded.txt", downloadType: "text/plain;charset=utf-8" },
  "timestamp-to-date": { title: "Unix 시간 → 날짜", tab: "Unix → 날짜", description: "Unix 타임스탬프(초 또는 밀리초)를 현재 기기 시간대의 날짜와 시각으로 바꿉니다.", placeholder: "1767225600", sample: "1767225600", outputLabel: "날짜 결과", downloadName: "timestamp-date.txt", downloadType: "text/plain;charset=utf-8" },
  "date-to-timestamp": { title: "날짜 → Unix 시간", tab: "날짜 → Unix", description: "날짜와 시각을 Unix 타임스탬프 초·밀리초 값으로 바꿉니다.", placeholder: "2026-01-01T00:00:00", sample: "2026-01-01T00:00:00", outputLabel: "Unix 시간 결과", downloadName: "timestamp.txt", downloadType: "text/plain;charset=utf-8" },
  "hex-to-rgb": { title: "HEX → RGB 색상 변환", tab: "HEX → RGB", description: "#RRGGBB 또는 #RGB 형식의 HEX 색상을 RGB 값으로 변환합니다.", placeholder: "#ef2920", sample: "#ef2920", outputLabel: "RGB 결과", downloadName: "rgb-color.txt", downloadType: "text/plain;charset=utf-8" },
  "rgb-to-hex": { title: "RGB → HEX 색상 변환", tab: "RGB → HEX", description: "RGB 색상값을 웹 색상 코드인 HEX 값으로 변환합니다.", placeholder: "239, 41, 32", sample: "239, 41, 32", outputLabel: "HEX 결과", downloadName: "hex-color.txt", downloadType: "text/plain;charset=utf-8" },
  "html-encode": { title: "HTML 문자 인코딩", tab: "HTML 인코딩", description: "특수문자를 HTML에 안전하게 넣을 수 있는 엔티티 형태로 바꿉니다.", placeholder: "<도구상자> & \"변환\"", sample: "<도구상자> & \"변환\"", outputLabel: "HTML 엔티티", downloadName: "html-encoded.txt", downloadType: "text/plain;charset=utf-8" },
  "html-decode": { title: "HTML 문자 디코딩", tab: "HTML 디코딩", description: "HTML 엔티티를 사람이 읽는 일반 특수문자로 복원합니다.", placeholder: "&lt;도구상자&gt; &amp; &quot;변환&quot;", sample: "&lt;도구상자&gt; &amp; &quot;변환&quot;", outputLabel: "디코딩 결과", downloadName: "html-decoded.txt", downloadType: "text/plain;charset=utf-8" },
  "normalize-lines": { title: "줄바꿈 정리", tab: "줄바꿈 정리", description: "Windows·Mac·웹에서 섞인 줄바꿈을 표준 줄바꿈으로 통일합니다.", placeholder: "첫 줄\r\n둘째 줄\r셋째 줄", sample: "첫 줄\r\n둘째 줄\r셋째 줄", outputLabel: "정리된 텍스트", downloadName: "normalized-lines.txt", downloadType: "text/plain;charset=utf-8" },
  "unique-lines": { title: "중복 줄 제거", tab: "중복 줄 제거", description: "첫 번째 순서를 유지하면서 중복된 비어 있지 않은 줄을 제거합니다.", placeholder: "사과\n바나나\n사과", sample: "사과\n바나나\n사과\n바나나\n포도", outputLabel: "중복 제거 결과", downloadName: "unique-lines.txt", downloadType: "text/plain;charset=utf-8" },
};

function parseDelimited(text: string, delimiter: string): CsvRow[] {
  const rows: CsvRow[] = []; let row: string[] = []; let value = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]; const next = text[index + 1];
    if (character === '"' && quoted && next === '"') { value += '"'; index += 1; continue; }
    if (character === '"') { quoted = !quoted; continue; }
    if (character === delimiter && !quoted) { row.push(value); value = ""; continue; }
    if ((character === "\n" || character === "\r") && !quoted) { if (character === "\r" && next === "\n") index += 1; row.push(value); if (row.some((item) => item !== "")) rows.push(row); row = []; value = ""; continue; }
    value += character;
  }
  if (quoted) throw new Error("닫히지 않은 큰따옴표가 있습니다.");
  row.push(value); if (row.some((item) => item !== "")) rows.push(row); return rows;
}

function toDelimited(rows: CsvRow[], delimiter: string) {
  const encode = (value: string) => /["\n\r\t,]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  return rows.map((row) => row.map(encode).join(delimiter)).join("\n");
}

function tableCell(value: unknown) { return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>"); }
function markdownTable(headers: string[], rows: CsvRow[]) { if (!headers.length) throw new Error("표의 헤더를 찾을 수 없습니다."); return [`| ${headers.map(tableCell).join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map((row) => `| ${headers.map((_, index) => tableCell(row[index] ?? "")).join(" | ")} |`)].join("\n"); }
function escapeHtml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function inlineMarkdown(value: string) { return escapeHtml(value).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>'); }
function basicMarkdownToHtml(source: string) {
  const lines = source.replace(/\r\n|\r/g, "\n").split("\n"); const output: string[] = []; let inList = false;
  const closeList = () => { if (inList) { output.push("</ul>"); inList = false; } };
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line); const list = /^[-*]\s+(.+)$/.exec(line);
    if (heading) { closeList(); const level = heading[1].length; output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`); continue; }
    if (list) { if (!inList) { output.push("<ul>"); inList = true; } output.push(`<li>${inlineMarkdown(list[1])}</li>`); continue; }
    closeList(); if (line.trim()) output.push(`<p>${inlineMarkdown(line)}</p>`);
  }
  closeList(); return output.join("\n");
}
function encodeBase64(source: string) { const bytes = new TextEncoder().encode(source); let binary = ""; bytes.forEach((byte) => { binary += String.fromCharCode(byte); }); return btoa(binary); }
function decodeBase64(source: string) { const binary = atob(source.trim()); const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0)); return new TextDecoder().decode(bytes); }
function htmlEncode(source: string) { const node = document.createElement("textarea"); node.textContent = source; return node.innerHTML; }
function htmlDecode(source: string) { const node = document.createElement("textarea"); node.innerHTML = source; return node.value; }

export function transform(mode: TextMode, source: string) {
  if (!source.trim()) throw new Error("변환할 내용을 입력하세요.");
  if (mode === "json-pretty") return JSON.stringify(JSON.parse(source), null, 2);
  if (mode === "json-minify") return JSON.stringify(JSON.parse(source));
  if (mode === "csv-to-tsv") return toDelimited(parseDelimited(source, ","), "\t");
  if (mode === "tsv-to-csv") return toDelimited(parseDelimited(source, "\t"), ",");
  if (mode === "csv-to-markdown") { const [headers, ...rows] = parseDelimited(source, ","); return markdownTable(headers ?? [], rows); }
  if (mode === "json-to-markdown") { const parsed: unknown = JSON.parse(source); if (!Array.isArray(parsed) || parsed.some((item) => !item || Array.isArray(item) || typeof item !== "object")) throw new Error("객체 배열 형태의 JSON을 입력하세요."); const objects = parsed as Array<Record<string, unknown>>; const headers = Array.from(new Set(objects.flatMap((item) => Object.keys(item)))); return markdownTable(headers, objects.map((item) => headers.map((key) => typeof item[key] === "object" ? JSON.stringify(item[key]) : String(item[key] ?? "")))); }
  if (mode === "markdown-to-html") return basicMarkdownToHtml(source);
  if (mode === "html-to-text") { const doc = new DOMParser().parseFromString(source, "text/html"); return (doc.body.textContent ?? "").replace(/\s+\n/g, "\n").trim(); }
  if (mode === "url-encode") return encodeURIComponent(source);
  if (mode === "url-decode") return decodeURIComponent(source.replace(/\+/g, " "));
  if (mode === "base64-encode") return encodeBase64(source);
  if (mode === "base64-decode") return decodeBase64(source);
  if (mode === "timestamp-to-date") { const value = Number(source.trim()); if (!Number.isFinite(value)) throw new Error("숫자 형태의 Unix 시간을 입력하세요."); const milliseconds = Math.abs(value) < 100_000_000_000 ? value * 1000 : value; const date = new Date(milliseconds); if (Number.isNaN(date.getTime())) throw new Error("유효한 Unix 시간이 아닙니다."); return `로컬 시각: ${date.toLocaleString("ko-KR")}\nISO 8601: ${date.toISOString()}\nUnix 초: ${Math.floor(date.getTime() / 1000)}\nUnix 밀리초: ${date.getTime()}`; }
  if (mode === "date-to-timestamp") { const date = new Date(source.trim()); if (Number.isNaN(date.getTime())) throw new Error("YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm:ss 형식의 날짜를 입력하세요."); return `Unix 초: ${Math.floor(date.getTime() / 1000)}\nUnix 밀리초: ${date.getTime()}\nISO 8601: ${date.toISOString()}`; }
  if (mode === "hex-to-rgb") { const compact = source.trim().replace(/^#/, ""); const full = compact.length === 3 ? compact.split("").map((item) => item + item).join("") : compact; if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error("#RRGGBB 또는 #RGB 형식의 HEX 색상을 입력하세요."); const red = Number.parseInt(full.slice(0, 2), 16); const green = Number.parseInt(full.slice(2, 4), 16); const blue = Number.parseInt(full.slice(4, 6), 16); return `rgb(${red}, ${green}, ${blue})\nR: ${red}\nG: ${green}\nB: ${blue}`; }
  if (mode === "rgb-to-hex") { const values = source.match(/\d+/g)?.map(Number) ?? []; if (values.length < 3 || values.slice(0, 3).some((value) => value < 0 || value > 255 || !Number.isInteger(value))) throw new Error("0부터 255 사이의 R, G, B 값을 쉼표로 구분해 입력하세요."); return `#${values.slice(0, 3).map((value) => value.toString(16).padStart(2, "0").toUpperCase()).join("")}`; }
  if (mode === "html-encode") return htmlEncode(source);
  if (mode === "html-decode") return htmlDecode(source);
  if (mode === "normalize-lines") return source.replace(/\r\n|\r|\n/g, "\n");
  const seen = new Set<string>(); return source.replace(/\r\n|\r/g, "\n").split("\n").filter((line) => line.trim() && !seen.has(line) && (seen.add(line), true)).join("\n");
}

export default function TextTransformTool({ initialMode = "json-pretty" }: { initialMode?: TextMode }) {
  const [mode, setMode] = useState<TextMode>(initialMode); const [source, setSource] = useState(specs[initialMode].sample); const [result, setResult] = useState(""); const [error, setError] = useState(""); const [copied, setCopied] = useState(false);
  const spec = useMemo(() => specs[mode], [mode]);
  useEffect(() => { setMode(initialMode); setSource(specs[initialMode].sample); setResult(""); setError(""); setCopied(false); }, [initialMode]);
  function changeMode(next: TextMode) { setMode(next); setSource(specs[next].sample); setResult(""); setError(""); setCopied(false); }
  function runTransform() { try { setResult(transform(mode, source)); setError(""); setCopied(false); } catch (caught) { setResult(""); setError(caught instanceof Error ? caught.message : "변환 중 오류가 발생했습니다."); } }
  async function copyResult() { if (!result) return; try { await navigator.clipboard.writeText(result); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setError("클립보드에 복사하지 못했습니다. 결과를 직접 선택해 복사하세요."); } }
  return <ToolMetaResolver slug={initialMode}>{tool => <ToolFrame index="04" tag="TEXT ENGINE" title={spec.title} description={spec.description}>
    <SeoHead title={tool.seoTitle ?? tool.title} description={tool.seoDescription ?? tool.description} />
    <CatalogBreadcrumb toolSlug={tool.slug} />
    <section className="tool-workbench file-tool-shell text-transform-shell"><div className="mode-tabs file-mode-tabs" role="tablist" aria-label="텍스트·웹 변환 도구 선택">{(Object.keys(specs) as TextMode[]).map((item) => <button key={item} role="tab" aria-selected={mode === item} className={mode === item ? "selected" : ""} onClick={() => changeMode(item)}><FileCode2 size={16} />{specs[item].tab}</button>)}</div>
      <p className="file-mode-description">{spec.description}</p>
      <div className="text-transform-grid"><div className="conversion-panel"><label className="text-transform-label">입력 내용<textarea value={source} onChange={(event) => { setSource(event.target.value); setError(""); }} placeholder={spec.placeholder} spellCheck={false} /></label><div className="calculator-actions"><button className="primary-action" onClick={runTransform}><RefreshCcw size={18} />변환하기</button><button className="reset-action" onClick={() => { setSource(spec.sample); setResult(""); setError(""); }}>예시 복원</button></div>{error && <p className="status-message error" role="alert">{error}</p>}</div>
        <div className="conversion-panel text-result-panel"><label className="text-transform-label">{spec.outputLabel}<textarea value={result} readOnly placeholder="변환 결과가 여기에 표시됩니다." spellCheck={false} /></label><div className="calculator-actions"><button className="primary-action" onClick={copyResult} disabled={!result}>{copied ? <Check size={18} /> : <Copy size={18} />}{copied ? "복사됨" : "결과 복사"}</button><button className="reset-action" onClick={() => result && downloadBlob(new Blob(["\uFEFF", result], { type: spec.downloadType }), spec.downloadName)} disabled={!result}><Download size={18} />다운로드</button></div></div>
      </div><div className="process-strip"><span><Clipboard size={16} />텍스트는 서버로 전송되지 않습니다</span><span><FileCode2 size={16} />현재 브라우저에서 즉시 변환</span></div>
    </section>
  </ToolFrame>}</ToolMetaResolver>;
}
