import { mkdir, writeFile } from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const outputDir = new URL("../client/public/test-files/", import.meta.url);
await mkdir(outputDir, { recursive: true });

async function createPdf(name, lines) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (const line of lines) {
    const page = pdf.addPage([360, 240]);
    page.drawText(line, { x: 36, y: 160, size: 22, font, color: rgb(0.05, 0.05, 0.05) });
  }
  await writeFile(new URL(name, outputDir), await pdf.save());
}

await createPdf("fixture-one.pdf", ["Fixture PDF A · Page 1", "Fixture PDF A · Page 2"]);
await createPdf("fixture-two.pdf", ["Fixture PDF B · Page 1"]);
await writeFile(new URL("fixture.csv", outputDir), "name,score\nKim,95\nLee,88\n", "utf8");
await writeFile(new URL("fixture.json", outputDir), JSON.stringify([{ name: "Kim", score: 95 }, { name: "Lee", score: 88 }], null, 2), "utf8");
await writeFile(new URL("fixture.txt", outputDir), "도구상자 테스트 텍스트\n두 번째 줄입니다.", "utf8");
