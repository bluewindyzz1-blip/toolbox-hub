import { ChangeEvent, DragEvent, useEffect, useState } from "react";
import { Download, FileOutput, FileText, Image as ImageIcon, LoaderCircle, ShieldCheck } from "lucide-react";
import { jsPDF } from "jspdf";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf.mjs";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { ToolFrame } from "@/components/ToolLayout";
import { downloadBlob, formatBytes, readImage } from "@/lib/file-utils";

GlobalWorkerOptions.workerSrc = pdfWorker;

type Operation = "word" | "excel" | "hwp" | "images" | "pdf" | "merge" | "split" | "extract" | "delete" | "reorder" | "rotate" | "watermark" | "page-numbers" | "metadata";
type RenderedPage = { number: number; url: string; blob: Blob };

const operationLabels: Record<Operation, string> = {
  word: "PDF → 워드 변환", excel: "PDF → 엑셀 변환", hwp: "PDF → 한글 변환", images: "PDF → JPG·PNG 변환", pdf: "JPG·PNG → PDF 변환", merge: "PDF 합치기", split: "PDF 분할", extract: "페이지 추출", delete: "페이지 제거", reorder: "PDF 구성", rotate: "PDF 회전", watermark: "워터마크 추가", "page-numbers": "페이지 수 추가", metadata: "PDF 메타데이터",
};

const toolGroups: Array<{ title: string; items: Operation[] }> = [
  { title: "PDF로 변환", items: ["pdf"] },
  { title: "PDF에서 변환", items: ["images", "word", "excel", "hwp"] },
  { title: "PDF 구성", items: ["merge", "split", "delete", "extract", "reorder"] },
  { title: "PDF 편집", items: ["rotate", "page-numbers", "watermark", "metadata"] },
];

function DropArea({ accept, multiple, onFiles, label, detail }: { accept: string; multiple?: boolean; onFiles: (files: File[]) => void; label: string; detail: string }) {
  const [dragging, setDragging] = useState(false);
  const choose = (event: ChangeEvent<HTMLInputElement>) => onFiles(Array.from(event.target.files ?? []));
  const drop = (event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); setDragging(false); onFiles(Array.from(event.dataTransfer.files)); };
  return <label className={`drop-area ${dragging ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
    <input type="file" accept={accept} multiple={multiple} onChange={choose} />
    <span className="drop-symbol">+</span><strong>{label}</strong><small>{detail}</small>
  </label>;
}

function safeName(name: string) { return name.replace(/\.[^/.]+$/, ""); }
function parsePages(value: string, total: number) {
  const numbers = new Set<number>();
  value.split(",").flatMap((part) => { const [start, end] = part.trim().split("-").map(Number); if (Number.isFinite(start) && Number.isFinite(end)) return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i); return Number.isFinite(start) ? [start] : []; }).forEach((n) => { if (n >= 1 && n <= total) numbers.add(n); });
  return Array.from(numbers);
}
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] ?? character)); }

export default function PdfTool({ initialOperation = "word" }: { initialOperation?: Operation }) {
  const [operation, setOperation] = useState<Operation>(initialOperation);
  const [selected, setSelected] = useState<File[]>([]);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [pageInput, setPageInput] = useState("1");
  const [watermark, setWatermark] = useState("CONFIDENTIAL");
  const [metadataTitle, setMetadataTitle] = useState("");

  useEffect(() => () => pages.forEach((page) => URL.revokeObjectURL(page.url)), [pages]);
  const needsSinglePdf = ["word", "excel", "hwp", "images", "split", "extract", "delete", "reorder", "rotate", "watermark", "page-numbers", "metadata"].includes(operation);
  const needsMultiplePdf = operation === "merge";
  const isImageToPdf = operation === "pdf";
  const accept = isImageToPdf ? "image/png,image/jpeg,image/webp" : "application/pdf";
  const selectionLabel = selected.length ? `${selected.length}개 파일 선택됨 · ${selected.map((file) => formatBytes(file.size)).join(" / ")}` : "";

  function chooseOperation(next: Operation) { setOperation(next); setSelected([]); setPages([]); setMessage(""); }
  async function readPdf(file: File) { return PDFDocument.load(await file.arrayBuffer()); }
  async function extractText(file: File) {
    const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
    const sections: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = (content.items as Array<{ str?: string }>).map((item) => item.str ?? "").join(" ").trim();
      sections.push(text);
    }
    return sections;
  }
  async function convertText(file: File, target: "word" | "excel" | "hwp") {
    const sections = await extractText(file);
    if (target === "excel") {
      const csv = ["페이지,텍스트", ...sections.map((text, index) => `${index + 1},"${text.replace(/"/g, '""')}"`)].join("\n");
      downloadBlob(new Blob(["\\ufeff", csv], { type: "text/csv;charset=utf-8" }), `${safeName(file.name)}-excel.csv`);
      setMessage(`${sections.length}페이지의 텍스트를 엑셀에서 열 수 있는 CSV 파일로 저장했습니다. 표 구조는 복원되지 않을 수 있습니다.`);
      return;
    }
    const body = sections.map((text, index) => `<section><h2>페이지 ${index + 1}</h2><p>${escapeHtml(text) || "(추출된 텍스트 없음)"}</p></section>`).join("");
    const title = escapeHtml(metadataTitle || file.name);
    const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,'Malgun Gothic',sans-serif;line-height:1.7;max-width:780px;margin:48px auto;color:#111}section{page-break-after:always}h2{border-bottom:2px solid #111;padding-bottom:8px}</style></head><body>${body}</body></html>`;
    const extension = target === "word" ? "doc" : "html";
    downloadBlob(new Blob([html], { type: target === "word" ? "application/msword" : "text/html;charset=utf-8" }), `${safeName(file.name)}-${target === "word" ? "word" : "hwp-compatible"}.${extension}`);
    setMessage(target === "word" ? "텍스트를 워드 파일로 열 수 있는 DOC 호환 문서로 저장했습니다." : "한글 파일로 저장할 수 있는 HTML 문서를 만들었습니다. 한글에서 연 뒤 다른 이름으로 저장하세요.");
  }
  async function convertPdfToImages(file: File) {
    const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
    const nextPages: RenderedPage[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber); const viewport = page.getViewport({ scale: 1.8 });
      const canvas = document.createElement("canvas"); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext("2d"); if (!context) throw new Error("캔버스를 시작할 수 없습니다.");
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("이미지를 생성하지 못했습니다.")), mime, 0.92));
      nextPages.push({ number: pageNumber, url: URL.createObjectURL(blob), blob });
    }
    setPages(nextPages); setMessage(`${pdf.numPages}페이지를 ${format.toUpperCase()} 미리보기로 렌더링했습니다.`);
  }
  async function convertImagesToPdf(files: File[]) {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    for (let index = 0; index < files.length; index += 1) { const image = await readImage(files[index]); const landscape = image.width > image.height; if (index > 0) pdf.addPage("a4", landscape ? "landscape" : "portrait"); const pageWidth = landscape ? 841.89 : 595.28; const pageHeight = landscape ? 595.28 : 841.89; const margin = 36; const ratio = Math.min((pageWidth - margin * 2) / image.width, (pageHeight - margin * 2) / image.height); const width = image.width * ratio; const height = image.height * ratio; const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height; canvas.getContext("2d")?.drawImage(image, 0, 0); pdf.addImage(canvas.toDataURL("image/jpeg", 0.94), "JPEG", (pageWidth - width) / 2, (pageHeight - height) / 2, width, height); }
    downloadBlob(pdf.output("blob"), "images-to-pdf.pdf"); setMessage(`${files.length}개 이미지를 하나의 PDF로 저장했습니다.`);
  }
  async function savePdf(pdf: PDFDocument, name: string) { downloadBlob(new Blob([await pdf.save()] as BlobPart[], { type: "application/pdf" }), name); }
  async function processPdfOperation() {
    const file = selected[0]; if (!file) return; const source = await readPdf(file); const total = source.getPageCount();
    if (["word", "excel", "hwp"].includes(operation)) { if (operation === "hwp" && !window.confirm("한글 변환 안내\n\n현재 결과는 한글에서 열 수 있는 HTML 문서입니다.\n파일을 한글에서 연 뒤 ‘다른 이름으로 저장’을 선택해 .hwp 파일로 저장할 수 있습니다.\n\n계속 변환하시겠습니까?")) return; await convertText(file, operation as "word" | "excel" | "hwp"); return; }
    if (operation === "split") { for (let index = 0; index < total; index += 1) { const output = await PDFDocument.create(); const [page] = await output.copyPages(source, [index]); output.addPage(page); await savePdf(output, `${safeName(file.name)}-page-${index + 1}.pdf`); } setMessage(`${total}개 PDF로 분할했습니다. 브라우저 설정에 따라 여러 다운로드 허용이 필요할 수 있습니다.`); return; }
    const selectedPages = ["watermark", "page-numbers", "metadata"].includes(operation) ? source.getPageIndices() : parsePages(pageInput, total).map((page) => page - 1); if (!selectedPages.length) throw new Error(`1~${total} 범위의 페이지 번호를 입력하세요.`);
    if (operation === "merge") { const output = await PDFDocument.create(); for (const input of selected) { const inputPdf = await readPdf(input); const copied = await output.copyPages(inputPdf, inputPdf.getPageIndices()); copied.forEach((page) => output.addPage(page)); } await savePdf(output, "merged.pdf"); setMessage(`${selected.length}개 PDF를 하나로 합쳤습니다.`); return; }
    const output = await PDFDocument.create(); const keep = operation === "delete" ? source.getPageIndices().filter((index) => !selectedPages.includes(index)) : operation === "reorder" ? selectedPages : selectedPages;
    if (!keep.length) throw new Error("삭제 후 남는 페이지가 없습니다."); const copied = await output.copyPages(source, keep); copied.forEach((page) => output.addPage(page));
    if (operation === "rotate") output.getPages().forEach((page) => page.setRotation(degrees(90)));
    if (operation === "watermark") { const font = await output.embedFont(StandardFonts.Helvetica); output.getPages().forEach((page) => { const { width, height } = page.getSize(); page.drawText(watermark || "CONFIDENTIAL", { x: width / 2 - 100, y: height / 2, size: 28, font, color: rgb(0.75, 0.1, 0.1), opacity: 0.28, rotate: degrees(-35) }); }); }
    if (operation === "page-numbers") { const font = await output.embedFont(StandardFonts.Helvetica); output.getPages().forEach((page, index) => { const { width } = page.getSize(); page.drawText(String(index + 1), { x: width / 2 - 4, y: 24, size: 10, font, color: rgb(0.25, 0.25, 0.25) }); }); }
    if (operation === "metadata") { output.setTitle(metadataTitle || file.name); output.setAuthor("Carculate"); output.setSubject("브라우저에서 편집한 PDF"); }
    await savePdf(output, `${safeName(file.name)}-${operation}.pdf`); setMessage(operation === "delete" ? `${selectedPages.length}페이지를 제외한 PDF를 저장했습니다.` : `${operationLabels[operation]} 결과를 저장했습니다.`);
  }
  async function processFiles() { if (!selected.length) return; setProcessing(true); setMessage(""); setPages([]); try { if (operation === "pdf") await convertImagesToPdf(selected); else if (operation === "images") await convertPdfToImages(selected[0]); else if (operation === "merge" || needsSinglePdf) await processPdfOperation(); } catch (error) { setMessage(error instanceof Error ? error.message : "처리 도중 오류가 발생했습니다."); } finally { setProcessing(false); } }

  return <ToolFrame index="01" tag="DOCUMENT ENGINE" title={operationLabels[operation]} description="선택한 파일은 현재 기기 안에서만 처리됩니다. 서버 업로드 없이 작업이 끝난 후 바로 다운로드하세요.">
    <section className="tool-workbench"><div className="tool-category-grid" role="tablist" aria-label="PDF 도구 선택">{toolGroups.map((group) => <section className="tool-category" key={group.title}><h2>{group.title}</h2><div className="tool-category-items">{group.items.map((item) => <button key={item} className={operation === item ? "selected" : ""} onClick={() => chooseOperation(item)}>{item === "images" || item === "pdf" ? <ImageIcon size={18} /> : item === "merge" || item === "split" || item === "delete" || item === "extract" || item === "reorder" ? <FileOutput size={18} /> : <FileText size={18} />}{operationLabels[item]}</button>)}</div></section>)}</div>
      <div className="work-grid"><div className="conversion-panel">
        {operation === "images" && <div className="inline-options"><span>출력 포맷</span><button className={format === "png" ? "selected" : ""} onClick={() => setFormat("png")}>PNG</button><button className={format === "jpeg" ? "selected" : ""} onClick={() => setFormat("jpeg")}>JPG</button></div>}
        {!["word", "excel", "hwp", "images", "pdf", "merge"].includes(operation) && <label className="inline-options"><span>페이지 번호</span><input value={pageInput} onChange={(event) => setPageInput(event.target.value)} placeholder="예: 1,3-5" /></label>}
        {operation === "watermark" && <label className="inline-options"><span>워터마크 문구</span><input value={watermark} onChange={(event) => setWatermark(event.target.value)} /></label>}
        {operation === "page-numbers" && <p className="file-summary">모든 페이지 하단 중앙에 번호를 추가합니다.</p>}
        {operation === "metadata" && <label className="inline-options"><span>새 문서 제목</span><input value={metadataTitle} onChange={(event) => setMetadataTitle(event.target.value)} placeholder="문서 제목" /></label>}
        <DropArea accept={accept} multiple={isImageToPdf || needsMultiplePdf} onFiles={setSelected} label={isImageToPdf ? "이미지를 놓거나 선택하세요" : "PDF 파일을 놓거나 선택하세요"} detail={isImageToPdf ? "JPG · PNG · WebP 여러 개 선택 가능" : needsMultiplePdf ? "합칠 PDF 여러 개 선택 가능" : "PDF 파일 1개"} />
        {selectionLabel && <p className="file-summary">{selectionLabel}</p>}
        <button className="primary-action" onClick={processFiles} disabled={!selected.length || processing}>{processing ? <LoaderCircle className="spin" size={18} /> : <Download size={18} />}{processing ? "처리 중" : "변환 시작"}</button>{message && <p className="status-message">{message}</p>}
      </div><aside className="tool-note"><ShieldCheck size={30} /><h2>로컬 처리 원칙</h2><p>파일은 외부 서버로 전송되지 않습니다. 탭을 닫으면 선택 파일과 변환 결과도 사라집니다.</p>{["word", "excel", "hwp"].includes(operation) && <p className="note-warning">텍스트 레이어가 있는 PDF 기준입니다. 스캔 이미지·표·복잡한 레이아웃은 원본과 다를 수 있습니다.</p>}{operation === "hwp" && <p className="note-warning">브라우저에서 전용 HWP 바이너리를 만들 수 없어 한글에서 열 수 있는 HTML 파일로 제공합니다.</p>}</aside></div>
    </section>{pages.length > 0 && <section className="result-section"><div className="section-head"><p className="eyebrow">OUTPUT / {format.toUpperCase()}</p><h2>페이지별 결과</h2></div><div className="image-results">{pages.map((page) => <article className="page-result" key={page.number}><img src={page.url} alt={`PDF ${page.number}페이지 미리보기`} /><div><span>PAGE {String(page.number).padStart(2, "0")}</span><button onClick={() => downloadBlob(page.blob, `pdf-page-${page.number}.${format === "jpeg" ? "jpg" : "png"}`)}><Download size={15} />저장</button></div></article>)}</div></section>}
  </ToolFrame>;
}
