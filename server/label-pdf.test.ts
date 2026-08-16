import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { mergeLabelPdfs } from "./label-pdf";

async function createPdf(pageCount: number) {
  const document = await PDFDocument.create();
  for (let index = 0; index < pageCount; index += 1) {
    document.addPage([595, 842]);
  }
  return document.save();
}

describe("mergeLabelPdfs", () => {
  it("consolida todas as páginas das etiquetas em um único PDF", async () => {
    const firstLabel = await createPdf(1);
    const secondLabel = await createPdf(2);

    const merged = await mergeLabelPdfs([firstLabel, secondLabel]);
    const mergedDocument = await PDFDocument.load(merged);

    expect(mergedDocument.getPageCount()).toBe(3);
    expect(new TextDecoder().decode(merged.slice(0, 4))).toBe("%PDF");
  });

  it("rejeita um lote sem etiquetas", async () => {
    await expect(mergeLabelPdfs([])).rejects.toThrow("Nenhuma etiqueta PDF disponível");
  });

  it("rejeita uma etiqueta vazia ou inválida", async () => {
    await expect(mergeLabelPdfs([new Uint8Array()])).rejects.toThrow("está vazia");
    await expect(mergeLabelPdfs([new TextEncoder().encode("not-a-pdf")])).rejects.toThrow();
  });
});
