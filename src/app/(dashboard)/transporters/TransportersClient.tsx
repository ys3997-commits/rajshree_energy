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
  ownerName: string | null;
  ownerContactNumber1: string | null;
  ownerContactNumber2: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
};

const empty = {
  name: "",
  ownerName: "",
  ownerContactNumber1: "",
  ownerContactNumber2: "",
  email: "",
  city: "",
  state: "",
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
        <label>Company name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <label>Owner name</label>
        <input
          value={form.ownerName}
          onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
        />
        <label>Owner contact 1</label>
        <input
          value={form.ownerContactNumber1}
          onChange={(e) =>
            setForm({ ...form, ownerContactNumber1: e.target.value })
          }
        />
        <label>Owner contact 2</label>
        <input
          value={form.ownerContactNumber2}
          onChange={(e) =>
            setForm({ ...form, ownerContactNumber2: e.target.value })
          }
        />
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <label>City</label>
        <input
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <label>State</label>
        <input
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
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
              <th>Company</th>
              <th>Owner</th>
              <th>Contact 1</th>
              <th>Contact 2</th>
              <th>Email</th>
              <th>City</th>
              <th>State</th>
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
                <td>{row.ownerName ?? "—"}</td>
                <td>{row.ownerContactNumber1 ?? "—"}</td>
                <td>{row.ownerContactNumber2 ?? "—"}</td>
                <td>{row.email ?? "—"}</td>
                <td>{row.city ?? "—"}</td>
                <td>{row.state ?? "—"}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(row);
                      setForm({
                        name: row.name,
                        ownerName: row.ownerName ?? "",
                        ownerContactNumber1: row.ownerContactNumber1 ?? "",
                        ownerContactNumber2: row.ownerContactNumber2 ?? "",
                        email: row.email ?? "",
                        city: row.city ?? "",
                        state: row.state ?? "",
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
                <td colSpan={8}>No transporters yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
