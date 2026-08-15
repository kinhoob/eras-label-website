/**
 * Utilitário seguro para exportação de dados tabulares para CSV no painel administrativo da Eras Label.
 * Trata o escaping de aspas e formata valores textuais e numéricos de acordo com o padrão RFC 4180.
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  try {
    const csvRows = [
      headers.join(","),
      ...rows.map(row =>
        row.map(cell => {
          const stringValue = String(cell ?? "");
          // Escapar aspas duplas e envolver em aspas se contiver vírgula, quebra de linha ou aspas
          if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(",")
      ),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error("Erro ao exportar CSV:", error);
    return false;
  }
}
