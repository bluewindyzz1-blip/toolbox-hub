import { describe, expect, it } from "vitest";
import { transform } from "../client/src/pages/TextTransformTool";

describe("텍스트·웹 변환기", () => {
  it("JSON을 정리하고 압축한다", () => {
    expect(transform("json-pretty", '{"name":"도구상자","tools":20}')).toContain('\n  "name": "도구상자"');
    expect(transform("json-minify", '{\n  "name": "도구상자"\n}')).toBe('{"name":"도구상자"}');
    expect(() => transform("json-pretty", "{invalid}")).toThrow();
  });

  it("CSV·TSV·Markdown 표를 상호 변환한다", () => {
    expect(transform("csv-to-tsv", "이름,점수\n민수,90")).toBe("이름\t점수\n민수\t90");
    expect(transform("tsv-to-csv", "이름\t점수\n민수\t90")).toBe("이름,점수\n민수,90");
    expect(transform("csv-to-markdown", "이름,점수\n민수,90")).toContain("| 이름 | 점수 |");
    expect(transform("json-to-markdown", '[{"이름":"민수","점수":90}]')).toContain("| 민수 | 90 |");
  });

  it("URL·Base64·줄바꿈을 변환한다", () => {
    const encoded = transform("url-encode", "도구상자 변환");
    expect(transform("url-decode", encoded)).toBe("도구상자 변환");
    const base64 = transform("base64-encode", "도구상자");
    expect(transform("base64-decode", base64)).toBe("도구상자");
    expect(transform("normalize-lines", "첫\r\n둘\r셋")).toBe("첫\n둘\n셋");
    expect(transform("unique-lines", "사과\n바나나\n사과\n포도")).toBe("사과\n바나나\n포도");
  });

  it("Unix 시간과 색상 코드를 변환한다", () => {
    expect(transform("timestamp-to-date", "0")).toContain("Unix 초: 0");
    expect(transform("date-to-timestamp", "1970-01-01T00:00:00Z")).toContain("Unix 밀리초: 0");
    expect(transform("hex-to-rgb", "#ef2920")).toContain("rgb(239, 41, 32)");
    expect(transform("rgb-to-hex", "239, 41, 32")).toBe("#EF2920");
  });
});
