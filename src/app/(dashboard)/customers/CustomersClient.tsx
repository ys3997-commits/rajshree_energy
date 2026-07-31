"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerCategory } from "@/generated/prisma";
import { FormEvent, useEffect, useState, useTransition } from "react";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
  type CustomerListResult,
  type CustomerListRow,
} from "@/lib/actions/customers";
import {
  capitalizeName,
  formatCreditPeriod,
  formatCustomerCategory,
  formatRs,
} from "@/lib/domain/format";
import { FormStatusToggle } from "@/components/FormStatusToggle";
import { Modal } from "@/components/Modal";
import { OptionSelect } from "@/components/OptionSelect";

const COLLECTION_OFFICER = "Collection Officer";

type Row = CustomerListRow;

function customersHref(page: number, q: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  const trimmed = q.trim();
  if (trimmed) params.set("q", trimmed);
  const qs = params.toString();
  return qs ? `/customers?${qs}` : "/customers";
}

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
  openingDue: "0",
};

function parseCreditDays(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
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
  initial: CustomerListResult;
  cities: string[];
  states: string[];
  sectors: string[];
  saleExecutives: string[];
}) {
  const router = useRouter();
  const { rows, total, page, pageSize, totalPages, q } = initial;
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [nameSearch, setNameSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setNameSearch(q);
  }

  useEffect(() => {
    const trimmed = nameSearch.trim();
    if (trimmed === q) return;
    const handle = window.setTimeout(() => {
      router.push(customersHref(1, trimmed));
    }, 300);
    return () => window.clearTimeout(handle);
  }, [nameSearch, q, router]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

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
      openingDue: parseOpeningDueInput(form.openingDue),
    };
    try {
      if (editing) await updateCustomer(editing.id, payload);
      else await createCustomer(payload);
      setForm(empty);
      setEditing(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(id);
      startTransition(() => router.refresh());
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
      openingDue: row.openingDue,
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
      <Modal open={error !== null} title="Message" onClose={() => setError(null)}>
        <p className="mb-4">{error}</p>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={() => setError(null)}>
            OK
          </button>
        </div>
      </Modal>

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

        <label>Opening due</label>
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

      <div className="customers-table-toolbar">
        <input
          type="search"
          className="field-input customers-name-search"
          placeholder="Search by company name…"
          aria-label="Search customers by name"
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
        />
      </div>

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
              <th className="num">Opening due</th>
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
                <td className="num">{formatRs(row.openingDue)}</td>
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
                <td colSpan={11}>
                  {q
                    ? "No customers match that name."
                    : "No customers yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="payments-pagination">
          <span>
            {from}–{to} of {total}
          </span>
          <div className="payments-pagination-actions">
            {page > 1 && (
              <Link
                href={customersHref(page - 1, q)}
                className="btn btn-secondary btn-sm"
                prefetch={false}
              >
                Previous
              </Link>
            )}
            <span>
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={customersHref(page + 1, q)}
                className="btn btn-secondary btn-sm"
                prefetch={false}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
