export type ExportColumn = {
  key: string;
  header: string;
  align?: "left" | "right";
};

export type ExportRow = Record<string, string>;

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(columns: ExportColumn[], rows: ExportRow[]): string {
  const header = columns.map((c) => escapeCsvCell(c.header)).join(",");
  const body = rows.map((row) =>
    columns.map((c) => escapeCsvCell(row[c.key] ?? "")).join(","),
  );
  return [header, ...body].join("\n");
}

export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadTablePdf(options: {
  title: string;
  filename: string;
  columns: ExportColumn[];
  rows: ExportRow[];
}) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  doc.setFontSize(14);
  doc.text(options.title, 40, 36);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Rows: ${options.rows.length}`, 40, 52);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 64,
    head: [options.columns.map((c) => c.header)],
    body: options.rows.map((row) =>
      options.columns.map((c) => row[c.key] ?? ""),
    ),
    styles: {
      fontSize: 7,
      cellPadding: 3,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [40, 40, 40],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 7,
    },
    columnStyles: Object.fromEntries(
      options.columns.map((c, i) => [
        i,
        { halign: c.align === "right" ? "right" : "left" },
      ]),
    ),
    margin: { left: 28, right: 28 },
  });

  doc.save(options.filename);
}
