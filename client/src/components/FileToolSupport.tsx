import { ChangeEvent, DragEvent, ReactNode, useId, useState } from "react";
import { FileCheck2, FileUp, ShieldCheck, X } from "lucide-react";
import { formatBytes } from "@/lib/file-utils";
import { AdSlot } from "@/components/CatalogSupport";

export function FileDropZone({ accept, multiple = false, disabled = false, onFiles, label, detail }: { accept: string; multiple?: boolean; disabled?: boolean; onFiles: (files: File[]) => void; label: string; detail: string }) {
  const [dragging, setDragging] = useState(false);
  const inputId = useId();
  const pick = (event: ChangeEvent<HTMLInputElement>) => onFiles(Array.from(event.target.files ?? []));
  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) onFiles(Array.from(event.dataTransfer.files));
  };
  return <label htmlFor={inputId} className={`drop-area file-drop-zone ${dragging ? "dragging" : ""} ${disabled ? "disabled" : ""}`} onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
    <input id={inputId} type="file" accept={accept} multiple={multiple} disabled={disabled} onChange={pick} />
    <FileUp aria-hidden="true" size={28} />
    <strong>{label}</strong>
    <small>{detail}</small>
    <span className="drop-hint">클릭하거나 파일을 여기에 놓으세요</span>
  </label>;
}

export function SelectedFileList({ files, onRemove }: { files: File[]; onRemove?: (index: number) => void }) {
  if (!files.length) return null;
  return <ul className="selected-file-list" aria-label="선택한 파일 목록">{files.map((file, index) => <li key={`${file.name}-${file.lastModified}-${index}`}><FileCheck2 size={17} aria-hidden="true" /><span><b>{file.name}</b><small>{formatBytes(file.size)}</small></span>{onRemove && <button type="button" onClick={() => onRemove(index)} aria-label={`${file.name} 선택 해제`}><X size={16} /></button>}</li>)}</ul>;
}

export function LocalFileSecurityNotice() {
  return <aside className="file-security-note"><ShieldCheck size={26} aria-hidden="true" /><div><h2>파일 보안 안내</h2><p>이 도구는 선택한 파일을 현재 브라우저 메모리 안에서 처리합니다. 파일을 서버에 업로드하거나 저장하지 않으며, 새로고침·탭 닫기·초기화 시 작업 데이터와 미리보기 URL이 해제됩니다.</p></div></aside>;
}

export function FileToolKnowledge({ usage, support, children }: { usage: string; support: string; children?: ReactNode }) {
  return <section className="file-tool-knowledge">
    <AdSlot slot="AD_CONTENT" />
    <div className="knowledge-grid"><article><p className="eyebrow">HOW TO USE</p><h2>사용 방법</h2><p>{usage}</p></article><article><p className="eyebrow">SUPPORTED FORMAT</p><h2>지원 파일 형식</h2><p>{support}</p></article><article><p className="eyebrow">LOCAL PROCESSING</p><h2>처리 방식</h2><p>파일은 브라우저 안에서만 처리됩니다. 업로드 URL, 서버 저장본 또는 검색엔진에 노출되는 임시 파일을 만들지 않습니다.</p></article><article><p className="eyebrow">LIMITS</p><h2>주의사항</h2><p>대용량 파일과 복잡한 PDF는 기기 성능에 따라 시간이 걸릴 수 있습니다. 오류가 발생하면 페이지를 새로고침하고 파일 크기·형식을 다시 확인하세요.</p></article></div>
    {children}
    <section className="faq-section"><p className="eyebrow">FAQ</p><h2>자주 묻는 질문</h2><details><summary>파일이 외부 서버로 전송되나요?</summary><p>아니요. 현재 구현된 파일 도구는 브라우저 로컬 처리 방식이므로 파일 전송·영구 저장을 하지 않습니다.</p></details><details><summary>완료된 파일은 어디에 저장되나요?</summary><p>처리가 끝나면 사용자의 브라우저가 다운로드를 시작합니다. 작업 중 생성한 데이터는 탭을 닫거나 초기화하면 사라집니다.</p></details></section>
    <AdSlot slot="AD_RELATED" />
  </section>;
}
