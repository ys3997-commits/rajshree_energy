export type ExportColumn = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  /** Visual separator column (e.g. ledger dispatch | funds). */
  divider?: boolean;
};

export type ExportRow = Record<string, string>;

/** Keep short all-caps tokens intact when converting headers to title case. */
const HEADER_ACRONYMS = new Set([
  "PO",
  "GST",
  "TCS",
  "MT",
  "PMT",
  "DN",
  "FOR",
  "ID",
  "HSN",
  "CSV",
  "PDF",
]);

function toTitleCaseWord(word: string): string {
  const match = word.match(/^([^A-Za-z]*)([A-Za-z]+)([^A-Za-z]*)$/);
  if (!match) return word;
  const [, lead, letters, trail] = match;
  if (HEADER_ACRONYMS.has(letters.toUpperCase())) {
    return `${lead}${letters.toUpperCase()}${trail}`;
  }
  const core =
    letters.charAt(0).toUpperCase() + letters.slice(1).toLowerCase();
  return `${lead}${core}${trail}`;
}

/** Title case for a full header phrase. Commas are dropped; newlines are spaces. */
export function toTitleCaseHeader(header: string): string {
  const words = header
    .replace(/,/g, " ")
    .replace(/\n/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "";
  return words.map(toTitleCaseWord).join(" ");
}

/** Title-case a header and keep wrap points, with no commas. */
export function exportWrappedHeader(header: string): string {
  const lines = header
    .replace(/,/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return "";
  const words = toTitleCaseHeader(header).split(" ");
  const wrapped: string[] = [];
  let index = 0;
  for (const line of lines) {
    const count = line.split(/\s+/).filter(Boolean).length;
    wrapped.push(words.slice(index, index + count).join(" "));
    index += count;
  }
  if (index < words.length) {
    wrapped.push(words.slice(index).join(" "));
  }
  return wrapped.join("\n");
}

/** Keep original wrap points after title-casing, e.g. "Trucks\\nDispatch". */
export function exportPdfHeader(header: string): string | string[] {
  const wrapped = exportWrappedHeader(header);
  return wrapped.includes("\n") ? wrapped.split("\n") : wrapped;
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(columns: ExportColumn[], rows: ExportRow[]): string {
  const header = columns
    .map((c) => escapeCsvCell(exportWrappedHeader(c.header)))
    .join(",");
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

export async function buildTablePdfBlob(options: {
  title: string;
  columns: ExportColumn[];
  rows: ExportRow[];
}): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const dataColumnCount = options.columns.filter((c) => !c.divider).length;
  const manyColumns = dataColumnCount > 12;
  const marginX = manyColumns ? 8 : 16;
  const horizontalPad = manyColumns ? 2 : 5;
  const fontSize = manyColumns ? 6.5 : 8;

  doc.setFontSize(14);
  doc.text(options.title, marginX, 28);

  autoTable(doc, {
    startY: 38,
    theme: "grid",
    tableWidth: pageWidth - marginX * 2,
    horizontalPageBreak: false,
    head: [
      options.columns.map((c) => exportPdfHeader(c.header)),
    ],
    body: options.rows.map((row) =>
      options.columns.map((c) => row[c.key] ?? ""),
    ),
    styles: {
      fontSize,
      cellPadding: {
        top: manyColumns ? 2.5 : 4,
        bottom: manyColumns ? 2.5 : 4,
        left: horizontalPad,
        right: horizontalPad,
      },
      overflow: "linebreak",
      valign: "middle",
      lineColor: [170, 170, 170],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [40, 40, 40],
      textColor: 255,
      fontStyle: "bold",
      fontSize,
      valign: "middle",
      overflow: "linebreak",
      cellPadding: {
        top: manyColumns ? 3.5 : 6,
        bottom: manyColumns ? 3.5 : 6,
        left: horizontalPad,
        right: horizontalPad,
      },
    },
    columnStyles: Object.fromEntries(
      options.columns.map((c, i) => {
        if (c.divider) {
          return [
            i,
            {
              halign: "center" as const,
              cellWidth: 36,
              cellPadding: { top: 2, bottom: 2, left: 14, right: 14 },
            },
          ];
        }
        return [
          i,
          {
            halign:
              c.align === "right"
                ? "right"
                : c.align === "center"
                  ? "center"
                  : "left",
            cellPadding: {
              top: manyColumns ? 2.5 : 4,
              bottom: manyColumns ? 2.5 : 4,
              left: horizontalPad,
              right: horizontalPad,
            },
          },
        ];
      }),
    ),
    didParseCell: (data) => {
      const col = options.columns[data.column.index];
      const prev = options.columns[data.column.index - 1];
      const next = options.columns[data.column.index + 1];

      if (col?.divider) {
        data.cell.text = [""];
        data.cell.styles.lineWidth = 0;
        return;
      }

      if (col?.align === "right") {
        data.cell.styles.halign = "right";
      } else if (col?.align === "center") {
        data.cell.styles.halign = "center";
      }

      // Keep a single divider line: drop the shared edge next to the spacer.
      if (next?.divider) {
        const lw = data.cell.styles.lineWidth;
        if (typeof lw === "object" && lw != null) {
          data.cell.styles.lineWidth = { ...lw, right: 0 };
        } else {
          const base = typeof lw === "number" ? lw : 0.1;
          data.cell.styles.lineWidth = {
            top: base,
            bottom: base,
            left: base,
            right: 0,
          };
        }
      }
      if (prev?.divider) {
        const lw = data.cell.styles.lineWidth;
        if (typeof lw === "object" && lw != null) {
          data.cell.styles.lineWidth = { ...lw, left: 0 };
        } else {
          const base = typeof lw === "number" ? lw : 0.1;
          data.cell.styles.lineWidth = {
            top: base,
            bottom: base,
            left: 0,
            right: base,
          };
        }
      }
    },
    didDrawCell: (data) => {
      const col = options.columns[data.column.index];
      if (!col?.divider) return;
      const x = data.cell.x + data.cell.width / 2;
      const y1 = data.cell.y;
      const y2 = data.cell.y + data.cell.height;
      data.doc.setDrawColor(40, 40, 40);
      data.doc.setLineWidth(2);
      data.doc.line(x, y1, x, y2);
    },
    margin: { left: marginX, right: marginX },
  });

  return doc.output("blob");
}

export async function downloadTablePdf(options: {
  title: string;
  filename: string;
  columns: ExportColumn[];
  rows: ExportRow[];
}) {
  const blob = await buildTablePdfBlob(options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = options.filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Share PDF via WhatsApp (Web Share when available; else download + open WhatsApp Web). */
export async function shareTablePdfViaWhatsApp(options: {
  title: string;
  filename: string;
  columns: ExportColumn[];
  rows: ExportRow[];
}): Promise<"shared" | "whatsapp-web"> {
  const blob = await buildTablePdfBlob(options);
  const file = new File([blob], options.filename, {
    type: "application/pdf",
  });
  const message = `${options.title}\n\nPlease find the PDF report attached.`;

  const shareData: ShareData = {
    files: [file],
    title: options.title,
    text: message,
  };

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    (!navigator.canShare || navigator.canShare(shareData))
  ) {
    try {
      await navigator.share(shareData);
      return "shared";
    } catch (err) {
      // User cancelled share sheet — do not fall through to download.
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
    }
  }

  // Desktop / unsupported: download the PDF, then open WhatsApp Web.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = options.filename;
  a.click();
  URL.revokeObjectURL(url);

  const waUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(waUrl, "_blank", "noopener,noreferrer");
  return "whatsapp-web";
}
