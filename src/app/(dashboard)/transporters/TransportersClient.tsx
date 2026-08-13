"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import {
  createTransporter,
  deleteTransporter,
  updateTransporter,
  type TransporterListRow,
} from "@/lib/actions/transporters";
import { capitalizeName, formatRs } from "@/lib/domain/format";
import { OptionSelect } from "@/components/OptionSelect";

const empty = {
  name: "",
  ownerName: "",
  ownerContactNumber1: "",
  ownerContactNumber2: "",
  email: "",
  city: "",
  state: "",
  openingDue: "0",
};

function formatNameField(value: string): string {
  return capitalizeName(value) ?? value;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function parseOpeningDueInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "0";
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    throw new Error("Opening due must be a valid amount");
  }
  return trimmed;
}

export function TransportersClient({
  initial,
  cities,
  states,
}: {
  initial: TransporterListRow[];
  cities: string[];
  states: string[];
}) {
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<TransporterListRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...form,
        openingDue: parseOpeningDueInput(form.openingDue),
      };
      if (editing) {
        await updateTransporter(editing.id, payload);
      } else {
        await createTransporter(payload);
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

  function setNameField<K extends keyof typeof empty>(key: K, value: string) {
    setForm({ ...form, [key]: value });
  }

  function blurNameField<K extends keyof typeof empty>(key: K) {
    const value = form[key];
    if (typeof value === "string" && value.trim()) {
      setForm({ ...form, [key]: formatNameField(value) });
    }
  }

  function setPhoneField<K extends keyof typeof empty>(key: K, value: string) {
    setForm({ ...form, [key]: digitsOnly(value) });
  }

  return (
    <div>
      <h1 className="page-title">Transporters</h1>
      <p className="page-subtitle">Logistics partners and contacts.</p>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="mb-6 form-grid">
        <label>Company name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setNameField("name", e.target.value)}
          onBlur={() => blurNameField("name")}
        />
        <label>Owner name</label>
        <input
          value={form.ownerName}
          onChange={(e) => setNameField("ownerName", e.target.value)}
          onBlur={() => blurNameField("ownerName")}
        />
        <label>Owner contact 1</label>
        <input
          inputMode="numeric"
          value={form.ownerContactNumber1}
          onChange={(e) =>
            setPhoneField("ownerContactNumber1", e.target.value)
          }
        />
        <label>Owner contact 2</label>
        <input
          inputMode="numeric"
          value={form.ownerContactNumber2}
          onChange={(e) =>
            setPhoneField("ownerContactNumber2", e.target.value)
          }
        />
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <label>City</label>
        <OptionSelect
          value={form.city}
          onChange={(city) => setForm({ ...form, city })}
          options={cities}
        />
        <label>State</label>
        <OptionSelect
          value={form.state}
          onChange={(state) => setForm({ ...form, state })}
          options={states}
        />
        <label>
          Opening due
          <span className="field-hint"> as on 01/08/2026</span>
        </label>
        <div className="field-with-unit">
          <input
            type="number"
            step="0.01"
            placeholder="0"
            value={form.openingDue}
            onChange={(e) => setForm({ ...form, openingDue: e.target.value })}
          />
          <span className="field-unit">Rs</span>
        </div>
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
              <th className="num">Opening due</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link href={`/transporters/${row.id}`} className="font-medium">
                    {capitalizeName(row.name) ?? row.name}
                  </Link>
                </td>
                <td>
                  {row.ownerName
                    ? (capitalizeName(row.ownerName) ?? row.ownerName)
                    : "—"}
                </td>
                <td>{row.ownerContactNumber1 ?? "—"}</td>
                <td>{row.ownerContactNumber2 ?? "—"}</td>
                <td>{row.email ?? "—"}</td>
                <td>{row.city ?? "—"}</td>
                <td>{row.state ?? "—"}</td>
                <td className="num">{formatRs(row.openingDue)}</td>
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
                        openingDue: row.openingDue,
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
                <td colSpan={9}>No transporters yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
