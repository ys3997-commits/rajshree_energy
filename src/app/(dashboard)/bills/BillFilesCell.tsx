"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import type { BillFileRow } from "@/lib/actions/bills";

function fileHref(id: string): string {
  return `/api/bills/${id}/file`;
}

function isPdf(file: BillFileRow): boolean {
  return (
    file.fileMime === "application/pdf" ||
    file.fileName.toLowerCase().endsWith(".pdf")
  );
}

function isImage(file: BillFileRow): boolean {
  return file.fileMime.startsWith("image/");
}

function fileTypeLabel(file: BillFileRow): string {
  if (isPdf(file)) return "PDF";
  const fromMime: Record<string, string> = {
    "image/jpeg": "JPG",
    "image/png": "PNG",
    "image/webp": "WEBP",
    "image/gif": "GIF",
  };
  if (fromMime[file.fileMime]) return fromMime[file.fileMime];
  const ext = file.fileName.split(".").pop()?.toUpperCase();
  if (ext === "JPEG") return "JPG";
  if (ext) return ext;
  return "Image";
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4.2 1.5h5.1L13 5.3v8.2c0 .8-.6 1.5-1.4 1.5H4.2c-.8 0-1.4-.7-1.4-1.5V3c0-.8.6-1.5 1.4-1.5Zm4.6.6v3.4h3.3L8.8 2.1ZM5 8.2h1.1v4.1H5V8.2Zm2.2 0h1.7c.9 0 1.5.5 1.5 1.3 0 .8-.6 1.3-1.5 1.3H8.3v1.5H7.2V8.2Zm1.1 1v.7h.5c.3 0 .6-.1.6-.4 0-.2-.3-.3-.6-.3h-.5Z"
      />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3.2 2.5h9.6c.7 0 1.2.6 1.2 1.2v8.6c0 .7-.5 1.2-1.2 1.2H3.2c-.7 0-1.2-.5-1.2-1.2V3.7c0-.6.5-1.2 1.2-1.2Zm8.4 8.4-.1-.1-2-2.2-1.7 1.8-2.3-2.8-3 3.3h9.1ZM5.4 6.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"
      />
    </svg>
  );
}

function FileKindIcon({ file }: { file: BillFileRow }) {
  return isPdf(file) ? <PdfIcon /> : <ImageIcon />;
}

function FilePreview({ file }: { file: BillFileRow }) {
  const href = fileHref(file.id);
  if (isImage(file)) {
    return (
      <img
        src={href}
        alt={file.fileName}
        className="bill-file-preview-image"
      />
    );
  }
  if (isPdf(file)) {
    return (
      <iframe
        title={file.fileName}
        src={href}
        className="bill-file-preview-frame"
      />
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className="btn-link">
      Open {file.fileName}
    </a>
  );
}

export function BillFilesCell({ files }: { files: BillFileRow[] }) {
  const [open, setOpen] = useState(false);
  const file = files[0];

  if (!file) return "—";

  const label = fileTypeLabel(file);

  return (
    <>
      <button
        type="button"
        className="bill-files-chip"
        aria-haspopup="dialog"
        aria-label={`View ${label}`}
        onClick={() => setOpen(true)}
      >
        <span className="bill-files-chip-icons">
          <FileKindIcon file={file} />
        </span>
        {label}
      </button>
      <Modal
        open={open}
        title="Document"
        className="modal-panel-preview"
        onClose={() => setOpen(false)}
      >
        <div className="bill-file-preview">
          <div className="bill-file-preview-toolbar">
            <span className="bill-file-preview-name" title={file.fileName}>
              {file.fileName}
            </span>
            <a
              href={fileHref(file.id)}
              target="_blank"
              rel="noreferrer"
              className="btn-link"
            >
              Open
            </a>
          </div>
          <div className="bill-file-preview-stage">
            <FilePreview file={file} />
          </div>
        </div>
      </Modal>
    </>
  );
}
