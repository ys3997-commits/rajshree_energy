"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import {
  createTransporter,
  deleteTransporter,
  updateTransporter,
} from "@/lib/actions/transporters";

type Row = {
  id: string;
  name: string;
  area: string | null;
  contactPersonName: string | null;
  contactNumber: string | null;
};

const empty = {
  name: "",
  area: "",
  contactPersonName: "",
  contactNumber: "",
};

export function TransportersClient({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await updateTransporter(editing.id, form);
      } else {
        await createTransporter(form);
      }
      setForm(empty);
      setEditing(null);
      startTransition(() => window.location.reload());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this transporter?")) return;
    try {
      await deleteTransporter(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <h1 className="page-title">Transporters</h1>
      <p className="page-subtitle">
        Logistics partners and contacts.
      </p>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="mb-6 form-grid">
        <label>Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <label>Area</label>
        <input
          value={form.area}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
        />
        <label>Contact person</label>
        <input
          value={form.contactPersonName}
          onChange={(e) =>
            setForm({ ...form, contactPersonName: e.target.value })
          }
        />
        <label>Contact number</label>
        <input
          value={form.contactNumber}
          onChange={(e) =>
            setForm({ ...form, contactNumber: e.target.value })
          }
        />
        <div />
        <div className="flex gap-2">
          <button type="submit" className="btn" disabled={pending}>
            {editing ? "Update" : "Add transporter"}
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
              <th>Name</th>
              <th>Area</th>
              <th>Contact person</th>
              <th>Contact number</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link href={`/transporters/${row.id}`} className="font-medium">
                    {row.name}
                  </Link>
                </td>
                <td>{row.area ?? "—"}</td>
                <td>{row.contactPersonName ?? "—"}</td>
                <td>{row.contactNumber ?? "—"}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(row);
                      setForm({
                        name: row.name,
                        area: row.area ?? "",
                        contactPersonName: row.contactPersonName ?? "",
                        contactNumber: row.contactNumber ?? "",
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
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5}>No transporters yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
