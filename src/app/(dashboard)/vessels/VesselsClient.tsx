"use client";

import { FormEvent, useState, useTransition } from "react";
import {
  createVessel,
  deleteVessel,
  updateVessel,
} from "@/lib/actions/vessels";

type Customer = { id: string; name: string };
type Row = {
  id: string;
  vesselName: string;
  importerId: string;
  quality: string | null;
  quantity: string;
  dispatchedQuantity: string;
  balanceQuantity: string;
  importer: Customer | null;
};

const empty = {
  vesselName: "",
  importerId: "",
  quality: "",
  quantity: "",
};

export function VesselsClient({
  initial,
  customers,
}: {
  initial: Row[];
  customers: Customer[];
}) {
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        vesselName: form.vesselName,
        importerId: form.importerId,
        quality: form.quality || null,
        quantity: form.quantity,
      };
      if (editing) await updateVessel(editing.id, payload);
      else await createVessel(payload);
      setForm(empty);
      setEditing(null);
      startTransition(() => window.location.reload());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this vessel?")) return;
    try {
      await deleteVessel(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <h1 className="page-title">Vessels / Inventory</h1>
      <p className="page-subtitle">
        Live vessel balances. Rows near zero are highlighted.
      </p>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="mb-6 form-grid">
        <label>Vessel name</label>
        <input
          required
          value={form.vesselName}
          onChange={(e) => setForm({ ...form, vesselName: e.target.value })}
        />
        <label>Importer</label>
        <select
          required
          value={form.importerId}
          onChange={(e) => setForm({ ...form, importerId: e.target.value })}
        >
          <option value="">Select…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label>Quality</label>
        <input
          value={form.quality}
          onChange={(e) => setForm({ ...form, quality: e.target.value })}
        />
        <label>Quantity (total received)</label>
        <div className="field-with-unit">
          <input
            required
            type="number"
            step="any"
            min="0"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <span className="field-unit">MT</span>
        </div>
        <div />
        <div className="flex gap-2">
          <button type="submit" className="btn" disabled={pending}>
            {editing ? "Update" : "Add vessel"}
          </button>
          {editing && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Vessel</th>
              <th>Importer</th>
              <th>Quality</th>
              <th>Quantity (MT)</th>
              <th>Dispatched (MT)</th>
              <th>Balance (MT)</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const qty = Number(row.quantity);
              const bal = Number(row.balanceQuantity);
              const low = qty > 0 && bal / qty <= 0.1;
              return (
                <tr key={row.id} className={low ? "low-balance" : undefined}>
                  <td>{row.vesselName}</td>
                  <td>{row.importer?.name ?? "—"}</td>
                  <td>{row.quality ?? "—"}</td>
                  <td>{row.quantity}</td>
                  <td>{row.dispatchedQuantity}</td>
                  <td>{row.balanceQuantity}</td>
                  <td className="space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditing(row);
                        setForm({
                          vesselName: row.vesselName,
                          importerId: row.importerId,
                          quality: row.quality ?? "",
                          quantity: row.quantity,
                        });
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
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7}>No vessels yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
