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
  ownerName: string | null;
  ownerContact: string | null;
  purchaserName: string | null;
  purchaserContact: string | null;
  purchaserRole: string | null;
  paymentInChargeName: string | null;
  paymentInChargeContact: string | null;
  paymentInChargeRole: string | null;
  accountantName: string | null;
  accountantContact: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  creditDays: number | null;
  sector: string | null;
  dealById: string | null;
  approachForFundsId: string | null;
  dealBy: Staff | null;
  approachForFunds: Staff | null;
};

const empty = {
  name: "",
  category: CustomerCategory.INDUSTRY as CustomerCategory,
  ownerName: "",
  ownerContact: "",
  purchaserName: "",
  purchaserContact: "",
  purchaserRole: "",
  paymentInChargeName: "",
  paymentInChargeContact: "",
  paymentInChargeRole: "",
  accountantName: "",
  accountantContact: "",
  email: "",
  city: "",
  state: "",
  creditDays: "",
  sector: "",
  dealById: "",
  approachForFundsId: "",
};

function parseCreditDays(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

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
      ownerName: form.ownerName || null,
      ownerContact: form.ownerContact || null,
      purchaserName: form.purchaserName || null,
      purchaserContact: form.purchaserContact || null,
      purchaserRole: form.purchaserRole || null,
      paymentInChargeName: form.paymentInChargeName || null,
      paymentInChargeContact: form.paymentInChargeContact || null,
      paymentInChargeRole: form.paymentInChargeRole || null,
      accountantName: form.accountantName || null,
      accountantContact: form.accountantContact || null,
      email: form.email || null,
      city: form.city || null,
      state: form.state || null,
      creditDays: parseCreditDays(form.creditDays),
      sector: form.sector || null,
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

  function startEdit(row: Row) {
    setEditing(row);
    setForm({
      name: row.name,
      category: row.category,
      ownerName: row.ownerName ?? "",
      ownerContact: row.ownerContact ?? "",
      purchaserName: row.purchaserName ?? "",
      purchaserContact: row.purchaserContact ?? "",
      purchaserRole: row.purchaserRole ?? "",
      paymentInChargeName: row.paymentInChargeName ?? "",
      paymentInChargeContact: row.paymentInChargeContact ?? "",
      paymentInChargeRole: row.paymentInChargeRole ?? "",
      accountantName: row.accountantName ?? "",
      accountantContact: row.accountantContact ?? "",
      email: row.email ?? "",
      city: row.city ?? "",
      state: row.state ?? "",
      creditDays: row.creditDays != null ? String(row.creditDays) : "",
      sector: row.sector ?? "",
      dealById: row.dealById ?? "",
      approachForFundsId: row.approachForFundsId ?? "",
    });
  }

  return (
    <div>
      <h1 className="page-title">Customers</h1>
      <p className="page-subtitle">
        Suppliers, industry buyers, and traders.
      </p>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="mb-6 form-grid form-grid-wide">
        <label>Company name</label>
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
          <option value={CustomerCategory.INDUSTRY}>Industry</option>
          <option value={CustomerCategory.TRADER}>Trader</option>
          <option value={CustomerCategory.SUPPLIER}>Supplier</option>
        </select>

        <label>Owner</label>
        <div className="role-fields">
          <input
            placeholder="Name"
            value={form.ownerName}
            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
          />
          <input
            placeholder="Phone"
            value={form.ownerContact}
            onChange={(e) =>
              setForm({ ...form, ownerContact: e.target.value })
            }
          />
        </div>

        <label>Purchaser</label>
        <div className="role-fields role-fields-3">
          <input
            placeholder="Name"
            value={form.purchaserName}
            onChange={(e) =>
              setForm({ ...form, purchaserName: e.target.value })
            }
          />
          <input
            placeholder="Phone"
            value={form.purchaserContact}
            onChange={(e) =>
              setForm({ ...form, purchaserContact: e.target.value })
            }
          />
          <input
            placeholder="Role"
            value={form.purchaserRole}
            onChange={(e) =>
              setForm({ ...form, purchaserRole: e.target.value })
            }
          />
        </div>

        <label>Payment in-charge</label>
        <div className="role-fields role-fields-3">
          <input
            placeholder="Name"
            value={form.paymentInChargeName}
            onChange={(e) =>
              setForm({ ...form, paymentInChargeName: e.target.value })
            }
          />
          <input
            placeholder="Phone"
            value={form.paymentInChargeContact}
            onChange={(e) =>
              setForm({ ...form, paymentInChargeContact: e.target.value })
            }
          />
          <input
            placeholder="Role"
            value={form.paymentInChargeRole}
            onChange={(e) =>
              setForm({ ...form, paymentInChargeRole: e.target.value })
            }
          />
        </div>

        <label>Accountant</label>
        <div className="role-fields">
          <input
            placeholder="Name"
            value={form.accountantName}
            onChange={(e) =>
              setForm({ ...form, accountantName: e.target.value })
            }
          />
          <input
            placeholder="Phone"
            value={form.accountantContact}
            onChange={(e) =>
              setForm({ ...form, accountantContact: e.target.value })
            }
          />
        </div>

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

        <label>Credit days</label>
        <input
          type="number"
          min={0}
          step={1}
          value={form.creditDays}
          onChange={(e) => setForm({ ...form, creditDays: e.target.value })}
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

        <label>Sector</label>
        <input
          value={form.sector}
          onChange={(e) => setForm({ ...form, sector: e.target.value })}
        />

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
              <th>Company</th>
              <th>Category</th>
              <th>City</th>
              <th>Owner</th>
              <th>Purchaser</th>
              <th>Payment</th>
              <th>Credit days</th>
              <th>Sector</th>
              <th>Deal by</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.category}</td>
                <td>
                  {[row.city, row.state].filter(Boolean).join(", ") || "—"}
                </td>
                <td>
                  {row.ownerName
                    ? `${row.ownerName}${row.ownerContact ? ` · ${row.ownerContact}` : ""}`
                    : "—"}
                </td>
                <td>
                  {row.purchaserName
                    ? `${row.purchaserName}${row.purchaserContact ? ` · ${row.purchaserContact}` : ""}`
                    : "—"}
                </td>
                <td>
                  {row.paymentInChargeName
                    ? `${row.paymentInChargeName}${row.paymentInChargeContact ? ` · ${row.paymentInChargeContact}` : ""}`
                    : "—"}
                </td>
                <td>{row.creditDays ?? "—"}</td>
                <td>{row.sector ?? "—"}</td>
                <td>{row.dealBy?.name ?? "—"}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => startEdit(row)}
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
                <td colSpan={10}>No customers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
