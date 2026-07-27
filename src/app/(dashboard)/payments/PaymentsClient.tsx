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
type PlannedCallFilter =
  | ""
  | "today"
  | "tomorrow"
  | "older"
  | "future"
  | "none";
type CollectionSortKey = "due" | "overdue";
type SortDir = "asc" | "desc";

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
  return direction === "RECEIVED" ? "Fund Received" : "Fund Paid";
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
  if (filter === "none") return !p;
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

function distinctTrimmed(values: Array<string | null | undefined>): string[] {
  const names = new Set<string>();
  for (const value of values) {
    if (value?.trim()) names.add(value.trim());
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

function numericValue(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function sortIndicator(active: boolean, dir: SortDir): string {
  if (!active) return "";
  return dir === "asc" ? " ↑" : " ↓";
}

function formatDateDdMmYyyy(value: string | null | undefined): string {
  if (!value) return "—";
  const datePart = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
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
  const [approachForFundsFilter, setApproachForFundsFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [savingCallId, setSavingCallId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<CollectionSortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const today = todayLocal();
  const tomorrow = addLocalDays(today, 1);

  function toggleSort(key: CollectionSortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("desc");
  }

  const saleExecutiveOptions = useMemo(
    () => distinctTrimmed(collection.map((row) => row.saleExecutive)),
    [collection],
  );
  const approachForFundsOptions = useMemo(
    () => distinctTrimmed(collection.map((row) => row.approachForFunds)),
    [collection],
  );
  const cityOptions = useMemo(
    () => distinctTrimmed(collection.map((row) => row.city)),
    [collection],
  );
  const stateOptions = useMemo(
    () => distinctTrimmed(collection.map((row) => row.state)),
    [collection],
  );
  const sectorOptions = useMemo(
    () => distinctTrimmed(collection.map((row) => row.sector)),
    [collection],
  );
  const categoryOptions = useMemo(() => {
    const cats = new Set(collection.map((row) => row.category));
    return [...cats].sort((a, b) =>
      formatCustomerCategory(a).localeCompare(formatCustomerCategory(b)),
    );
  }, [collection]);

  const hasActiveFilters = Boolean(
    plannedCallFilter ||
      saleExecutiveFilter ||
      approachForFundsFilter ||
      cityFilter ||
      stateFilter ||
      categoryFilter ||
      sectorFilter,
  );

  const filteredCollection = useMemo(() => {
    const next = collection.filter((row) => {
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
      if (
        approachForFundsFilter &&
        (row.approachForFunds?.trim() ?? "") !== approachForFundsFilter
      ) {
        return false;
      }
      if (cityFilter && (row.city?.trim() ?? "") !== cityFilter) {
        return false;
      }
      if (stateFilter && (row.state?.trim() ?? "") !== stateFilter) {
        return false;
      }
      if (categoryFilter && row.category !== categoryFilter) {
        return false;
      }
      if (sectorFilter && (row.sector?.trim() ?? "") !== sectorFilter) {
        return false;
      }
      return true;
    });
    if (!sortKey) return next;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...next].sort(
      (a, b) =>
        (numericValue(a[sortKey]) - numericValue(b[sortKey])) * dir,
    );
  }, [
    collection,
    plannedCallFilter,
    saleExecutiveFilter,
    approachForFundsFilter,
    cityFilter,
    stateFilter,
    categoryFilter,
    sectorFilter,
    sortKey,
    sortDir,
    today,
    tomorrow,
  ]);

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
      setError("Select Fund Received or Fund Paid");
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
                  <th>Fund Received / Fund Paid</th>
                  <th className="cell-num">Amount</th>
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
                      aria-label="Fund Received or Fund Paid"
                      value={form.direction}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          direction: e.target.value as Direction,
                        })
                      }
                    >
                      <option value="">Select</option>
                      <option value="RECEIVED">Fund Received</option>
                      <option value="SENT">Fund Paid</option>
                    </select>
                  </td>
                  <td className="cell-num">
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

                {rows.map((row, index) => {
                  const prevDate = index > 0 ? rows[index - 1].date : null;
                  const dateBreak =
                    prevDate != null && prevDate !== row.date;
                  return (
                    <tr
                      key={row.id}
                      className={dateBreak ? "payment-date-break" : undefined}
                    >
                      <td>{formatDateDdMmYyyy(row.date)}</td>
                      <td>{row.customerName}</td>
                      <td>{directionLabel(row.direction)}</td>
                      <td className="cell-num">{formatRs(row.amount)}</td>
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
                  );
                })}

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
                <option value="none">Not planned</option>
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
            <label>
              Approach for funds
              <select
                value={approachForFundsFilter}
                onChange={(e) => setApproachForFundsFilter(e.target.value)}
              >
                <option value="">All</option>
                {approachForFundsOptions.map((name) => (
                  <option key={name} value={name}>
                    {capitalizeName(name) ?? name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              City
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="">All</option>
                {cityOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              State
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <option value="">All</option>
                {stateOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Category
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {formatCustomerCategory(category)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sector
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
              >
                <option value="">All</option>
                {sectorOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setPlannedCallFilter("");
                  setSaleExecutiveFilter("");
                  setApproachForFundsFilter("");
                  setCityFilter("");
                  setStateFilter("");
                  setCategoryFilter("");
                  setSectorFilter("");
                }}
              >
                Clear
              </button>
            )}
          </form>

          <div className="table-wrap">
            <table className="data payments-table collection-table">
              <thead>
                <tr>
                  <th className="collection-customer-col">Customer</th>
                  <th>Payment in charge</th>
                  <th>Contact number</th>
                  <th>Sales executive</th>
                  <th className="cell-num">
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort("due")}
                    >
                      Total Due
                      {sortIndicator(sortKey === "due", sortDir)}
                    </button>
                  </th>
                  <th className="cell-num">
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort("overdue")}
                    >
                      Overdue
                      {sortIndicator(sortKey === "overdue", sortDir)}
                    </button>
                  </th>
                  <th>Last payment date</th>
                  <th className="cell-num">Last payment amount</th>
                  <th className="cell-num">Credit period</th>
                  <th>Planned call date</th>
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
                      <td className="collection-customer-col">
                        <Link
                          href={`/reports/customer-analysis/${row.id}`}
                          className="btn-link"
                        >
                          {capitalizeName(row.name) ?? row.name}
                        </Link>
                      </td>
                      <td>
                        {row.paymentInChargeName
                          ? (capitalizeName(row.paymentInChargeName) ??
                            row.paymentInChargeName)
                          : "—"}
                      </td>
                      <td>{row.paymentInChargeContact ?? "—"}</td>
                      <td>
                        {row.saleExecutive
                          ? (capitalizeName(row.saleExecutive) ??
                            row.saleExecutive)
                          : "—"}
                      </td>
                      <td className="cell-num">{formatRs(row.due)}</td>
                      <td className="cell-num">{formatRs(row.overdue)}</td>
                      <td>
                        {formatDateDdMmYyyy(row.lastPaymentDate)}
                      </td>
                      <td className="cell-num">
                        {row.lastPaymentAmount
                          ? formatRs(row.lastPaymentAmount)
                          : "—"}
                      </td>
                      <td className="cell-num">
                        {formatCreditPeriod(row.creditDays)}
                      </td>
                      <td>
                        <input
                          type="date"
                          lang="en-GB"
                          className="field-input collection-date-input"
                          aria-label={`Planned call for ${row.name}`}
                          value={row.plannedCollectionCallDate ?? ""}
                          disabled={savingCallId === row.id || pending}
                          onChange={(e) =>
                            onPlannedCallChange(row.id, e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
                {filteredCollection.length === 0 && (
                  <tr>
                    <td colSpan={10}>
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
