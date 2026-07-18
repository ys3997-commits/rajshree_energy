"use client";

import { FormEvent, useState, useTransition } from "react";
import {
  createOriginOption,
  createQualityClass,
  createQualityOption,
  deleteOriginOption,
  deleteQualityClass,
  deleteQualityOption,
  updateOriginOption,
  updateQualityClass,
  updateQualityOption,
} from "@/lib/actions/qualities";
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
  origins: initialOrigins,
  qualities: initialQualities,
}: {
  classes: ClassRow[];
  origins: Opt[];
  qualities: Opt[];
}) {
  const [rows, setRows] = useState(classes);
  const [origins, setOrigins] = useState(initialOrigins);
  const [qualities, setQualities] = useState(initialQualities);
  const [originId, setOriginId] = useState("");
  const [domestic, setDomestic] = useState(false);
  const [qualityOptionId, setQualityOptionId] = useState("");
  const [editing, setEditing] = useState<ClassRow | null>(null);
  const [newOrigin, setNewOrigin] = useState("");
  const [newQuality, setNewQuality] = useState("");
  const [editingOrigin, setEditingOrigin] = useState<Opt | null>(null);
  const [editingQuality, setEditingQuality] = useState<Opt | null>(null);
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

  async function onSaveOrigin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingOrigin) {
        await updateOriginOption(editingOrigin.id, newOrigin);
        setEditingOrigin(null);
      } else {
        await createOriginOption(newOrigin);
      }
      setNewOrigin("");
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save origin");
    }
  }

  async function onDeleteOrigin(id: string) {
    if (!confirm("Delete this origin option?")) return;
    setError(null);
    try {
      await deleteOriginOption(id);
      setOrigins((prev) => prev.filter((o) => o.id !== id));
      if (editingOrigin?.id === id) {
        setEditingOrigin(null);
        setNewOrigin("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete origin");
    }
  }

  async function onSaveQuality(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingQuality) {
        await updateQualityOption(editingQuality.id, newQuality);
        setEditingQuality(null);
      } else {
        await createQualityOption(newQuality);
      }
      setNewQuality("");
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save quality");
    }
  }

  async function onDeleteQuality(id: string) {
    if (!confirm("Delete this quality option?")) return;
    setError(null);
    try {
      await deleteQualityOption(id);
      setQualities((prev) => prev.filter((q) => q.id !== id));
      if (editingQuality?.id === id) {
        setEditingQuality(null);
        setNewQuality("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete quality");
    }
  }

  return (
    <div>
      <h1 className="page-title">Quality classes</h1>
      <p className="page-subtitle">
        Domestic/imported, origin, and quality grade used on vessels and orders.
      </p>
      {error && <div className="error-box">{error}</div>}

      <h2 className="mb-3 text-base font-semibold">Add / edit class</h2>
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
          <option value="">Select…</option>
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
          <option value="">Select…</option>
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

      <div className="table-wrap mb-10">
        <table className="data">
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
        </table>
      </div>

      <div className="mb-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-base font-semibold">Origin options</h2>
          <div className="table-wrap mb-3">
            <table className="data">
              <thead>
                <tr>
                  <th>Name</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {origins.map((o) => (
                  <tr key={o.id}>
                    <td>{o.name}</td>
                    <td className="space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditingOrigin(o);
                          setNewOrigin(o.name);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => onDeleteOrigin(o.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {origins.length === 0 && (
                  <tr>
                    <td colSpan={2}>No origins yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <form onSubmit={onSaveOrigin} className="flex gap-2">
            <input
              required
              placeholder={editingOrigin ? "Edit origin" : "New origin"}
              value={newOrigin}
              onChange={(e) => setNewOrigin(e.target.value)}
            />
            <button type="submit" className="btn" disabled={pending}>
              {editingOrigin ? "Update" : "Add"}
            </button>
            {editingOrigin && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingOrigin(null);
                  setNewOrigin("");
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
        <div>
          <h2 className="mb-3 text-base font-semibold">Quality options</h2>
          <div className="table-wrap mb-3">
            <table className="data">
              <thead>
                <tr>
                  <th>Name</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {qualities.map((q) => (
                  <tr key={q.id}>
                    <td>{q.name}</td>
                    <td className="space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditingQuality(q);
                          setNewQuality(q.name);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => onDeleteQuality(q.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {qualities.length === 0 && (
                  <tr>
                    <td colSpan={2}>No qualities yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <form onSubmit={onSaveQuality} className="flex gap-2">
            <input
              required
              placeholder={editingQuality ? "Edit quality" : "New quality"}
              value={newQuality}
              onChange={(e) => setNewQuality(e.target.value)}
            />
            <button type="submit" className="btn" disabled={pending}>
              {editingQuality ? "Update" : "Add"}
            </button>
            {editingQuality && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingQuality(null);
                  setNewQuality("");
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
