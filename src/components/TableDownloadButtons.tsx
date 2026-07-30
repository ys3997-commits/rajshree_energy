"use client";

import { useState } from "react";
import {
  buildCsv,
  downloadTablePdf,
  downloadTextFile,
  type ExportColumn,
  type ExportRow,
} from "@/lib/export/tableDownload";

type Props = {
  title: string;
  filenameBase: string;
  columns: ExportColumn[];
  rows: ExportRow[];
};

export function TableDownloadButtons({
  title,
  filenameBase,
  columns,
  rows,
}: Props) {
  const [busy, setBusy] = useState<"csv" | "pdf" | null>(null);
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
    </div>
  );
}
