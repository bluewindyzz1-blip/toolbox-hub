export const FILE_LIMITS = {
  image: 20 * 1024 * 1024,
  pdf: 40 * 1024 * 1024,
  document: 10 * 1024 * 1024,
  maxBatch: 20,
} as const;

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = sanitizeDownloadName(filename);
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function getExtension(name: string) {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

export function sanitizeDownloadName(name: string) {
  const safe = name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").replace(/\s+/g, " ").trim();
  return safe || "toolbox-download";
}

export function validateFiles(files: File[], options: { allowedExtensions: string[]; maxFileBytes: number; maxFiles?: number; label: string }) {
  const { allowedExtensions, maxFileBytes, maxFiles = FILE_LIMITS.maxBatch, label } = options;
  if (!files.length) return { valid: [], error: `${label}을(를) 선택하세요.` };
  if (files.length > maxFiles) return { valid: [], error: `한 번에 최대 ${maxFiles}개 파일만 처리할 수 있습니다.` };
  const invalidType = files.find((file) => !allowedExtensions.includes(getExtension(file.name)));
  if (invalidType) return { valid: [], error: `${invalidType.name}은(는) 지원하지 않는 파일 형식입니다. 지원 형식: ${allowedExtensions.map((item) => item.toUpperCase()).join(", ")}` };
  const oversized = files.find((file) => file.size > maxFileBytes);
  if (oversized) return { valid: [], error: `${oversized.name}의 크기가 제한(${formatBytes(maxFileBytes)})을 초과했습니다.` };
  return { valid: files, error: "" };
}

export async function assertPdfFile(file: File) {
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const signature = new TextDecoder().decode(header);
  if (signature !== "%PDF-") throw new Error("정상적인 PDF 파일을 읽을 수 없습니다. 파일이 손상되었거나 PDF가 아닐 수 있습니다.");
}

export function readImage(source: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(source);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 읽을 수 없습니다. 파일이 손상되었거나 지원하지 않는 이미지일 수 있습니다."));
    };
    image.src = url;
  });
}
