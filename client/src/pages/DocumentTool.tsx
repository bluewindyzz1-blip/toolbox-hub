import { useEffect, useMemo, useState } from "react";
import { Download, FileOutput, FileSpreadsheet, FileText, FileType2, LoaderCircle, Table2 } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { ToolFrame } from "@/components/ToolLayout";
import { FileDropZone, FileToolKnowledge, LocalFileSecurityNotice, SelectedFileList } from "@/components/FileToolSupport";
import { downloadBlob, FILE_LIMITS, getExtension, validateFiles } from "@/lib/file-utils";

type DocumentMode = "csv-excel" | "excel-csv" | "csv-json" | "json-csv" | "txt-pdf";
type Output = { name: string; blob: Blob; detail: string };
const modes: Array<{ id: DocumentMode; title: string; icon: typeof FileSpreadsheet; detail: string; extensions: string[] }> = [
  { id: "csv-excel", title: "CSV → Excel", icon: FileSpreadsheet, detail: "CSV 표 데이터를 실제 XLSX 통합문서로 만듭니다.", extensions: ["csv"] },
  { id: "excel-csv", title: "Excel → CSV", icon: Table2, detail: "첫 번째 워크시트를 UTF-8 CSV로 내보냅니다.", extensions: ["xlsx", "xls"] },
  { id: "csv-json", title: "CSV → JSON", icon: FileType2, detail: "첫 줄을 필드명으로 사용해 JSON 배열을 만듭니다.", extensions: ["csv"] },
  { id: "json-csv", title: "JSON → CSV", icon: Table2, detail: "객체 배열 JSON을 UTF-8 CSV 표로 만듭니다.", extensions: ["json"] },
  { id: "txt-pdf", title: "TXT → PDF", icon: FileText, detail: "일반 텍스트를 페이지 나눔이 있는 PDF로 만듭니다.", extensions: ["txt"] },
];

function parseCsv(text: string) {
  const rows: string[][] = []; let row: string[] = []; let value = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]; const next = text[index + 1];
    if (character === '"' && quoted && next === '"') { value += '"'; index += 1; continue; }
    if (character === '"') { quoted = !quoted; continue; }
    if (character === "," && !quoted) { row.push(value); value = ""; continue; }
    if ((character === "\n" || character === "\r") && !quoted) { if (character === "\r" && next === "\n") index += 1; row.push(value); if (row.some((item) => item !== "")) rows.push(row); row = []; value = ""; continue; }
    value += character;
  }
  row.push(value); if (row.some((item) => item !== "")) rows.push(row); return rows;
}
function toCsv(rows: Array<Record<string, unknown>>) {
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const encode = (value: unknown) => { const text = value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value); return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; };
  return [keys.map(encode).join(","), ...rows.map((row) => keys.map((key) => encode(row[key])).join(","))].join("\r\n");
}
function stem(name: string) { return name.replace(/\.[^.]+$/, "") || "document"; }

export default function DocumentTool({ initialMode = "csv-excel" }: { initialMode?: DocumentMode }) {
  const [mode, setMode] = useState<DocumentMode>(initialMode); const [files, setFiles] = useState<File[]>([]); const [processing, setProcessing] = useState(false); const [status, setStatus] = useState(""); const [error, setError] = useState(""); const [output, setOutput] = useState<Output | null>(null);
  const current = useMemo(() => modes.find((item) => item.id === mode) ?? modes[0], [mode]);
  useEffect(() => { setMode(initialMode); setFiles([]); setStatus(""); setError(""); setOutput(null); }, [initialMode]);
  function changeMode(next: DocumentMode) { setMode(next); setFiles([]); setStatus(""); setError(""); setOutput(null); }
  function chooseFiles(next: File[]) { const validation = validateFiles(next, { allowedExtensions: current.extensions, maxFileBytes: FILE_LIMITS.document, maxFiles: 1, label: "파일" }); setFiles(validation.valid); setError(validation.error); setStatus(""); setOutput(null); }
  function reset() { setFiles([]); setStatus(""); setError(""); setOutput(null); }
  async function process() {
    const file = files[0]; if (!file) { setError("파일을 선택하세요."); return; }
    setProcessing(true); setStatus("파일을 읽는 중"); setError(""); setOutput(null);
    try {
      if (mode === "csv-excel") {
        const rows = parseCsv(await file.text()); if (!rows.length) throw new Error("CSV에서 읽을 수 있는 행이 없습니다.");
        const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Sheet1");
        const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" }); setOutput({ name: `${stem(file.name)}.xlsx`, blob: new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), detail: `${rows.length}개 행을 포함한 XLSX 통합문서` }); setStatus("Excel 파일을 만들었습니다.");
      }
      if (mode === "excel-csv") {
        const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" }); const firstName = workbook.SheetNames[0]; const sheet = firstName ? workbook.Sheets[firstName] : undefined; if (!sheet) throw new Error("Excel 파일에서 워크시트를 찾을 수 없습니다.");
        const csv = XLSX.utils.sheet_to_csv(sheet, { FS: ",", RS: "\r\n" }); setOutput({ name: `${stem(file.name)}.csv`, blob: new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }), detail: `첫 번째 워크시트 ‘${firstName}’를 CSV로 변환` }); setStatus("CSV 파일을 만들었습니다.");
      }
      if (mode === "csv-json") {
        const rows = parseCsv(await file.text()); const [headers, ...data] = rows; if (!headers?.length) throw new Error("CSV 첫 줄의 열 이름을 읽을 수 없습니다."); const objects = data.map((row) => Object.fromEntries(headers.map((header, index) => [header || `column_${index + 1}`, row[index] ?? ""])));
        setOutput({ name: `${stem(file.name)}.json`, blob: new Blob([JSON.stringify(objects, null, 2)], { type: "application/json;charset=utf-8" }), detail: `${objects.length}개 행을 JSON 배열로 변환` }); setStatus("JSON 파일을 만들었습니다.");
      }
      if (mode === "json-csv") {
        const parsed: unknown = JSON.parse(await file.text()); if (!Array.isArray(parsed) || parsed.some((item) => !item || Array.isArray(item) || typeof item !== "object")) throw new Error("객체 배열 형태의 JSON만 CSV로 변환할 수 있습니다.");
        const csv = toCsv(parsed as Array<Record<string, unknown>>); setOutput({ name: `${stem(file.name)}.csv`, blob: new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }), detail: `${parsed.length}개 객체를 CSV로 변환` }); setStatus("CSV 파일을 만들었습니다.");
      }
      if (mode === "txt-pdf") {
        const text = await file.text(); if (!text.trim()) throw new Error("내용이 없는 TXT 파일은 PDF로 변환할 수 없습니다."); const pdf = new jsPDF({ unit: "pt", format: "a4" }); pdf.setFont("helvetica", "normal"); pdf.setFontSize(11); const lines = pdf.splitTextToSize(text, 520); let y = 48;
        for (const line of lines) { if (y > 790) { pdf.addPage(); y = 48; } pdf.text(line, 38, y); y += 17; }
        setOutput({ name: `${stem(file.name)}.pdf`, blob: pdf.output("blob"), detail: `${lines.length}개 텍스트 줄을 PDF 페이지로 구성` }); setStatus("PDF 파일을 만들었습니다.");
      }
    } catch (caught) { setError(caught instanceof Error ? caught.message : "문서 변환 중 오류가 발생했습니다."); setStatus(""); } finally { setProcessing(false); }
  }
  return <ToolFrame index="03" tag="DATA ENGINE" title="문서·데이터 변환" description="CSV, Excel, JSON, TXT를 현재 기기에서 실제 파일 형식으로 변환합니다. 파일은 서버로 전송되지 않습니다.">
    <section className="tool-workbench file-tool-shell"><div className="mode-tabs file-mode-tabs" role="tablist" aria-label="문서 변환 도구 선택">{modes.map((item) => { const Icon = item.icon; return <button key={item.id} role="tab" aria-selected={mode === item.id} className={mode === item.id ? "selected" : ""} onClick={() => changeMode(item.id)}><Icon size={17} />{item.title}</button>; })}</div><p className="file-mode-description">{current.detail}</p>
      <div className="work-grid"><div className="conversion-panel"><FileDropZone accept={current.extensions.map((extension) => `.${extension}`).join(",")} disabled={processing} onFiles={chooseFiles} label={`${current.extensions.map((extension) => extension.toUpperCase()).join(" · ")} 파일 선택`} detail={`파일당 최대 ${Math.round(FILE_LIMITS.document / 1024 / 1024)}MB`} /><SelectedFileList files={files} onRemove={() => setFiles([])} /><div className="calculator-actions"><button className="primary-action" onClick={process} disabled={!files.length || processing}>{processing ? <LoaderCircle className="spin" size={18} /> : <FileOutput size={18} />}{processing ? "변환 중" : "변환 시작"}</button><button className="reset-action" onClick={reset} disabled={processing}>초기화</button></div>{status && <p className="status-message" role="status">{status}</p>}{error && <p className="status-message error" role="alert">{error}</p>}</div><LocalFileSecurityNotice /></div>
      {output && <section className="result-section"><div className="section-head"><p className="eyebrow">FILE READY</p><h2>변환 결과</h2></div><ul className="file-output-list"><li><div><b>{output.name}</b><small>{output.detail}</small></div><button onClick={() => downloadBlob(output.blob, output.name)}><Download size={16} />다운로드</button></li></ul></section>}
    </section>
    <FileToolKnowledge usage="변환 방향을 선택하고 파일을 추가한 뒤 변환 시작을 누르세요. 결과 파일은 준비 후 표시되는 다운로드 버튼으로 직접 저장할 수 있습니다." support="CSV ↔ Excel, CSV ↔ JSON, TXT → PDF를 지원합니다. PDF → Excel·한글·원본 구조를 보존하는 PDF → Word는 실제 서버 변환 엔진 연결 전까지 제공하지 않습니다." />
  </ToolFrame>;
}
