"use client";

import { FormEvent, useState, useTransition } from "react";
import {
  createQualityClass,
  deleteQualityClass,
  updateQualityClass,
} from "@/lib/actions/qualities";
import { Modal } from "@/components/Modal";
import { formatQualityClass } from "@/lib/domain/format";

type Opt = { id: string; name: string };
type ClassRow = {
  id: string;
  originId: string;
  domestic: boolean;
  qualityOptionId: string;
  origin: Opt;
  qualityOption: Opt;
};

export function QualitiesClient({
  classes,
  origins,
  qualities,
}: {
  classes: ClassRow[];
  origins: Opt[];
  qualities: Opt[];
}) {
  const sortedClasses = [...classes].sort((a, b) =>
    formatQualityClass(a).localeCompare(formatQualityClass(b)),
  );
  const [rows, setRows] = useState(sortedClasses);
  const [originId, setOriginId] = useState("");
  const [domestic, setDomestic] = useState(false);
  const [qualityOptionId, setQualityOptionId] = useState("");
  const [editing, setEditing] = useState<ClassRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reload() {
    startTransition(() => window.location.reload());
  }

  async function onSubmitClass(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const payload = { originId, domestic, qualityOptionId };
      if (editing) await updateQualityClass(editing.id, payload);
      else await createQualityClass(payload);
      setOriginId("");
      setDomestic(false);
      setQualityOptionId("");
      setEditing(null);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this quality class?")) return;
    try {
      await deleteQualityClass(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <h1 className="page-title">Quality classes</h1>
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

      <form onSubmit={onSubmitClass} className="mb-8 form-grid">
        <div
          className="option-cards"
          role="radiogroup"
          aria-label="Domestic or imported"
          style={{ gridColumn: "1 / -1", marginBottom: 0 }}
        >
          <button
            type="button"
            role="radio"
            aria-checked={!domestic}
            className={`option-card${!domestic ? " option-card-selected" : ""}`}
            onClick={() => setDomestic(false)}
          >
            <span className="option-card-title">Imported</span>
            <span className="option-card-desc">
              Coal sourced from outside India
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={domestic}
            className={`option-card${domestic ? " option-card-selected" : ""}`}
            onClick={() => setDomestic(true)}
          >
            <span className="option-card-title">Domestic</span>
            <span className="option-card-desc">
              Coal sourced within India
            </span>
          </button>
        </div>

        <label>Origin</label>
        <select
          required
          value={originId}
          onChange={(e) => setOriginId(e.target.value)}
        >
          <option value="">Select</option>
          {origins.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>

        <label>Quality</label>
        <select
          required
          value={qualityOptionId}
          onChange={(e) => setQualityOptionId(e.target.value)}
        >
          <option value="">Select</option>
          {qualities.map((q) => (
            <option key={q.id} value={q.id}>
              {q.name}
            </option>
          ))}
        </select>
        <div />
        <div className="flex gap-2">
          <button type="submit" className="btn" disabled={pending}>
            {editing ? "Update class" : "Add class"}
          </button>
          {editing && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditing(null);
                setOriginId("");
                setDomestic(false);
                setQualityOptionId("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-wrap">
        <div className="table-h-scroll"><table className="data">
          <thead>
            <tr>
              <th>Type</th>
              <th>Origin</th>
              <th>Quality</th>
              <th>Label</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.domestic ? "Domestic" : "Imported"}</td>
                <td>{row.origin.name}</td>
                <td>{row.qualityOption.name}</td>
                <td>{formatQualityClass(row)}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(row);
                      setOriginId(row.originId);
                      setDomestic(row.domestic);
                      setQualityOptionId(row.qualityOptionId);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => onDelete(row.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5}>No quality classes yet.</td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
