import { PDFDocument } from "pdf-lib";

/**
 * Aceita um ou mais PDFs de etiqueta e devolve um único PDF consolidado.
 * Cada página do documento de origem é copiada para preservar etiquetas
 * que tenham mais de uma página ou um formato diferente do restante lote.
 */
export async function mergeLabelPdfs(pdfBuffers: Uint8Array[]): Promise<Uint8Array> {
  if (pdfBuffers.length === 0) {
    throw new Error("Nenhuma etiqueta PDF disponível para consolidar.");
  }

  const mergedPdf = await PDFDocument.create();

  for (let index = 0; index < pdfBuffers.length; index += 1) {
    const pdfBuffer = pdfBuffers[index];
    if (pdfBuffer.byteLength === 0) {
      throw new Error(`A etiqueta ${index + 1} está vazia.`);
    }

    // O carregamento valida a estrutura do PDF antes de copiar as páginas,
    // evitando que um conteúdo inválido seja misturado no arquivo final.
    const sourcePdf = await PDFDocument.load(pdfBuffer);
    const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
}
