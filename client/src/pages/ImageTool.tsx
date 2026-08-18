import { useEffect, useMemo, useState } from "react";
import { Download, Image as ImageIcon, LoaderCircle, Maximize2, Minimize2, RefreshCcw, RotateCw, FlipHorizontal2, Contrast, Frame } from "lucide-react";
import { ToolFrame } from "@/components/ToolLayout";
import { FileDropZone, FileToolKnowledge, LocalFileSecurityNotice, SelectedFileList } from "@/components/FileToolSupport";
import { downloadBlob, FILE_LIMITS, formatBytes, readImage, validateFiles } from "@/lib/file-utils";

type OutputType = "image/png" | "image/jpeg" | "image/webp";
type ImageMode = "convert" | "compress" | "resize" | "rotate" | "flip" | "grayscale" | "padding";
type Output = { name: string; blob: Blob; detail: string };
const formatLabel: Record<OutputType, string> = { "image/png": "PNG", "image/jpeg": "JPG", "image/webp": "WEBP" };

const modeCopy: Record<ImageMode, string> = {
  convert: "JPG·PNG·WEBP 형식을 실제 이미지 파일로 변환합니다.",
  compress: "JPEG 또는 WEBP 품질을 조정해 실제 이미지 용량을 줄입니다.",
  resize: "가로·세로 해상도를 유지 비율로 조절해 새 이미지 파일을 만듭니다.",
  rotate: "이미지를 90도 단위로 회전해 새 이미지 파일을 만듭니다.",
  flip: "이미지를 좌우 또는 상하 방향으로 반전해 저장합니다.",
  grayscale: "컬러 이미지를 흑백 톤으로 바꾼 새 이미지 파일을 만듭니다.",
  padding: "이미지 바깥에 균일한 흰색 여백을 추가해 새 이미지 파일을 만듭니다.",
};

export default function ImageTool({ initialMode = "convert", initialFormat }: { initialMode?: ImageMode; initialFormat?: OutputType }) {
  const [mode, setMode] = useState<ImageMode>(initialMode);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [original, setOriginal] = useState({ width: 0, height: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [format, setFormat] = useState<OutputType>(initialFormat ?? "image/webp");
  const [quality, setQuality] = useState(82);
  const [rotation, setRotation] = useState(90);
  const [flipDirection, setFlipDirection] = useState<"horizontal" | "vertical">("horizontal");
  const [padding, setPadding] = useState(40);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [output, setOutput] = useState<Output | null>(null);
  const outputDimensions = useMemo(() => {
    if (mode === "rotate" && rotation % 180 !== 0) return { width: height, height: width };
    if (mode === "padding") return { width: width + padding * 2, height: height + padding * 2 };
    return { width, height };
  }, [height, mode, padding, rotation, width]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => { setMode(initialMode); setFormat(initialFormat ?? (initialMode === "compress" ? "image/webp" : "image/webp")); setOutput(null); setStatus(""); setError(""); }, [initialFormat, initialMode]);

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(""); setOriginal({ width: 0, height: 0 }); setWidth(0); setHeight(0); setStatus(""); setError(""); setOutput(null);
  }
  function selectMode(next: ImageMode) { setMode(next); if (next === "compress") setFormat("image/webp"); setStatus(""); setError(""); setOutput(null); }
  async function chooseFiles(files: File[]) {
    const validation = validateFiles(files, { allowedExtensions: ["jpg", "jpeg", "png", "webp"], maxFileBytes: FILE_LIMITS.image, maxFiles: 1, label: "이미지 파일" });
    reset();
    if (validation.error) { setError(validation.error); return; }
    const nextFile = validation.valid[0];
    try {
      const image = await readImage(nextFile);
      const nextPreview = URL.createObjectURL(nextFile);
      setFile(nextFile); setPreview(nextPreview); setOriginal({ width: image.width, height: image.height }); setWidth(image.width); setHeight(image.height);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "이미지를 읽을 수 없습니다."); }
  }
  function changeWidth(next: number) { if (!Number.isFinite(next) || next < 1) return; setWidth(next); if (original.width) setHeight(Math.max(1, Math.round((next / original.width) * original.height))); }
  function changeHeight(next: number) { if (!Number.isFinite(next) || next < 1) return; setHeight(next); if (original.height) setWidth(Math.max(1, Math.round((next / original.height) * original.width))); }
  async function process() {
    if (!file || !width || !height) { setError("이미지와 유효한 해상도를 선택하세요."); return; }
    setProcessing(true); setStatus("이미지를 읽는 중"); setError(""); setOutput(null);
    try {
      const image = await readImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = outputDimensions.width;
      canvas.height = outputDimensions.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("브라우저 캔버스를 시작할 수 없습니다.");
      if (format === "image/jpeg" || mode === "padding") { context.fillStyle = "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height); }
      if (mode === "rotate") {
        context.save();
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(rotation * Math.PI / 180);
        context.drawImage(image, -width / 2, -height / 2, width, height);
        context.restore();
      } else if (mode === "flip") {
        context.save();
        if (flipDirection === "horizontal") { context.translate(canvas.width, 0); context.scale(-1, 1); }
        else { context.translate(0, canvas.height); context.scale(1, -1); }
        context.drawImage(image, 0, 0, width, height);
        context.restore();
      } else if (mode === "padding") {
        context.drawImage(image, padding, padding, width, height);
      } else {
        context.drawImage(image, 0, 0, width, height);
        if (mode === "grayscale") {
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
          for (let index = 0; index < pixels.data.length; index += 4) {
            const luminance = Math.round(pixels.data[index] * 0.299 + pixels.data[index + 1] * 0.587 + pixels.data[index + 2] * 0.114);
            pixels.data[index] = luminance; pixels.data[index + 1] = luminance; pixels.data[index + 2] = luminance;
          }
          context.putImageData(pixels, 0, 0);
        }
      }
      setStatus("새 이미지 파일을 만드는 중");
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("이미지 생성에 실패했습니다.")), format, quality / 100));
      const extension = format === "image/jpeg" ? "jpg" : format === "image/png" ? "png" : "webp";
      const transformDetail = mode === "compress" ? `원본 ${formatBytes(file.size)} → 결과 ${formatBytes(blob.size)} · 품질 ${quality}%` : `${outputDimensions.width} × ${outputDimensions.height}px · ${formatLabel[format]}`;
      setOutput({ name: `${file.name.replace(/\.[^.]+$/, "")}-${mode}.${extension}`, blob, detail: transformDetail });
      setStatus("처리 완료. 결과 파일을 다운로드할 수 있습니다.");
    } catch (caught) { setStatus(""); setError(caught instanceof Error ? caught.message : "이미지 처리 중 오류가 발생했습니다."); }
    finally { setProcessing(false); }
  }

  return <ToolFrame index="02" tag="IMAGE ENGINE" title="이미지 변환·편집" description="JPG·PNG·WEBP를 실제로 변환하고, 용량·해상도·방향·색상과 여백을 기기 안에서 조절합니다.">
    <section className="tool-workbench file-tool-shell"><div className="mode-tabs file-mode-tabs" role="tablist" aria-label="이미지 도구 선택">
      <button role="tab" aria-selected={mode === "convert"} className={mode === "convert" ? "selected" : ""} onClick={() => selectMode("convert")}><RefreshCcw size={16} />포맷 변환</button>
      <button role="tab" aria-selected={mode === "compress"} className={mode === "compress" ? "selected" : ""} onClick={() => selectMode("compress")}><Minimize2 size={16} />용량 줄이기</button>
      <button role="tab" aria-selected={mode === "resize"} className={mode === "resize" ? "selected" : ""} onClick={() => selectMode("resize")}><Maximize2 size={16} />크기 조절</button>
      <button role="tab" aria-selected={mode === "rotate"} className={mode === "rotate" ? "selected" : ""} onClick={() => selectMode("rotate")}><RotateCw size={16} />회전</button>
      <button role="tab" aria-selected={mode === "flip"} className={mode === "flip" ? "selected" : ""} onClick={() => selectMode("flip")}><FlipHorizontal2 size={16} />반전</button>
      <button role="tab" aria-selected={mode === "grayscale"} className={mode === "grayscale" ? "selected" : ""} onClick={() => selectMode("grayscale")}><Contrast size={16} />흑백</button>
      <button role="tab" aria-selected={mode === "padding"} className={mode === "padding" ? "selected" : ""} onClick={() => selectMode("padding")}><Frame size={16} />여백</button>
    </div><p className="file-mode-description">{modeCopy[mode]}</p>
      <div className="image-converter-grid"><div className="conversion-panel"><FileDropZone accept="image/jpeg,image/png,image/webp" disabled={processing} onFiles={chooseFiles} label="이미지를 놓거나 선택하세요" detail={`JPG · PNG · WEBP · 파일당 최대 ${Math.round(FILE_LIMITS.image / 1024 / 1024)}MB`} /><SelectedFileList files={file ? [file] : []} onRemove={reset} />
        <div className="format-picker"><span>출력 포맷</span>{(["image/png", "image/jpeg", "image/webp"] as OutputType[]).map((item) => <button key={item} onClick={() => setFormat(item)} className={format === item ? "selected" : ""} disabled={processing}>{formatLabel[item]}</button>)}</div>
        {mode === "resize" && <div className="resize-grid"><label>가로<input type="number" min="1" value={width || ""} onChange={(event) => changeWidth(Number(event.target.value))} disabled={processing} /></label><span>×</span><label>세로<input type="number" min="1" value={height || ""} onChange={(event) => changeHeight(Number(event.target.value))} disabled={processing} /></label></div>}
        {mode === "rotate" && <label className="range-label">회전 각도<select value={rotation} onChange={(event) => setRotation(Number(event.target.value))} disabled={processing}><option value={90}>오른쪽 90°</option><option value={180}>180°</option><option value={270}>왼쪽 90°</option></select></label>}
        {mode === "flip" && <label className="range-label">반전 방향<select value={flipDirection} onChange={(event) => setFlipDirection(event.target.value as "horizontal" | "vertical")} disabled={processing}><option value="horizontal">좌우 반전</option><option value="vertical">상하 반전</option></select></label>}
        {mode === "padding" && <label className="range-label">여백 <b>{padding}px</b><input type="range" min="4" max="300" value={padding} onChange={(event) => setPadding(Number(event.target.value))} disabled={processing} /><small>이미지 네 방향에 동일한 흰색 여백을 추가합니다.</small></label>}
        {(mode === "compress" || format !== "image/png") && <label className="range-label">품질 <b>{quality}%</b><input type="range" min="30" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} disabled={processing} /><small>낮은 품질은 파일 용량을 줄이지만 이미지 선명도가 떨어질 수 있습니다.</small></label>}
        <div className="calculator-actions"><button className="primary-action" disabled={!file || processing} onClick={process}>{processing ? <LoaderCircle className="spin" size={18} /> : <RefreshCcw size={18} />}{processing ? "처리 중" : "처리 시작"}</button><button className="reset-action" onClick={reset} disabled={processing}>초기화</button></div>{status && <p className="status-message" role="status">{status}</p>}{error && <p className="status-message error" role="alert">{error}</p>}</div>
        <aside className="preview-panel">{preview ? <img src={preview} alt="선택한 이미지 미리보기" /> : <><ImageIcon size={44} aria-hidden="true" /><p>미리보기 영역</p></>}<div className="preview-meta">{file ? <><span>{original.width} × {original.height} PX</span><span>→</span><span>{outputDimensions.width} × {outputDimensions.height} PX</span></> : <span>FILE / PREVIEW</span>}</div></aside></div>
      {output && <section className="result-section"><div className="section-head"><p className="eyebrow">FILE READY</p><h2>처리 결과</h2></div><ul className="file-output-list"><li><div><b>{output.name}</b><small>{output.detail}</small></div><button onClick={() => downloadBlob(output.blob, output.name)}><Download size={16} />다운로드</button></li></ul></section>}<div className="process-strip"><span><Maximize2 size={16} />유지 비율 리사이즈</span><span><RefreshCcw size={16} />3개 포맷 상호 변환</span><span><Minimize2 size={16} />기기 내 실제 재인코딩</span></div></section>
    <LocalFileSecurityNotice /><FileToolKnowledge usage="포맷 변환, 용량 줄이기, 크기 조절 또는 편집 기능을 선택한 뒤 이미지를 추가하세요. 출력 형식·품질·편집 옵션을 정하고 처리 시작을 누르면 결과 다운로드 버튼이 표시됩니다." support="JPG, PNG, WebP 입력·출력을 지원합니다. 파일은 서버로 전송하지 않으며, 현재 브라우저 안에서만 새 이미지 파일을 만듭니다." />
  </ToolFrame>;
}
