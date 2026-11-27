"use client";

import { useState } from "react";
import type {
  ExportColumn,
  ExportRow,
  ExportTable,
} from "@/lib/export/tableDownload";

type Props = {
  title: string;
  filenameBase: string;
  columns: ExportColumn[];
  rows: ExportRow[];
  /** Further tables written below the first, in the same PDF and Excel file. */
  extraTables?: ExportTable[];
  /** Show WhatsApp button to share the PDF (Sales Engine, etc.). */
  whatsapp?: boolean;
};

export function TableDownloadButtons({
  title,
  filenameBase,
  columns,
  rows,
  extraTables,
  whatsapp = false,
}: Props) {
  const [busy, setBusy] = useState<"sheet" | "pdf" | "whatsapp" | null>(null);
  const disabled = rows.length === 0 || busy != null;

  async function downloadSheet() {
    setBusy("sheet");
    try {
      const { buildExcelWorkbook, downloadExcelWorkbook } = await import(
        "@/lib/export/excelWorkbook"
      );
      downloadExcelWorkbook(
        buildExcelWorkbook(columns, rows, title, extraTables),
        `${filenameBase}.xlsx`,
      );
    } finally {
      setBusy(null);
    }
  }

  async function downloadPdf() {
    setBusy("pdf");
    try {
      const { downloadTablePdf } = await import("@/lib/export/tableDownload");
      await downloadTablePdf({
        title,
        filename: `${filenameBase}.pdf`,
        columns,
        rows,
        extraTables,
      });
    } finally {
      setBusy(null);
    }
  }

  async function shareWhatsApp() {
    setBusy("whatsapp");
    try {
      const { shareTablePdfViaWhatsApp } = await import(
        "@/lib/export/tableDownload"
      );
      await shareTablePdfViaWhatsApp({
        title,
        filename: `${filenameBase}.pdf`,
        columns,
        rows,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error(err);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        className="btn btn-secondary"
        disabled={disabled}
        onClick={() => void downloadSheet()}
      >
        {busy === "sheet" ? "Downloading…" : "Download Excel"}
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={disabled}
        onClick={() => void downloadPdf()}
      >
        {busy === "pdf" ? "Downloading…" : "Download PDF"}
      </button>
      {whatsapp ? (
        <button
          type="button"
          className="btn btn-secondary"
          disabled={disabled}
          onClick={() => void shareWhatsApp()}
        >
          {busy === "whatsapp" ? "Opening…" : "WhatsApp"}
        </button>
      ) : null}
    </div>
  );
}
