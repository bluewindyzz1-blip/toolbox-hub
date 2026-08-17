import { describe, expect, it } from "vitest";
import { FILE_LIMITS, formatBytes, getExtension, sanitizeDownloadName, validateFiles } from "./file-utils";

const fakeFile = (name: string, size: number) => ({ name, size }) as File;

describe("파일 변환 보조 로직", () => {
  it("바이트 크기를 읽기 쉬운 단위로 표기한다", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1024 ** 2)).toBe("1.0 MB");
  });

  it("확장자를 소문자로 읽고 다운로드 파일명에서 위험한 문자를 제거한다", () => {
    expect(getExtension("REPORT.PDF")).toBe("pdf");
    expect(getExtension("no-extension")).toBe("");
    expect(sanitizeDownloadName('report:2026/01?.pdf')).toBe("report-2026-01-.pdf");
  });

  it("지원 형식·파일 크기·일괄 개수 제한을 검증한다", () => {
    const valid = validateFiles([fakeFile("sample.pdf", 1024)], { allowedExtensions: ["pdf"], maxFileBytes: FILE_LIMITS.pdf, maxFiles: 1, label: "파일" });
    const wrongType = validateFiles([fakeFile("sample.exe", 1024)], { allowedExtensions: ["pdf"], maxFileBytes: FILE_LIMITS.pdf, maxFiles: 1, label: "파일" });
    const oversized = validateFiles([fakeFile("large.pdf", FILE_LIMITS.pdf + 1)], { allowedExtensions: ["pdf"], maxFileBytes: FILE_LIMITS.pdf, maxFiles: 1, label: "파일" });
    const tooMany = validateFiles([fakeFile("one.pdf", 1), fakeFile("two.pdf", 1)], { allowedExtensions: ["pdf"], maxFileBytes: FILE_LIMITS.pdf, maxFiles: 1, label: "파일" });
    expect(valid.error).toBe("");
    expect(valid.valid).toHaveLength(1);
    expect(wrongType.error).toContain("지원하지 않는 파일 형식");
    expect(oversized.error).toContain("제한");
    expect(tooMany.error).toContain("최대 1개");
  });
});
