"use client";

import { CustomerCategory } from "@/generated/prisma";
import { FormEvent, useState, useTransition } from "react";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from "@/lib/actions/customers";

type Staff = { id: string; name: string };
type Row = {
  id: string;
  name: string;
  category: CustomerCategory;
  contactNumber: string | null;
  pocName: string | null;
  area: string | null;
  industrySector: string | null;
  dealById: string | null;
  approachForFundsId: string | null;
  dealBy: Staff | null;
  approachForFunds: Staff | null;
};

const empty: {
  name: string;
  category: CustomerCategory;
  contactNumber: string;
  pocName: string;
  area: string;
  industrySector: string;
  dealById: string;
  approachForFundsId: string;
} = {
  name: "",
  category: CustomerCategory.INDUSTRY,
  contactNumber: "",
  pocName: "",
  area: "",
  industrySector: "",
  dealById: "",
  approachForFundsId: "",
};

export function CustomersClient({
  initial,
  staff,
}: {
  initial: Row[];
  staff: Staff[];
}) {
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      category: form.category,
      contactNumber: form.contactNumber || null,
      pocName: form.pocName || null,
      area: form.area || null,
      industrySector: form.industrySector || null,
      dealById: form.dealById || null,
      approachForFundsId: form.approachForFundsId || null,
    };
    try {
      if (editing) await updateCustomer(editing.id, payload);
      else await createCustomer(payload);
      setForm(empty);
      setEditing(null);
      startTransition(() => window.location.reload());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <h1 className="page-title">Customers</h1>
      <p className="page-subtitle">
        Suppliers and industry buyers.
      </p>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="mb-6 form-grid">
        <label>Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <label>Category</label>
        <select
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value as CustomerCategory,
            })
          }
        >
          <option value={CustomerCategory.INDUSTRY}>INDUSTRY</option>
          <option value={CustomerCategory.SUPPLIER}>SUPPLIER</option>
        </select>
        <label>Contact number</label>
        <input
          value={form.contactNumber}
          onChange={(e) =>
            setForm({ ...form, contactNumber: e.target.value })
          }
        />
        <label>POC name</label>
        <input
          value={form.pocName}
          onChange={(e) => setForm({ ...form, pocName: e.target.value })}
        />
        <label>Area</label>
        <input
          value={form.area}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
        />
        <label>Industry sector</label>
        <input
          value={form.industrySector}
          onChange={(e) =>
            setForm({ ...form, industrySector: e.target.value })
          }
        />
        <label>Deal by</label>
        <select
          value={form.dealById}
          onChange={(e) => setForm({ ...form, dealById: e.target.value })}
        >
          <option value="">—</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <label>Approach for funds</label>
        <select
          value={form.approachForFundsId}
          onChange={(e) =>
            setForm({ ...form, approachForFundsId: e.target.value })
          }
        >
          <option value="">—</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <div />
        <div className="flex gap-2">
          <button type="submit" className="btn" disabled={pending}>
            {editing ? "Update" : "Add customer"}
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
              <th>Category</th>
              <th>Area</th>
              <th>POC</th>
              <th>Contact</th>
              <th>Sector</th>
              <th>Deal by</th>
              <th>Approach for funds</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.category}</td>
                <td>{row.area ?? "—"}</td>
                <td>{row.pocName ?? "—"}</td>
                <td>{row.contactNumber ?? "—"}</td>
                <td>{row.industrySector ?? "—"}</td>
                <td>{row.dealBy?.name ?? "—"}</td>
                <td>{row.approachForFunds?.name ?? "—"}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(row);
                      setForm({
                        name: row.name,
                        category: row.category,
                        contactNumber: row.contactNumber ?? "",
                        pocName: row.pocName ?? "",
                        area: row.area ?? "",
                        industrySector: row.industrySector ?? "",
                        dealById: row.dealById ?? "",
                        approachForFundsId: row.approachForFundsId ?? "",
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
                <td colSpan={9}>No customers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
