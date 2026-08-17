import { useEffect, useMemo, useState } from "react";
import { Download, FileArchive, FileImage, FileOutput, FilePenLine, FileText, LoaderCircle, RotateCw, Scissors, Trash2 } from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";
import { jsPDF } from "jspdf";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf.mjs";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { ToolFrame } from "@/components/ToolLayout";
import { FileDropZone, FileToolKnowledge, LocalFileSecurityNotice, SelectedFileList } from "@/components/FileToolSupport";
import { assertPdfFile, downloadBlob, FILE_LIMITS, formatBytes, readImage, validateFiles } from "@/lib/file-utils";

GlobalWorkerOptions.workerSrc = pdfWorker;

type PdfMode = "to-images" | "images-to-pdf" | "merge" | "split" | "extract" | "delete" | "reorder" | "rotate" | "compress" | "word";
type Output = { name: string; blob: Blob; detail: string };
type RenderedPage = { number: number; url: string; blob: Blob; extension: "png" | "jpg" };

const modes: Array<{ id: PdfMode; title: string; icon: typeof FileText; detail: string }> = [
  { id: "to-images", title: "PDF → 이미지", icon: FileImage, detail: "PDF의 각 페이지를 PNG 또는 JPG로 실제 렌더링합니다." },
  { id: "images-to-pdf", title: "이미지 → PDF", icon: FileOutput, detail: "JPG·PNG·WebP 이미지를 한 개의 PDF로 만듭니다." },
  { id: "merge", title: "PDF 합치기", icon: FileArchive, detail: "여러 PDF 페이지를 선택한 순서대로 합칩니다." },
  { id: "split", title: "PDF 분할", icon: Scissors, detail: "PDF의 각 페이지를 개별 PDF 파일로 분할합니다." },
  { id: "extract", title: "페이지 추출", icon: FileText, detail: "입력한 페이지 범위만 새 PDF로 추출합니다." },
  { id: "delete", title: "페이지 삭제", icon: Trash2, detail: "입력한 페이지를 제외한 새 PDF를 만듭니다." },
  { id: "reorder", title: "순서 변경", icon: FilePenLine, detail: "페이지 번호 목록 순서대로 새 PDF를 만듭니다." },
  { id: "rotate", title: "페이지 회전", icon: RotateCw, detail: "선택한 페이지를 90·180·270도 회전합니다." },
  { id: "compress", title: "용량 줄이기", icon: FileArchive, detail: "페이지를 JPEG로 재구성하여 실제 파일 용량을 줄입니다." },
  { id: "word", title: "PDF → Word", icon: FileText, detail: "서버 기반 구조 보존 변환 연결 전까지 제공하지 않습니다." },
];

function parsePages(value: string, total: number) {
  const pages = new Set<number>();
  const normalized = value.trim();
  if (!normalized) throw new Error("처리할 페이지 번호를 입력하세요. 예: 1,3-5");
  for (const token of normalized.split(",").map((item) => item.trim()).filter(Boolean)) {
    const range = token.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const start = Number(range[1]); const end = Number(range[2]);
      if (start < 1 || end < start || end > total) throw new Error(`페이지 범위는 1부터 ${total} 사이여야 합니다.`);
      for (let page = start; page <= end; page += 1) pages.add(page);
    } else {
      const page = Number(token);
      if (!Number.isInteger(page) || page < 1 || page > total) throw new Error(`페이지 번호는 1부터 ${total} 사이여야 합니다.`);
      pages.add(page);
    }
  }
  return Array.from(pages).sort((left, right) => left - right);
}

function fileStem(name: string) { return name.replace(/\.[^.]+$/, "") || "document"; }
function pdfBlob(bytes: Uint8Array) { const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer; return new Blob([buffer], { type: "application/pdf" }); }
function isMultiFileMode(mode: PdfMode) { return mode === "images-to-pdf" || mode === "merge"; }
function isImageMode(mode: PdfMode) { return mode === "images-to-pdf"; }

export default function PdfTool({ initialMode = "to-images", initialFormat = "png" }: { initialMode?: PdfMode; initialFormat?: "png" | "jpg" }) {
  const [mode, setMode] = useState<PdfMode>(initialMode);
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<"png" | "jpg">(initialFormat);
  const [pageInput, setPageInput] = useState("");
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [quality, setQuality] = useState(65);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [pages, setPages] = useState<RenderedPage[]>([]);

  const selectedMode = useMemo(() => modes.find((item) => item.id === mode) ?? modes[0], [mode]);
  const accepts = isImageMode(mode) ? "image/jpeg,image/png,image/webp" : "application/pdf,.pdf";
  const fileDetail = isImageMode(mode) ? `JPG · PNG · WebP · 파일당 최대 ${formatBytes(FILE_LIMITS.image)}` : `PDF · 파일당 최대 ${formatBytes(FILE_LIMITS.pdf)}`;

  useEffect(() => () => pages.forEach((page) => URL.revokeObjectURL(page.url)), [pages]);
  useEffect(() => { setMode(initialMode); setFormat(initialFormat); setFiles([]); setPageInput(""); setStatus(""); setError(""); clearResults(); }, [initialMode, initialFormat]);
  function clearResults() { pages.forEach((page) => URL.revokeObjectURL(page.url)); setPages([]); setOutputs([]); }
  function changeMode(next: PdfMode) { setMode(next); setFiles([]); setPageInput(""); setStatus(""); setError(""); clearResults(); }
  function chooseFiles(next: File[]) {
    const validation = validateFiles(next, { allowedExtensions: isImageMode(mode) ? ["jpg", "jpeg", "png", "webp"] : ["pdf"], maxFileBytes: isImageMode(mode) ? FILE_LIMITS.image : FILE_LIMITS.pdf, maxFiles: isMultiFileMode(mode) ? FILE_LIMITS.maxBatch : 1, label: "파일" });
    clearResults(); setFiles(validation.valid); setError(validation.error); setStatus("");
  }
  function removeFile(index: number) { setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index)); }
  function reset() { setFiles([]); setPageInput(""); setStatus(""); setError(""); clearResults(); }

  async function renderPdfToImages(file: File) {
    await assertPdfFile(file);
    const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
    if (pdf.numPages > 100) throw new Error("한 번에 최대 100페이지까지 이미지로 변환할 수 있습니다. 더 작은 PDF로 나누어 처리하세요.");
    const nextPages: RenderedPage[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      setStatus(`${pageNumber}/${pdf.numPages}페이지를 이미지로 변환하는 중`);
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.65 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("브라우저 캔버스를 시작할 수 없습니다.");
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("이미지 생성에 실패했습니다.")), mime, 0.92));
      nextPages.push({ number: pageNumber, blob, extension: format, url: URL.createObjectURL(blob) });
    }
    setPages(nextPages); setStatus(`${pdf.numPages}개 페이지를 ${format.toUpperCase()} 파일로 준비했습니다.`);
  }

  async function imagesToPdf(input: File[]) {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    for (let index = 0; index < input.length; index += 1) {
      setStatus(`${index + 1}/${input.length}개 이미지를 PDF에 배치하는 중`);
      const image = await readImage(input[index]);
      const landscape = image.width > image.height;
      if (index > 0) pdf.addPage("a4", landscape ? "landscape" : "portrait");
      const pageWidth = landscape ? 841.89 : 595.28; const pageHeight = landscape ? 595.28 : 841.89; const margin = 36;
      const ratio = Math.min((pageWidth - margin * 2) / image.width, (pageHeight - margin * 2) / image.height);
      const width = image.width * ratio; const height = image.height * ratio;
      const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext("2d"); if (!context) throw new Error("이미지 캔버스를 시작할 수 없습니다.");
      context.drawImage(image, 0, 0); pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", (pageWidth - width) / 2, (pageHeight - height) / 2, width, height);
    }
    setOutputs([{ name: "images-to-pdf.pdf", blob: pdf.output("blob"), detail: `${input.length}개 이미지를 포함한 PDF` }]); setStatus("PDF 파일을 만들었습니다.");
  }

  async function mergePdfs(input: File[]) {
    const merged = await PDFDocument.create();
    for (let index = 0; index < input.length; index += 1) {
      setStatus(`${index + 1}/${input.length}개 PDF를 합치는 중`); await assertPdfFile(input[index]);
      const source = await PDFDocument.load(await input[index].arrayBuffer(), { ignoreEncryption: false });
      const copied = await merged.copyPages(source, source.getPageIndices()); copied.forEach((page) => merged.addPage(page));
    }
    setOutputs([{ name: "merged.pdf", blob: pdfBlob(await merged.save()), detail: `${input.length}개 PDF를 원래 순서대로 병합` }]); setStatus("PDF 합치기를 완료했습니다.");
  }

  async function loadSinglePdf() { const file = files[0]; if (!file) throw new Error("PDF 파일을 선택하세요."); await assertPdfFile(file); const document = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false }); return { file, document }; }
  async function splitPdf() {
    const { file, document } = await loadSinglePdf(); const result: Output[] = [];
    for (let index = 0; index < document.getPageCount(); index += 1) { setStatus(`${index + 1}/${document.getPageCount()}페이지를 분할하는 중`); const next = await PDFDocument.create(); const [page] = await next.copyPages(document, [index]); next.addPage(page); result.push({ name: `${fileStem(file.name)}-page-${index + 1}.pdf`, blob: pdfBlob(await next.save()), detail: `${index + 1}페이지` }); }
    setOutputs(result); setStatus(`${result.length}개 개별 PDF를 준비했습니다.`);
  }
  async function extractOrDeletePdf(kind: "extract" | "delete") {
    const { file, document } = await loadSinglePdf(); const selected = parsePages(pageInput, document.getPageCount()); const indexes = document.getPageIndices().filter((index) => kind === "extract" ? selected.includes(index + 1) : !selected.includes(index + 1));
    if (!indexes.length) throw new Error(kind === "delete" ? "모든 페이지를 삭제할 수 없습니다. 남길 페이지를 하나 이상 두세요." : "추출할 페이지가 없습니다.");
    const next = await PDFDocument.create(); const copied = await next.copyPages(document, indexes); copied.forEach((page) => next.addPage(page));
    setOutputs([{ name: `${fileStem(file.name)}-${kind === "extract" ? "extracted" : "pages-removed"}.pdf`, blob: pdfBlob(await next.save()), detail: `${indexes.length}페이지를 포함` }]); setStatus(kind === "extract" ? "선택한 페이지를 추출했습니다." : "선택한 페이지를 삭제했습니다.");
  }
  async function reorderPdf() {
    const { file, document } = await loadSinglePdf(); const requested = pageInput.split(",").map((item) => Number(item.trim())); const total = document.getPageCount();
    if (requested.length !== total || requested.some((page) => !Number.isInteger(page) || page < 1 || page > total) || new Set(requested).size !== total) throw new Error(`페이지 순서를 1부터 ${total}까지 한 번씩 입력하세요. 예: ${Array.from({ length: total }, (_, index) => index + 1).join(",")}`);
    const next = await PDFDocument.create(); const copied = await next.copyPages(document, requested.map((page) => page - 1)); copied.forEach((page) => next.addPage(page));
    setOutputs([{ name: `${fileStem(file.name)}-reordered.pdf`, blob: pdfBlob(await next.save()), detail: `${total}페이지 순서 변경` }]); setStatus("페이지 순서를 변경했습니다.");
  }
  async function rotatePdf() {
    const { file, document } = await loadSinglePdf(); const selected = pageInput.trim() ? parsePages(pageInput, document.getPageCount()) : document.getPageIndices().map((index) => index + 1);
    selected.forEach((pageNumber) => { const page = document.getPage(pageNumber - 1); page.setRotation(degrees((page.getRotation().angle + rotation) % 360)); });
    setOutputs([{ name: `${fileStem(file.name)}-rotated.pdf`, blob: pdfBlob(await document.save()), detail: `${selected.length}페이지를 ${rotation}도 회전` }]); setStatus("선택한 페이지를 회전했습니다.");
  }
  async function compressPdf() {
    const file = files[0]; if (!file) throw new Error("PDF 파일을 선택하세요."); await assertPdfFile(file);
    const source = await getDocument({ data: await file.arrayBuffer() }).promise;
    if (source.numPages > 50) throw new Error("용량 줄이기는 한 번에 최대 50페이지까지 지원합니다. 큰 PDF는 나누어 처리하세요.");
    let output: jsPDF | null = null;
    for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
      setStatus(`${pageNumber}/${source.numPages}페이지를 압축용으로 재구성하는 중`); const page = await source.getPage(pageNumber); const viewport = page.getViewport({ scale: 0.95 });
      const canvas = document.createElement("canvas"); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height); const context = canvas.getContext("2d"); if (!context) throw new Error("브라우저 캔버스를 시작할 수 없습니다."); await page.render({ canvas, canvasContext: context, viewport }).promise;
      const orientation = viewport.width > viewport.height ? "landscape" : "portrait";
      if (!output) output = new jsPDF({ unit: "pt", format: [viewport.width, viewport.height], orientation, compress: true });
      else output.addPage([viewport.width, viewport.height], orientation);
      output.addImage(canvas.toDataURL("image/jpeg", quality / 100), "JPEG", 0, 0, viewport.width, viewport.height, undefined, "FAST");
    }
    if (!output) throw new Error("PDF 페이지를 읽을 수 없습니다.");
    const blob = output.output("blob"); setOutputs([{ name: `${fileStem(file.name)}-compressed.pdf`, blob, detail: `JPEG 품질 ${quality}%로 ${source.numPages}페이지를 재구성 · 원본 ${formatBytes(file.size)} → 결과 ${formatBytes(blob.size)}` }]); setStatus("이미지 재구성 방식의 PDF 용량 줄이기를 완료했습니다.");
  }

  async function process() {
    if (mode === "word") return; if (!files.length) { setError("파일을 선택하세요."); return; }
    setProcessing(true); setError(""); setStatus("파일을 읽는 중"); clearResults();
    try {
      if (mode === "to-images") await renderPdfToImages(files[0]);
      if (mode === "images-to-pdf") await imagesToPdf(files);
      if (mode === "merge") await mergePdfs(files);
      if (mode === "split") await splitPdf();
      if (mode === "extract" || mode === "delete") await extractOrDeletePdf(mode);
      if (mode === "reorder") await reorderPdf();
      if (mode === "rotate") await rotatePdf();
      if (mode === "compress") await compressPdf();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "파일 처리 중 오류가 발생했습니다."); setStatus(""); } finally { setProcessing(false); }
  }

  const requiresPageInput = mode === "extract" || mode === "delete" || mode === "reorder" || mode === "rotate";
  return <ToolFrame index="01" tag="DOCUMENT ENGINE" title="PDF·파일 도구" description="PDF와 이미지를 현재 기기에서 실제로 변환·편집합니다. 파일을 서버에 전송하거나 저장하지 않습니다.">
    <section className="tool-workbench file-tool-shell">
      <div className="mode-tabs file-mode-tabs" role="tablist" aria-label="PDF 파일 도구 선택">{modes.map((item) => { const Icon = item.icon; return <button key={item.id} role="tab" aria-selected={mode === item.id} className={mode === item.id ? "selected" : ""} onClick={() => changeMode(item.id)}><Icon size={17} />{item.title}</button>; })}</div>
      <p className="file-mode-description">{selectedMode.detail}</p>
      {mode === "word" ? <section className="file-unavailable"><FileText size={34} /><h2>PDF → Word는 현재 비공개입니다</h2><p>표·이미지·원본 배치를 보존하는 실제 변환은 서버 기반 전문 변환 엔진이 필요합니다. 현재는 단순 확장자 변경이나 불완전한 텍스트 추출 결과를 제공하지 않습니다.</p><small>향후 서버 변환 API를 연결할 수 있도록 PDF 도구의 카탈로그·UI 구조는 유지합니다.</small></section> : <>
        <div className="work-grid"><div className="conversion-panel">
          <FileDropZone accept={accepts} multiple={isMultiFileMode(mode)} disabled={processing} onFiles={chooseFiles} label={isImageMode(mode) ? "이미지를 놓거나 선택하세요" : "PDF 파일을 놓거나 선택하세요"} detail={fileDetail} />
          <SelectedFileList files={files} onRemove={removeFile} />
          {mode === "to-images" && <div className="inline-options"><span>출력 형식</span><button className={format === "png" ? "selected" : ""} onClick={() => setFormat("png")}>PNG</button><button className={format === "jpg" ? "selected" : ""} onClick={() => setFormat("jpg")}>JPG</button></div>}
          {requiresPageInput && <label className="file-option">{mode === "reorder" ? "새 페이지 순서" : mode === "rotate" ? "회전할 페이지 (비우면 전체)" : mode === "extract" ? "추출할 페이지" : "삭제할 페이지"}<input value={pageInput} onChange={(event) => setPageInput(event.target.value)} placeholder={mode === "reorder" ? "예: 3,1,2" : "예: 1,3-5"} disabled={processing} />{mode !== "reorder" && <small>쉼표와 하이픈으로 범위를 입력하세요. 예: 1,3-5</small>}</label>}
          {mode === "rotate" && <label className="file-option">회전 각도<select value={rotation} onChange={(event) => setRotation(Number(event.target.value) as 90 | 180 | 270)}><option value={90}>90도</option><option value={180}>180도</option><option value={270}>270도</option></select></label>}
          {mode === "compress" && <label className="range-label">JPEG 품질 <b>{quality}%</b><input type="range" min="35" max="85" value={quality} onChange={(event) => setQuality(Number(event.target.value))} disabled={processing} /><small>낮을수록 용량은 줄지만 선명도와 텍스트·벡터 정보가 손실될 수 있습니다.</small></label>}
          <div className="calculator-actions"><button className="primary-action" onClick={process} disabled={!files.length || processing}>{processing ? <LoaderCircle className="spin" size={18} /> : <FileOutput size={18} />}{processing ? "처리 중" : "처리 시작"}</button><button className="reset-action" onClick={reset} disabled={processing}>초기화</button></div>
          {status && <p className="status-message" role="status">{status}</p>}{error && <p className="status-message error" role="alert">{error}</p>}
        </div><LocalFileSecurityNotice /></div>
        {pages.length > 0 && <section className="result-section"><div className="section-head"><p className="eyebrow">OUTPUT / {format.toUpperCase()}</p><h2>페이지별 결과</h2></div><div className="image-results">{pages.map((page) => <article className="page-result" key={page.number}><img src={page.url} alt={`PDF ${page.number}페이지 미리보기`} /><div><span>PAGE {String(page.number).padStart(2, "0")}</span><button onClick={() => downloadBlob(page.blob, `pdf-page-${page.number}.${page.extension}`)}><Download size={15} />다운로드</button></div></article>)}</div></section>}
        {outputs.length > 0 && <section className="result-section"><div className="section-head"><p className="eyebrow">FILE READY</p><h2>처리 결과</h2></div><ul className="file-output-list">{outputs.map((output, index) => <li key={`${output.name}-${index}`}><div><b>{output.name}</b><small>{output.detail}</small></div><button onClick={() => downloadBlob(output.blob, output.name)}><Download size={16} />다운로드</button></li>)}</ul></section>}
      </>}
    </section>
    <FileToolKnowledge usage="도구를 선택한 뒤 파일을 클릭하거나 드래그 앤 드롭으로 추가하고, 필요한 페이지·품질 옵션을 설정한 다음 처리 시작을 누르세요. 결과가 준비되면 다운로드 버튼을 직접 누를 수 있습니다." support="PDF → PNG/JPG, JPG·PNG·WebP → PDF, PDF 합치기·분할·추출·삭제·순서 변경·회전, JPEG 재구성 방식의 PDF 용량 줄이기를 지원합니다. PDF → Word는 구조 보존 엔진 연결 전까지 비공개입니다." />
  </ToolFrame>;
}
