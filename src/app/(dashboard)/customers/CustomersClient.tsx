"use client";

import Link from "next/link";
import { CustomerCategory } from "@/generated/prisma";
import { FormEvent, useState, useTransition } from "react";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from "@/lib/actions/customers";
import {
  capitalizeName,
  formatCreditPeriod,
  formatCustomerCategory,
} from "@/lib/domain/format";
import { FormStatusToggle } from "@/components/FormStatusToggle";
import { OptionSelect } from "@/components/OptionSelect";

const COLLECTION_OFFICER = "Collection Officer";

type Row = {
  id: string;
  name: string;
  category: CustomerCategory;
  active: boolean;
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
  factoryContactName: string | null;
  factoryContactContact: string | null;
  factoryContactRole: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  creditDays: number | null;
  sector: string | null;
  saleExecutive: string | null;
  approachForFunds: string | null;
};

const empty = {
  name: "",
  category: "" as CustomerCategory | "",
  active: true,
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
  factoryContactName: "",
  factoryContactContact: "",
  factoryContactRole: "",
  email: "",
  city: "",
  state: "",
  creditDays: "",
  sector: "",
  saleExecutive: "",
  approachForFunds: "",
};

function parseCreditDays(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function formatNameField(value: string): string {
  return capitalizeName(value) ?? value;
}

function formatContact(name: string | null, contact: string | null): string {
  const formattedName = name ? (capitalizeName(name) ?? name) : null;
  if (!formattedName) return "—";
  return `${formattedName}${contact ? ` · ${contact}` : ""}`;
}

export function CustomersClient({
  initial,
  cities,
  states,
  sectors,
  saleExecutives,
}: {
  initial: Row[];
  cities: string[];
  states: string[];
  sectors: string[];
  saleExecutives: string[];
}) {
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.category) {
      setError("Category is required");
      return;
    }
    const payload = {
      name: form.name,
      category: form.category,
      active: editing ? form.active : undefined,
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
      factoryContactName: form.factoryContactName || null,
      factoryContactContact: form.factoryContactContact || null,
      factoryContactRole: form.factoryContactRole || null,
      email: form.email || null,
      city: form.city || null,
      state: form.state || null,
      creditDays: parseCreditDays(form.creditDays),
      sector: form.sector || null,
      saleExecutive: form.saleExecutive || null,
      approachForFunds: form.approachForFunds || null,
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
      active: row.active,
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
      factoryContactName: row.factoryContactName ?? "",
      factoryContactContact: row.factoryContactContact ?? "",
      factoryContactRole: row.factoryContactRole ?? "",
      email: row.email ?? "",
      city: row.city ?? "",
      state: row.state ?? "",
      creditDays: row.creditDays != null ? String(row.creditDays) : "",
      sector: row.sector ?? "",
      saleExecutive: row.saleExecutive ?? "",
      approachForFunds: row.approachForFunds ?? "",
    });
  }

  function setNameField<K extends keyof typeof empty>(
    key: K,
    value: string,
  ) {
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

  const factoryContactEditable =
    form.category === CustomerCategory.INDUSTRY;

  return (
    <div>
      <h1 className="page-title">Customers</h1>
      <p className="page-subtitle">
        Vendors, traders, and industry buyers.
      </p>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="mb-6 form-grid form-grid-wide">
        <label>Company name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setNameField("name", e.target.value)}
          onBlur={() => blurNameField("name")}
        />

        <label>Category</label>
        <select
          required
          value={form.category}
          onChange={(e) => {
            const category = e.target.value as CustomerCategory | "";
            const clearFactory = category !== CustomerCategory.INDUSTRY;
            setForm({
              ...form,
              category,
              ...(clearFactory
                ? {
                    factoryContactName: "",
                    factoryContactContact: "",
                    factoryContactRole: "",
                  }
                : {}),
            });
          }}
        >
          <option value="" disabled>
            Select
          </option>
          <option value={CustomerCategory.INDUSTRY}>Industry</option>
          <option value={CustomerCategory.TRADER}>Trader</option>
          <option value={CustomerCategory.SUPPLIER}>Vendor</option>
        </select>

        {editing && (
          <>
            <label>Status</label>
            <FormStatusToggle
              active={form.active}
              onChange={(active) => setForm({ ...form, active })}
              disabled={pending}
              label="Customer status"
            />
          </>
        )}

        <label>Owner</label>
        <div className="role-fields">
          <input
            placeholder="Name"
            value={form.ownerName}
            onChange={(e) => setNameField("ownerName", e.target.value)}
            onBlur={() => blurNameField("ownerName")}
          />
          <input
            placeholder="Phone"
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.ownerContact}
            onChange={(e) => setPhoneField("ownerContact", e.target.value)}
          />
        </div>

        <label>Purchaser</label>
        <div className="role-fields role-fields-3">
          <input
            placeholder="Name"
            value={form.purchaserName}
            onChange={(e) => setNameField("purchaserName", e.target.value)}
            onBlur={() => blurNameField("purchaserName")}
          />
          <input
            placeholder="Phone"
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.purchaserContact}
            onChange={(e) =>
              setPhoneField("purchaserContact", e.target.value)
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
              setNameField("paymentInChargeName", e.target.value)
            }
            onBlur={() => blurNameField("paymentInChargeName")}
          />
          <input
            placeholder="Phone"
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.paymentInChargeContact}
            onChange={(e) =>
              setPhoneField("paymentInChargeContact", e.target.value)
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
            onChange={(e) => setNameField("accountantName", e.target.value)}
            onBlur={() => blurNameField("accountantName")}
          />
          <input
            placeholder="Phone"
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.accountantContact}
            onChange={(e) =>
              setPhoneField("accountantContact", e.target.value)
            }
          />
        </div>

        <label className={factoryContactEditable ? undefined : "field-label-muted"}>
          Factory contact
        </label>
        <div
          className={`role-fields role-fields-3${
            factoryContactEditable ? "" : " role-fields-disabled"
          }`}
        >
          <input
            placeholder="Name"
            disabled={!factoryContactEditable}
            value={form.factoryContactName}
            onChange={(e) =>
              setNameField("factoryContactName", e.target.value)
            }
            onBlur={() => blurNameField("factoryContactName")}
          />
          <input
            placeholder="Phone"
            inputMode="numeric"
            pattern="[0-9]*"
            disabled={!factoryContactEditable}
            value={form.factoryContactContact}
            onChange={(e) =>
              setPhoneField("factoryContactContact", e.target.value)
            }
          />
          <input
            placeholder="Role"
            disabled={!factoryContactEditable}
            value={form.factoryContactRole}
            onChange={(e) =>
              setForm({ ...form, factoryContactRole: e.target.value })
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

        <label>Credit period</label>
        <div className="field-with-unit">
          <input
            type="number"
            min={0}
            step={1}
            placeholder="0"
            value={form.creditDays}
            onChange={(e) => setForm({ ...form, creditDays: e.target.value })}
          />
          <span className="field-unit">days</span>
        </div>

        <label>Sales executive</label>
        <OptionSelect
          value={form.saleExecutive}
          onChange={(saleExecutive) => setForm({ ...form, saleExecutive })}
          options={saleExecutives}
        />

        <label>Approach for funds</label>
        <OptionSelect
          value={form.approachForFunds}
          onChange={(approachForFunds) =>
            setForm({ ...form, approachForFunds })
          }
          options={[
            COLLECTION_OFFICER,
            ...saleExecutives.filter((name) => name !== COLLECTION_OFFICER),
          ]}
        />

        <label>Sector</label>
        <OptionSelect
          value={form.sector}
          onChange={(sector) => setForm({ ...form, sector })}
          options={sectors}
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
              <th className="num">Credit period</th>
              <th>Sector</th>
              <th>Sales Executive</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={row.active ? undefined : "customer-row-inactive"}
              >
                <td>
                  {capitalizeName(row.name) ?? row.name}
                  {!row.active && (
                    <span className="customer-inactive-label">Inactive</span>
                  )}
                </td>
                <td>{formatCustomerCategory(row.category)}</td>
                <td>
                  {[row.city, row.state].filter(Boolean).join(", ") || "—"}
                </td>
                <td>{formatContact(row.ownerName, row.ownerContact)}</td>
                <td>
                  {formatContact(row.purchaserName, row.purchaserContact)}
                </td>
                <td>
                  {formatContact(
                    row.paymentInChargeName,
                    row.paymentInChargeContact,
                  )}
                </td>
                <td className="num">{formatCreditPeriod(row.creditDays)}</td>
                <td>{row.sector ?? "—"}</td>
                <td>{row.saleExecutive ?? "—"}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <Link
                    href={`/reports/customer-analysis/${row.id}`}
                    className="btn btn-secondary"
                  >
                    Analysis
                  </Link>
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
