"use client";

import { useState } from "react";
import {
  buildCsv,
  downloadTablePdf,
  downloadTextFile,
  shareTablePdfViaWhatsApp,
  type ExportColumn,
  type ExportRow,
} from "@/lib/export/tableDownload";

type Props = {
  title: string;
  filenameBase: string;
  columns: ExportColumn[];
  rows: ExportRow[];
  /** Show WhatsApp button to share the PDF (Sales Engine, etc.). */
  whatsapp?: boolean;
};

export function TableDownloadButtons({
  title,
  filenameBase,
  columns,
  rows,
  whatsapp = false,
}: Props) {
  const [busy, setBusy] = useState<"csv" | "pdf" | "whatsapp" | null>(null);
  const disabled = rows.length === 0 || busy != null;

  function downloadCsv() {
    setBusy("csv");
    try {
      const csv = buildCsv(columns, rows);
      downloadTextFile(
        `\uFEFF${csv}`,
        `${filenameBase}.csv`,
        "text/csv;charset=utf-8",
      );
    } finally {
      setBusy(null);
    }
  }

  async function downloadPdf() {
    setBusy("pdf");
    try {
      await downloadTablePdf({
        title,
        filename: `${filenameBase}.pdf`,
        columns,
        rows,
      });
    } finally {
      setBusy(null);
    }
  }

  async function shareWhatsApp() {
    setBusy("whatsapp");
    try {
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
        onClick={downloadCsv}
      >
        {busy === "csv" ? "Downloading…" : "Download CSV"}
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
