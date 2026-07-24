"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { updatePlannedCollectionCall } from "@/lib/actions/collection";
import type { CustomerDueRow } from "@/lib/actions/customers";
import {
  createPayment,
  deletePayment,
  updatePayment,
  type PaymentListResult,
  type PaymentRow,
} from "@/lib/actions/payments";
import {
  capitalizeName,
  formatCreditPeriod,
  formatCustomerCategory,
  formatRs,
} from "@/lib/domain/format";

type Opt = { id: string; name: string };
type Direction = "RECEIVED" | "SENT" | "";
type Tab = "transactions" | "collection";
type PlannedCallFilter = "" | "today" | "tomorrow" | "older" | "future";

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addLocalDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function emptyForm(customerId = "") {
  return {
    date: todayLocal(),
    customerId,
    direction: "" as Direction,
    amount: "",
  };
}

function directionLabel(direction: string): string {
  return direction === "RECEIVED" ? "Received" : "Sent";
}

function pageHref(page: number): string {
  return page <= 1 ? "/payments" : `/payments?page=${page}`;
}

function normalizePlannedDate(value: string | null | undefined): string | null {
  if (value == null || value === "") return null;
  return value.trim().slice(0, 10);
}

function matchesPlannedCallFilter(
  plannedDate: string | null,
  filter: PlannedCallFilter,
  today: string,
  tomorrow: string,
): boolean {
  if (!filter) return true;
  const p = normalizePlannedDate(plannedDate);
  if (!p) return false;
  if (filter === "today") return p === today;
  if (filter === "tomorrow") return p === tomorrow;
  if (filter === "older") return p < today;
  return p > tomorrow;
}

function collectionRowHighlightClass(
  planned: string | null,
  today: string,
): string | undefined {
  const p = normalizePlannedDate(planned);
  if (!p) return undefined;
  if (p === today) return "collection-row-call-today";
  if (p < today) return "collection-row-due-call";
  return undefined;
}

export function PaymentsClient({
  initial,
  customers,
  collection: initialCollection,
  initialTab,
}: {
  initial: PaymentListResult;
  customers: Opt[];
  collection: CustomerDueRow[];
  initialTab: Tab;
}) {
  const router = useRouter();
  const { rows, total, page, pageSize, totalPages } = initial;

  const [tab, setTab] = useState<Tab>(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setTab(initialTab);
  }

  const [collection, setCollection] = useState(initialCollection);
  const [prevInitialCollection, setPrevInitialCollection] =
    useState(initialCollection);
  if (initialCollection !== prevInitialCollection) {
    setPrevInitialCollection(initialCollection);
    setCollection(initialCollection);
  }

  const [form, setForm] = useState(() => emptyForm());
  const [editing, setEditing] = useState<PaymentRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [plannedCallFilter, setPlannedCallFilter] =
    useState<PlannedCallFilter>("");
  const [saleExecutiveFilter, setSaleExecutiveFilter] = useState("");
  const [savingCallId, setSavingCallId] = useState<string | null>(null);

  const today = todayLocal();
  const tomorrow = addLocalDays(today, 1);

  const saleExecutiveOptions = useMemo(() => {
    const names = new Set<string>();
    for (const row of collection) {
      if (row.saleExecutive?.trim()) names.add(row.saleExecutive.trim());
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [collection]);

  const filteredCollection = useMemo(() => {
    return collection.filter((row) => {
      if (
        !matchesPlannedCallFilter(
          row.plannedCollectionCallDate,
          plannedCallFilter,
          today,
          tomorrow,
        )
      ) {
        return false;
      }
      if (
        saleExecutiveFilter &&
        (row.saleExecutive?.trim() ?? "") !== saleExecutiveFilter
      ) {
        return false;
      }
      return true;
    });
  }, [collection, plannedCallFilter, saleExecutiveFilter, today, tomorrow]);

  function resetForm(customerId = "") {
    setEditing(null);
    setForm(emptyForm(customerId));
  }

  function switchTab(next: Tab) {
    setTab(next);
    setError(null);
    if (next === "collection") {
      router.replace("/payments?tab=collection");
    } else {
      router.replace(pageHref(page));
    }
  }

  function onPlannedCallChange(customerId: string, value: string) {
    const nextDate = value.trim() === "" ? null : value;
    setError(null);
    setCollection((prev) =>
      prev.map((row) =>
        row.id === customerId
          ? { ...row, plannedCollectionCallDate: nextDate }
          : row,
      ),
    );
    setSavingCallId(customerId);
    startTransition(async () => {
      try {
        const result = await updatePlannedCollectionCall(customerId, nextDate);
        setCollection((prev) =>
          prev.map((row) =>
            row.id === customerId
              ? {
                  ...row,
                  plannedCollectionCallDate: result.plannedCollectionCallDate,
                }
              : row,
          ),
        );
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to save planned call",
        );
        router.refresh();
      } finally {
        setSavingCallId(null);
      }
    });
  }

  function startEdit(row: PaymentRow) {
    setEditing(row);
    setForm({
      date: row.date,
      customerId: row.customerId,
      direction: row.direction,
      amount: row.amount,
    });
    setError(null);
  }

  function goToPage(targetPage: number) {
    router.push(pageHref(targetPage));
    router.refresh();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.customerId) {
      setError("Customer is required");
      return;
    }
    if (!form.direction) {
      setError("Select Received or Sent");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    const payload = {
      date: form.date,
      customerId: form.customerId,
      direction: form.direction,
      amount: form.amount,
    };

    startTransition(async () => {
      try {
        if (editing) {
          await updatePayment(editing.id, payload);
          resetForm();
          goToPage(page);
        } else {
          await createPayment(payload);
          resetForm();
          goToPage(1);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onDelete(row: PaymentRow) {
    if (!confirm(`Delete payment of ${formatRs(row.amount)}?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deletePayment(row.id);
        if (editing?.id === row.id) resetForm();
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
      <h1 className="page-title">Payments</h1>
      <p className="page-subtitle">
        Record money received from or sent to customers, and track collection.
      </p>

      <nav className="ca-tabs" aria-label="Payments sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "transactions"}
          className={tab === "transactions" ? "ca-tab ca-tab-active" : "ca-tab"}
          onClick={() => switchTab("transactions")}
        >
          Transactions
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "collection"}
          className={tab === "collection" ? "ca-tab ca-tab-active" : "ca-tab"}
          onClick={() => switchTab("collection")}
        >
          Collection
          <span className="ca-tab-count">{collection.length}</span>
        </button>
      </nav>

      {error && <div className="error-box">{error}</div>}

      {tab === "transactions" && (
        <>
          <div className="table-wrap">
            <table className="data payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Received / Sent</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr className="payment-entry-row">
                  <td>
                    <input
                      form="payment-entry-form"
                      type="date"
                      required
                      className="field-input"
                      aria-label="Date"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <select
                      form="payment-entry-form"
                      required
                      className="field-input"
                      aria-label="Customer"
                      value={form.customerId}
                      onChange={(e) =>
                        setForm({ ...form, customerId: e.target.value })
                      }
                    >
                      <option value="">Select customer</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      form="payment-entry-form"
                      required
                      className="field-input"
                      aria-label="Received or Sent"
                      value={form.direction}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          direction: e.target.value as Direction,
                        })
                      }
                    >
                      <option value="">Select</option>
                      <option value="RECEIVED">Received</option>
                      <option value="SENT">Sent</option>
                    </select>
                  </td>
                  <td>
                    <input
                      form="payment-entry-form"
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      className="field-input"
                      placeholder="0.00"
                      aria-label="Amount"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                    />
                  </td>
                  <td className="space-x-2 whitespace-nowrap">
                    <button
                      form="payment-entry-form"
                      type="submit"
                      className="btn btn-sm"
                      disabled={pending}
                    >
                      {editing ? "Update" : "Add"}
                    </button>
                    {editing && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => resetForm()}
                        disabled={pending}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>

                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.customerName}</td>
                    <td>{directionLabel(row.direction)}</td>
                    <td>{formatRs(row.amount)}</td>
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
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5}>No payments yet.</td>
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
                    href={pageHref(page - 1)}
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
                    href={pageHref(page + 1)}
                    className="btn btn-secondary btn-sm"
                    prefetch={false}
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}

          <form id="payment-entry-form" onSubmit={onSubmit} hidden />
        </>
      )}

      {tab === "collection" && (
        <>
          <form className="filters" onSubmit={(e) => e.preventDefault()}>
            <label>
              Planned call
              <select
                value={plannedCallFilter}
                onChange={(e) =>
                  setPlannedCallFilter(e.target.value as PlannedCallFilter)
                }
              >
                <option value="">All</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="older">Older</option>
                <option value="future">Future</option>
              </select>
            </label>
            <label>
              Sales executive
              <select
                value={saleExecutiveFilter}
                onChange={(e) => setSaleExecutiveFilter(e.target.value)}
              >
                <option value="">All</option>
                {saleExecutiveOptions.map((name) => (
                  <option key={name} value={name}>
                    {capitalizeName(name) ?? name}
                  </option>
                ))}
              </select>
            </label>
            {(plannedCallFilter || saleExecutiveFilter) && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setPlannedCallFilter("");
                  setSaleExecutiveFilter("");
                }}
              >
                Clear
              </button>
            )}
          </form>

          <div className="table-wrap">
            <table className="data payments-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Sales executive</th>
                  <th>Credit period</th>
                  <th>Planned call</th>
                  <th className="cell-num">Due</th>
                  <th className="cell-num">Overdue</th>
                  <th>Last payment</th>
                  <th className="cell-num">Last amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredCollection.map((row) => {
                  const rowClass = collectionRowHighlightClass(
                    row.plannedCollectionCallDate,
                    today,
                  );
                  return (
                    <tr key={row.id} className={rowClass}>
                      <td>
                        <Link
                          href={`/reports/customer-analysis/${row.id}`}
                          className="btn-link"
                        >
                          {capitalizeName(row.name) ?? row.name}
                        </Link>
                      </td>
                      <td>{formatCustomerCategory(row.category)}</td>
                      <td>
                        {row.saleExecutive
                          ? (capitalizeName(row.saleExecutive) ??
                            row.saleExecutive)
                          : "—"}
                      </td>
                      <td>{formatCreditPeriod(row.creditDays)}</td>
                      <td>
                        <input
                          type="date"
                          className="field-input collection-date-input"
                          aria-label={`Planned call for ${row.name}`}
                          value={row.plannedCollectionCallDate ?? ""}
                          disabled={savingCallId === row.id || pending}
                          onChange={(e) =>
                            onPlannedCallChange(row.id, e.target.value)
                          }
                        />
                      </td>
                      <td className="cell-num">{formatRs(row.due)}</td>
                      <td className="cell-num">{formatRs(row.overdue)}</td>
                      <td>{row.lastPaymentDate ?? "—"}</td>
                      <td className="cell-num">
                        {row.lastPaymentAmount
                          ? formatRs(row.lastPaymentAmount)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
                {filteredCollection.length === 0 && (
                  <tr>
                    <td colSpan={9}>
                      {collection.length === 0
                        ? "No outstanding dues."
                        : "No customers match these filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
