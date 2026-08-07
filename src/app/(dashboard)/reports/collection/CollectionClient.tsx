"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { CustomerCategory } from "@/generated/prisma";
import { updatePlannedCollectionCall } from "@/lib/actions/collection";
import type { CustomerDueRow } from "@/lib/actions/customers";
import {
  capitalizeName,
  formatCreditPeriod,
  formatCustomerCategory,
  formatRs,
} from "@/lib/domain/format";

type PlannedCallFilter =
  | ""
  | "today"
  | "tomorrow"
  | "older"
  | "future"
  | "none";
type CollectionSortKey = "name" | "due" | "overdue";
type SortDir = "asc" | "desc";

const BUYER_CATEGORIES = new Set<CustomerCategory>([
  CustomerCategory.INDUSTRY,
  CustomerCategory.TRADER,
]);

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

export function CollectionClient({
  initialRows,
}: {
  initialRows: CustomerDueRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [prevInitialRows, setPrevInitialRows] = useState(initialRows);
  if (initialRows !== prevInitialRows) {
    setPrevInitialRows(initialRows);
    setRows(initialRows);
  }

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [plannedCallFilter, setPlannedCallFilter] =
    useState<PlannedCallFilter>("");
  const [saleExecutiveFilter, setSaleExecutiveFilter] = useState("");
  const [dealingCompanyFilter, setDealingCompanyFilter] = useState("");
  const [approachForFundsFilter, setApproachForFundsFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [savingCallId, setSavingCallId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<CollectionSortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const today = todayLocal();
  const yesterday = addLocalDays(today, -1);
  const tomorrow = addLocalDays(today, 1);

  const buyerRows = useMemo(
    () => rows.filter((row) => BUYER_CATEGORIES.has(row.category)),
    [rows],
  );

  function toggleSort(key: CollectionSortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "name" ? "asc" : "desc");
  }

  const saleExecutiveOptions = useMemo(
    () => distinctTrimmed(buyerRows.map((row) => row.saleExecutive)),
    [buyerRows],
  );
  const dealingCompanyOptions = useMemo(
    () => distinctTrimmed(buyerRows.map((row) => row.dealingCompany)),
    [buyerRows],
  );
  const approachForFundsOptions = useMemo(
    () => distinctTrimmed(buyerRows.map((row) => row.approachForFunds)),
    [buyerRows],
  );
  const cityOptions = useMemo(
    () => distinctTrimmed(buyerRows.map((row) => row.city)),
    [buyerRows],
  );
  const stateOptions = useMemo(
    () => distinctTrimmed(buyerRows.map((row) => row.state)),
    [buyerRows],
  );
  const sectorOptions = useMemo(
    () => distinctTrimmed(buyerRows.map((row) => row.sector)),
    [buyerRows],
  );
  const categoryOptions = useMemo(
    () =>
      [CustomerCategory.INDUSTRY, CustomerCategory.TRADER].sort((a, b) =>
        formatCustomerCategory(a).localeCompare(formatCustomerCategory(b)),
      ),
    [],
  );

  const hasActiveFilters = Boolean(
    plannedCallFilter ||
      saleExecutiveFilter ||
      dealingCompanyFilter ||
      approachForFundsFilter ||
      cityFilter ||
      stateFilter ||
      categoryFilter ||
      sectorFilter,
  );

  const filteredRows = useMemo(() => {
    const next = buyerRows.filter((row) => {
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
      if (categoryFilter && row.category !== categoryFilter) return false;
      if (
        saleExecutiveFilter &&
        (row.saleExecutive?.trim() ?? "") !== saleExecutiveFilter
      ) {
        return false;
      }
      if (
        dealingCompanyFilter &&
        (row.dealingCompany?.trim() ?? "") !== dealingCompanyFilter
      ) {
        return false;
      }
      if (
        approachForFundsFilter &&
        (row.approachForFunds?.trim() ?? "") !== approachForFundsFilter
      ) {
        return false;
      }
      if (cityFilter && (row.city?.trim() ?? "") !== cityFilter) return false;
      if (stateFilter && (row.state?.trim() ?? "") !== stateFilter) return false;
      if (sectorFilter && (row.sector?.trim() ?? "") !== sectorFilter) {
        return false;
      }
      return true;
    });

    if (!sortKey) return next;
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name") {
      return [...next].sort((a, b) => a.name.localeCompare(b.name) * dir);
    }
    return [...next].sort(
      (a, b) => (numericValue(a[sortKey]) - numericValue(b[sortKey])) * dir,
    );
  }, [
    buyerRows,
    plannedCallFilter,
    saleExecutiveFilter,
    dealingCompanyFilter,
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

  function onPlannedCallChange(customerId: string, value: string) {
    const nextDate = value.trim() === "" ? null : value;
    setError(null);
    setRows((prev) =>
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
        setRows((prev) =>
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

  return (
    <>
      {error && <div className="error-box">{error}</div>}

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
          Dealing company
          <select
            value={dealingCompanyFilter}
            onChange={(e) => setDealingCompanyFilter(e.target.value)}
          >
            <option value="">All</option>
            {dealingCompanyOptions.map((name) => (
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
              setDealingCompanyFilter("");
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
              <th className="collection-customer-col">
                <button
                  type="button"
                  className="th-sort"
                  onClick={() => toggleSort("name")}
                >
                  Customer
                  {sortIndicator(sortKey === "name", sortDir)}
                </button>
              </th>
              <th>
                Payment
                <br />
                in charge
              </th>
              <th>
                Contact
                <br />
                number
              </th>
              <th>
                Sales
                <br />
                executive
              </th>
              <th>
                Dealing
                <br />
                company
              </th>
              <th className="cell-num">
                <button
                  type="button"
                  className="th-sort"
                  onClick={() => toggleSort("due")}
                >
                  Total
                  <br />
                  Due
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
              <th>
                Last
                <br />
                payment date
              </th>
              <th className="cell-num">
                Last
                <br />
                payment amount
              </th>
              <th className="cell-num">
                Credit
                <br />
                period
              </th>
              <th>
                Planned
                <br />
                call date
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const lastPaidYesterday =
                normalizePlannedDate(row.lastPaymentDate) === yesterday;
              return (
                <tr
                  key={row.id}
                  className={
                    lastPaidYesterday ? "payment-row-yesterday" : undefined
                  }
                >
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
                      ? (capitalizeName(row.saleExecutive) ?? row.saleExecutive)
                      : "—"}
                  </td>
                  <td>
                    {row.dealingCompany
                      ? (capitalizeName(row.dealingCompany) ??
                        row.dealingCompany)
                      : "—"}
                  </td>
                  <td className="cell-num">{formatRs(row.due)}</td>
                  <td className="cell-num">{formatRs(row.overdue)}</td>
                  <td>{formatDateDdMmYyyy(row.lastPaymentDate)}</td>
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
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={11}>
                  {buyerRows.length === 0
                    ? "No outstanding dues."
                    : "No customers match these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
