"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { CustomerCategory } from "@/generated/prisma";
import {
  createDiscount,
  deleteDiscount,
  updateDiscount,
  type DiscountListResult,
  type DiscountRow,
} from "@/lib/actions/discounts";
import {
  formatCoalOrigin,
  formatCustomerCategory,
  formatIndianAmountTyping,
  formatRs,
  parseAmountInput,
} from "@/lib/domain/format";
import { parsePartyKey, partyKey } from "@/lib/domain/paymentParty";
import { SearchableSelect } from "@/components/SearchableSelect";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { FundFlowDateFilter } from "./FundFlowDateFilter";
import { FundFlowTotals } from "./FundFlowTotals";
import { PartyNameLink } from "./PartyNameLink";
import { PaymentsTabs } from "./PaymentsTabs";
import { paymentsHref } from "./paymentsHref";

type Opt = {
  id: string;
  name: string;
  kind: "customer" | "transporter";
  category?: CustomerCategory;
};
type Status = "RECEIVED" | "PAID" | "";
type CoalOriginValue = "DOMESTIC" | "IMPORTED" | "";
type FormState = {
  date: string;
  partyId: string;
  status: Status;
  amount: string;
  coalOrigin: CoalOriginValue;
  remarks: string;
};

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptyForm(partyId = ""): FormState {
  return {
    date: todayLocal(),
    partyId,
    status: "" as Status,
    amount: "",
    coalOrigin: "" as CoalOriginValue,
    remarks: "",
  };
}

function formFromRow(row: DiscountRow): FormState {
  return {
    date: row.date,
    partyId: row.transporterId
      ? partyKey("transporter", row.transporterId)
      : partyKey("customer", row.customerId ?? ""),
    status: row.status,
    amount: row.amount,
    coalOrigin: (row.coalOrigin ?? "") as CoalOriginValue,
    remarks: row.remarks,
  };
}

function statusLabel(status: string): string {
  return status === "RECEIVED" ? "Discount Received" : "Discount Paid";
}

function typeClass(status: string): string {
  return status === "RECEIVED" ? "fund-type-in" : "fund-type-out";
}

function rowTypeClass(status: string): string {
  return status === "RECEIVED" ? "fund-row-in" : "fund-row-out";
}

function formatDateDdMmYyyy(value: string | null | undefined): string {
  if (!value) return "—";
  const datePart = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function partyLabel(row: DiscountRow): string {
  return row.transporterId
    ? `${row.customerName} — Transporter`
    : row.customerName;
}

function resetAddFormAfterSave(form: FormState): FormState {
  return {
    ...form,
    status: "" as Status,
    amount: "",
    remarks: "",
  };
}

function hasListFilters(
  dateFrom: string,
  dateTo: string,
  party: string,
  type: string,
): boolean {
  return Boolean(dateFrom || dateTo || party || type);
}

function changeAmount(form: FormState, value: string): FormState | null {
  const raw = parseAmountInput(value).replace(/[^\d.]/g, "");
  if (raw === "") return { ...form, amount: "" };
  if (!/^\d*\.?\d{0,2}$/.test(raw)) return null;
  return { ...form, amount: raw };
}

export function DiscountsClient({
  initial,
  exportRows,
  parties,
  dateFrom,
  dateTo,
  party,
  type,
}: {
  initial: DiscountListResult;
  exportRows: DiscountRow[];
  parties: Opt[];
  dateFrom: string;
  dateTo: string;
  party: string;
  type: string;
}) {
  const router = useRouter();
  const { rows, total, page, pageSize, totalPages, totals } = initial;
  const listFilters = { dateFrom, dateTo, party, type };

  const [addForm, setAddForm] = useState(() => emptyForm());
  const [editForm, setEditForm] = useState<FormState>(() => emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const addAmountDisplay = useMemo(
    () => formatIndianAmountTyping(addForm.amount),
    [addForm.amount],
  );
  const editAmountDisplay = useMemo(
    () => formatIndianAmountTyping(editForm.amount),
    [editForm.amount],
  );

  const partyOptions = useMemo(
    () =>
      parties.map((c) => ({
        value: partyKey(c.kind, c.id),
        label:
          c.kind === "transporter"
            ? `${c.name} — Transporter`
            : `${c.name} — ${formatCustomerCategory(c.category)}`,
        group: c.kind === "transporter" ? "Transporters" : "Customers",
      })),
    [parties],
  );

  const downloadColumns = [
    { key: "date", header: "Date" },
    { key: "customer", header: "Customer" },
    { key: "type", header: "Type" },
    { key: "amount", header: "Amount", align: "right" as const },
    { key: "origin", header: "Domestic / Imported" },
    { key: "remarks", header: "Remarks" },
  ];
  const downloadRows = useMemo(
    () =>
      exportRows.map((row) => ({
        date: formatDateDdMmYyyy(row.date),
        customer: partyLabel(row),
        type: statusLabel(row.status),
        amount: formatRs(row.amount),
        origin: formatCoalOrigin(row.coalOrigin),
        remarks: row.remarks || "—",
      })),
    [exportRows],
  );

  function payloadFrom(form: FormState) {
    const party = parsePartyKey(form.partyId);
    return {
      date: form.date,
      customerId: party.kind === "customer" ? party.id : null,
      transporterId: party.kind === "transporter" ? party.id : null,
      status: form.status,
      amount: form.amount,
      coalOrigin: form.coalOrigin,
      remarks: form.remarks,
    };
  }

  function validate(form: FormState): string | null {
    if (!form.partyId) return "Customer or transporter is required";
    if (!form.status) return "Select Discount Received or Discount Paid";
    if (!form.amount || Number(form.amount) <= 0) {
      return "Amount must be greater than zero";
    }
    if (!form.coalOrigin) return "Select Domestic coal or Imported coal";
    if (!form.remarks.trim()) return "Remarks are required";
    return null;
  }

  function goToPage(targetPage: number) {
    router.push(
      paymentsHref({ tab: "discount", page: targetPage, ...listFilters }),
    );
    router.refresh();
  }

  function startEdit(row: DiscountRow) {
    // Defer so the Edit click is not delivered to Update/Cancel, which
    // appear in the same place and would close edit mode immediately.
    window.setTimeout(() => {
      setEditingId(row.id);
      setEditForm(formFromRow(row));
      setError(null);
    }, 0);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm());
  }

  function onAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const message = validate(addForm);
    if (message) {
      setError(message);
      return;
    }
    const payload = payloadFrom(addForm);
    startTransition(async () => {
      try {
        await createDiscount(payload);
        setAddForm((prev) => resetAddFormAfterSave(prev));
        goToPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function saveEdit() {
    if (!editingId) return;
    setError(null);
    const message = validate(editForm);
    if (message) {
      setError(message);
      return;
    }
    const payload = payloadFrom(editForm);
    const id = editingId;
    startTransition(async () => {
      try {
        await updateDiscount(id, payload);
        cancelEdit();
        goToPage(page);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onUpdate(e: FormEvent) {
    e.preventDefault();
    saveEdit();
  }

  function onDelete(row: DiscountRow) {
    if (!confirm(`Delete discount of ${formatRs(row.amount)}?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteDiscount(row.id);
        if (editingId === row.id) cancelEdit();
        const remainingOnPage = rows.length - 1;
        const nextPage =
          remainingOnPage === 0 && page > 1 ? page - 1 : page;
        goToPage(nextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Fund Flow</h1>
        <TableDownloadButtons
          title="Fund Flow — Discount"
          filenameBase="fund-flow-discount"
          columns={downloadColumns}
          rows={downloadRows}
        />
      </div>

      {totals ? (
        <FundFlowTotals
          receivedLabel="Discount received"
          paidLabel="Discount paid"
          received={totals.received}
          paid={totals.paid}
          net={totals.net}
        />
      ) : null}

      <div className="filters">
        <FundFlowDateFilter
          tab="discount"
          dateFrom={dateFrom}
          dateTo={dateTo}
          party={party}
          type={type}
          parties={parties}
        />
      </div>

      <PaymentsTabs active="discount" {...listFilters} />

      {error && <div className="error-box">{error}</div>}

      <div className="table-wrap payments-table-wrap">
        <div className="table-h-scroll"><table className="data payments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Type</th>
              <th className="cell-num">Amount</th>
              <th>Domestic / Imported</th>
              <th>Remarks</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr className="payment-entry-row">
              <td>
                <input
                  form="discount-add-form"
                  type="date"
                  required
                  className="field-input"
                  aria-label="Date"
                  value={addForm.date}
                  onChange={(e) =>
                    setAddForm({ ...addForm, date: e.target.value })
                  }
                />
              </td>
              <td>
                <SearchableSelect
                  form="discount-add-form"
                  required
                  className="field-input"
                  ariaLabel="Customer or transporter"
                  placeholder="Search customer or transporter"
                  value={addForm.partyId}
                  onChange={(partyId) => setAddForm({ ...addForm, partyId })}
                  options={partyOptions}
                />
              </td>
              <td>
                <select
                  form="discount-add-form"
                  required
                  className="field-input"
                  aria-label="Type"
                  value={addForm.status}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      status: e.target.value as Status,
                    })
                  }
                >
                  <option value="">Select</option>
                  <option value="RECEIVED">Discount Received</option>
                  <option value="PAID">Discount Paid</option>
                </select>
              </td>
              <td className="cell-num payment-amount-cell">
                <input
                  form="discount-add-form"
                  type="text"
                  inputMode="decimal"
                  required
                  className="field-input"
                  placeholder="0.00"
                  aria-label="Amount"
                  value={addAmountDisplay}
                  onChange={(e) => {
                    const next = changeAmount(addForm, e.target.value);
                    if (next) setAddForm(next);
                  }}
                />
              </td>
              <td>
                <select
                  form="discount-add-form"
                  required
                  className="field-input"
                  aria-label="Domestic / Imported"
                  value={addForm.coalOrigin}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      coalOrigin: e.target.value as CoalOriginValue,
                    })
                  }
                >
                  <option value="">Select</option>
                  <option value="DOMESTIC">Domestic coal</option>
                  <option value="IMPORTED">Imported coal</option>
                </select>
              </td>
              <td>
                <input
                  form="discount-add-form"
                  type="text"
                  required
                  className="field-input"
                  placeholder="Write remarks…"
                  aria-label="Remarks"
                  value={addForm.remarks}
                  onChange={(e) =>
                    setAddForm({ ...addForm, remarks: e.target.value })
                  }
                />
              </td>
              <td className="space-x-2 whitespace-nowrap">
                <button
                  form="discount-add-form"
                  type="submit"
                  className="btn btn-sm"
                  disabled={pending || editingId != null}
                >
                  Add
                </button>
              </td>
            </tr>

            {rows.map((row, index) => {
              const prevDate = index > 0 ? rows[index - 1].date : null;
              const dateBreak = prevDate != null && prevDate !== row.date;
              const isEditing = editingId === row.id;
              return (
                <tr
                  key={row.id}
                  className={[
                    dateBreak ? "payment-date-break" : "",
                    isEditing ? "payment-editing-row" : "",
                    rowTypeClass(row.status),
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined}
                >
                  {isEditing ? (
                    <>
                      <td>
                        <input
                          form="discount-edit-form"
                          type="date"
                          required
                          className="field-input"
                          aria-label="Date"
                          value={editForm.date}
                          onChange={(e) =>
                            setEditForm({ ...editForm, date: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <SearchableSelect
                          form="discount-edit-form"
                          required
                          className="field-input"
                          ariaLabel="Customer or transporter"
                          placeholder="Search customer or transporter"
                          value={editForm.partyId}
                          onChange={(partyId) =>
                            setEditForm({ ...editForm, partyId })
                          }
                          options={partyOptions}
                        />
                      </td>
                      <td>
                        <select
                          form="discount-edit-form"
                          required
                          className="field-input"
                          aria-label="Type"
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              status: e.target.value as Status,
                            })
                          }
                        >
                          <option value="RECEIVED">Discount Received</option>
                          <option value="PAID">Discount Paid</option>
                        </select>
                      </td>
                      <td className="cell-num payment-amount-cell">
                        <input
                          form="discount-edit-form"
                          type="text"
                          inputMode="decimal"
                          required
                          className="field-input"
                          placeholder="0.00"
                          aria-label="Amount"
                          value={editAmountDisplay}
                          onChange={(e) => {
                            const next = changeAmount(editForm, e.target.value);
                            if (next) setEditForm(next);
                          }}
                        />
                      </td>
                      <td>
                        <select
                          form="discount-edit-form"
                          required
                          className="field-input"
                          aria-label="Domestic / Imported"
                          value={editForm.coalOrigin}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              coalOrigin: e.target.value as CoalOriginValue,
                            })
                          }
                        >
                          <option value="DOMESTIC">Domestic coal</option>
                          <option value="IMPORTED">Imported coal</option>
                        </select>
                      </td>
                      <td>
                        <input
                          form="discount-edit-form"
                          type="text"
                          required
                          className="field-input"
                          placeholder="Write remarks…"
                          aria-label="Remarks"
                          value={editForm.remarks}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              remarks: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td className="space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={saveEdit}
                          disabled={pending}
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={cancelEdit}
                          disabled={pending}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{formatDateDdMmYyyy(row.date)}</td>
                      <td>
                        <PartyNameLink
                          customerId={row.customerId}
                          transporterId={row.transporterId}
                          name={row.customerName}
                        />
                      </td>
                      <td className={typeClass(row.status)}>
                        {statusLabel(row.status)}
                      </td>
                      <td className={`cell-num ${typeClass(row.status)}`}>
                        {formatRs(row.amount)}
                      </td>
                      <td>{formatCoalOrigin(row.coalOrigin)}</td>
                      <td>{row.remarks || "—"}</td>
                      <td className="space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => startEdit(row)}
                          disabled={pending}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => onDelete(row)}
                          disabled={pending}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={7}>
                  {hasListFilters(dateFrom, dateTo, party, type)
                    ? "No discounts match these filters."
                    : "No discounts yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>

      {totalPages > 1 && (
        <div className="payments-pagination">
          <span>
            {from}–{to} of {total}
          </span>
          <div className="payments-pagination-actions">
            {page > 1 && (
              <Link
                href={paymentsHref({
                  tab: "discount",
                  page: page - 1,
                  ...listFilters,
                })}
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
                href={paymentsHref({
                  tab: "discount",
                  page: page + 1,
                  ...listFilters,
                })}
                className="btn btn-secondary btn-sm"
                prefetch={false}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}

      <form id="discount-add-form" onSubmit={onAdd} hidden />
      <form id="discount-edit-form" onSubmit={onUpdate} hidden />
    </div>
  );
}
