"use client";

import { FormEvent, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import {
  createMemberDocument,
  deleteMemberDocument,
  updateMemberDocument,
  type MemberDocumentRow,
} from "@/lib/actions/member-documents";
import { MAX_MEMBER_DOCUMENT_BYTES } from "@/lib/domain/bills";
import {
  DOCUMENT_EXPIRY_STATUS_LABEL,
  ddMmYyyyFromExpiryIso,
  documentExpiryStatus,
  maskExpiryDateInput,
  todayIsoInIst,
} from "@/lib/domain/documentExpiry";
import { formatDateDdMmYyyy } from "@/lib/domain/format";
import { openWhatsAppMessage } from "@/lib/domain/whatsappWeb";

type Choice = { id: string; name: string };

function fileHref(id: string, download = false) {
  return `/api/member-documents/${id}/file${download ? "?download=1" : ""}`;
}

function isPdf(row: MemberDocumentRow) {
  return (
    row.fileMime === "application/pdf" ||
    row.fileName.toLowerCase().endsWith(".pdf")
  );
}

function isImage(row: MemberDocumentRow) {
  return row.fileMime.startsWith("image/");
}

export function MemberDocumentPanel({
  memberId,
  documents,
  rows,
  canDelete,
}: {
  memberId: string;
  documents: Choice[];
  rows: MemberDocumentRow[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [documentEntryId, setDocumentEntryId] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<MemberDocumentRow | null>(null);
  const [pending, startTransition] = useTransition();
  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) =>
        a.documentName.localeCompare(b.documentName, "en", {
          sensitivity: "base",
        }),
      ),
    [rows],
  );

  function resetForm() {
    setEditingId(null);
    setCurrentFileName("");
    setDocumentEntryId("");
    setExpiryDate("");
    setRemarks("");
    setFile(null);
    setFileKey((key) => key + 1);
  }

  function startEdit(row: MemberDocumentRow) {
    setError(null);
    setEditingId(row.id);
    setCurrentFileName(row.fileName);
    setDocumentEntryId(row.documentEntryId);
    setExpiryDate(ddMmYyyyFromExpiryIso(row.expiryDate));
    setRemarks(row.remarks);
    setFile(null);
    setFileKey((key) => key + 1);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!documentEntryId) {
      setError("Select a document");
      return;
    }
    if (!editingId && !file) {
      setError("Upload a document");
      return;
    }
    if (file && file.size > MAX_MEMBER_DOCUMENT_BYTES) {
      setError("File must be 15 MB or smaller");
      return;
    }
    const body = new FormData();
    body.set("documentEntryId", documentEntryId);
    body.set("expiryDate", expiryDate);
    body.set("remarks", remarks);
    if (file) body.set("file", file);
    startTransition(async () => {
      try {
        if (editingId) {
          body.set("id", editingId);
          await updateMemberDocument(body);
        } else {
          body.set("memberId", memberId);
          await createMemberDocument(body);
        }
        resetForm();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onDelete(row: MemberDocumentRow) {
    if (!confirm(`Delete "${row.documentName}"?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteMemberDocument(row.id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  async function onWhatsApp(row: MemberDocumentRow) {
    setError(null);
    try {
      const response = await fetch(fileHref(row.id));
      if (!response.ok) throw new Error("Could not open this document");
      const blob = await response.blob();
      const shared = new File([blob], row.fileName, {
        type: row.fileMime || blob.type,
      });
      const expiryLabel = row.expiryDate
        ? `Expiry ${formatDateDdMmYyyy(row.expiryDate)} (${DOCUMENT_EXPIRY_STATUS_LABEL[documentExpiryStatus(row.expiryDate)]})`
        : "";
      const text = [row.documentName, expiryLabel, row.remarks.trim()]
        .filter(Boolean)
        .join("\n");
      if (navigator.canShare?.({ files: [shared] })) {
        await navigator.share({
          files: [shared],
          title: row.documentName,
          text,
        });
        return;
      }
      const encoded = encodeURIComponent(text || row.documentName);
      const opened = openWhatsAppMessage({
        app: `whatsapp://send?text=${encoded}`,
        web: `https://web.whatsapp.com/send?text=${encoded}`,
      });
      if (!opened) {
        setError("Open WhatsApp first, then attach the document.");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "WhatsApp failed");
    }
  }

  return (
    <div className="member-documents">
      <Modal
        open={error !== null}
        title="Message"
        onClose={() => setError(null)}
      >
        <p className="mb-4">{error}</p>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={() => setError(null)}>
            OK
          </button>
        </div>
      </Modal>

      <section className="options-card member-document-card">
        <h2 className="options-card-title">{editingId ? "Edit" : "Upload"}</h2>
        <form className="member-document-form" onSubmit={onSubmit}>
          <div className="member-document-row">
            <label>
              Documents
              <select
                required
                className="field-input"
                value={documentEntryId}
                onChange={(e) => setDocumentEntryId(e.target.value)}
                disabled={pending || documents.length === 0}
              >
                <option value="">Select document</option>
                {documents.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Upload document
              <div className="bill-file-field">
                <input
                  key={fileKey}
                  ref={fileRef}
                  className="bill-file-input-hidden"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp,image/gif,.pdf,.jpg,.jpeg,.png,.webp,.gif"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  disabled={pending}
                />
                <button
                  type="button"
                  className={`field-input bill-file-trigger${file ? " has-file" : ""}`}
                  onClick={() => fileRef.current?.click()}
                  disabled={pending}
                >
                  {file?.name ??
                    (editingId ? currentFileName || "Keep current file" : "Choose file")}
                </button>
              </div>
            </label>
          </div>
          <div className="member-document-row">
            <label>
              Expiry Date
              <input
                className="field-input"
                inputMode="numeric"
                placeholder="dd/mm/yyyy"
                maxLength={10}
                value={expiryDate}
                onChange={(e) => setExpiryDate(maskExpiryDateInput(e.target.value))}
                disabled={pending}
              />
            </label>
            <label className="member-document-remarks">
              Remarks
              <input
                className="field-input"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                disabled={pending}
              />
            </label>
          </div>
          <div className="member-document-submit">
            <button type="submit" className="btn" disabled={pending}>
              {editingId ? "Update" : "Upload"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
                disabled={pending}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="options-card member-document-card">
        <h2 className="options-card-title">Documents</h2>
        <div className="table-wrap">
          <div className="table-h-scroll">
            <table className="data member-document-table">
              <thead>
                <tr>
                  <th>Document name</th>
                  <th>Expiry Date</th>
                  <th>Remarks</th>
                  <th>Preview</th>
                  <th>Download</th>
                  <th>WhatsApp</th>
                  {canDelete ? <th>Edit</th> : null}
                  {canDelete ? <th>Delete</th> : null}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.documentName}</td>
                    <td>
                      <ExpiryCell expiryDate={row.expiryDate} />
                    </td>
                    <td className={row.remarks ? undefined : "cell-muted"}>
                      {row.remarks || "—"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setPreview(row)}
                      >
                        Preview
                      </button>
                    </td>
                    <td>
                      <a
                        className="btn btn-secondary btn-sm"
                        href={fileHref(row.id, true)}
                      >
                        Download
                      </a>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-whatsapp-icon"
                        aria-label={`WhatsApp ${row.documentName}`}
                        title="Send on WhatsApp"
                        onClick={() => void onWhatsApp(row)}
                        disabled={pending}
                      >
                        <WhatsAppIcon />
                      </button>
                    </td>
                    {canDelete ? (
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => startEdit(row)}
                          disabled={pending}
                        >
                          Edit
                        </button>
                      </td>
                    ) : null}
                    {canDelete ? (
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => onDelete(row)}
                          disabled={pending}
                        >
                          Delete
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={canDelete ? 8 : 6} className="options-empty">
                      No documents uploaded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Modal
        open={preview !== null}
        title={preview?.documentName ?? "Preview"}
        className="modal-panel-preview"
        onClose={() => setPreview(null)}
      >
        {preview ? (
          <div className="bill-file-preview">
            <div className="bill-file-preview-stage">
              {isImage(preview) ? (
                <img
                  src={fileHref(preview.id)}
                  alt={preview.fileName}
                  className="bill-file-preview-image"
                />
              ) : isPdf(preview) ? (
                <iframe
                  title={preview.fileName}
                  src={fileHref(preview.id)}
                  className="bill-file-preview-frame"
                />
              ) : (
                <a href={fileHref(preview.id)} target="_blank" rel="noreferrer">
                  Open {preview.fileName}
                </a>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function ExpiryCell({ expiryDate }: { expiryDate: string | null }) {
  if (!expiryDate) return <span className="cell-muted">—</span>;
  const status = documentExpiryStatus(expiryDate, todayIsoInIst());
  return (
    <div className="doc-expiry">
      <span>{formatDateDdMmYyyy(expiryDate)}</span>
      <span className={`doc-expiry-status doc-expiry-${status}`}>
        {DOCUMENT_EXPIRY_STATUS_LABEL[status]}
      </span>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}
