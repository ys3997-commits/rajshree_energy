export type ExportColumn = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  /** Visual separator column (e.g. ledger dispatch | funds). */
  divider?: boolean;
};

export type ExportRow = Record<string, string>;

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(columns: ExportColumn[], rows: ExportRow[]): string {
  const header = columns
    .map((c) => escapeCsvCell(c.header.replace(/\n/g, " ").replace(/,/g, " ")))
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

  doc.setFontSize(14);
  doc.text(options.title, 40, 36);

  autoTable(doc, {
    startY: 50,
    head: [
      options.columns.map((c) => {
        const cleaned = c.header.replace(/,/g, " ");
        return cleaned.includes("\n") ? cleaned.split("\n") : cleaned;
      }),
    ],
    body: options.rows.map((row) =>
      options.columns.map((c) => row[c.key] ?? ""),
    ),
    styles: {
      fontSize: 7,
      cellPadding: 3,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [40, 40, 40],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 7,
      valign: "middle",
      overflow: "linebreak",
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
          { halign: c.align === "right" ? "right" : "left" },
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
    margin: { left: 28, right: 28 },
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
