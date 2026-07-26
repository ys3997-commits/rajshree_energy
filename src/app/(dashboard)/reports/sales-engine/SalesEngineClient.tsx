"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  updatePlannedSaleCall,
  type SalesEngineRow,
} from "@/lib/actions/salesEngine";
import {
  capitalizeName,
  formatCustomerCategory,
  formatMt,
  formatRs,
} from "@/lib/domain/format";

type PlannedCallFilter =
  | ""
  | "today"
  | "tomorrow"
  | "older"
  | "future"
  | "none";
type SortKey = "soldQuantity" | "due" | "overdue";
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

function rowHighlightClass(
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

export function SalesEngineClient({
  initialRows,
}: {
  initialRows: SalesEngineRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [prevInitial, setPrevInitial] = useState(initialRows);
  if (initialRows !== prevInitial) {
    setPrevInitial(initialRows);
    setRows(initialRows);
  }

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [savingCallId, setSavingCallId] = useState<string | null>(null);

  const [plannedCallFilter, setPlannedCallFilter] =
    useState<PlannedCallFilter>("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const today = todayLocal();
  const tomorrow = addLocalDays(today, 1);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("desc");
  }

  const cityOptions = useMemo(
    () => distinctTrimmed(rows.map((row) => row.city)),
    [rows],
  );
  const stateOptions = useMemo(
    () => distinctTrimmed(rows.map((row) => row.state)),
    [rows],
  );
  const sectorOptions = useMemo(
    () => distinctTrimmed(rows.map((row) => row.sector)),
    [rows],
  );
  const categoryOptions = useMemo(() => {
    const cats = new Set(rows.map((row) => row.category));
    return [...cats].sort((a, b) =>
      formatCustomerCategory(a).localeCompare(formatCustomerCategory(b)),
    );
  }, [rows]);

  const hasActiveFilters = Boolean(
    plannedCallFilter ||
      cityFilter ||
      stateFilter ||
      categoryFilter ||
      sectorFilter,
  );

  const filtered = useMemo(() => {
    const next = rows.filter((row) => {
      if (
        !matchesPlannedCallFilter(
          row.plannedSaleCallDate,
          plannedCallFilter,
          today,
          tomorrow,
        )
      ) {
        return false;
      }
      if (cityFilter && (row.city?.trim() ?? "") !== cityFilter) return false;
      if (stateFilter && (row.state?.trim() ?? "") !== stateFilter) return false;
      if (categoryFilter && row.category !== categoryFilter) return false;
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
    rows,
    plannedCallFilter,
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
          ? { ...row, plannedSaleCallDate: nextDate }
          : row,
      ),
    );
    setSavingCallId(customerId);
    startTransition(async () => {
      try {
        const result = await updatePlannedSaleCall(customerId, nextDate);
        setRows((prev) =>
          prev.map((row) =>
            row.id === customerId
              ? { ...row, plannedSaleCallDate: result.plannedSaleCallDate }
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
    <div>
      {error && <p className="form-error">{error}</p>}

      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <label>
          Planning call
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
              <th>Customer name</th>
              <th>Purchaser name</th>
              <th>Phone number</th>
              <th>Role of purchaser</th>
              <th>Sale executive</th>
              <th className="cell-num">Order in hand (MT)</th>
              <th className="cell-num">
                <button
                  type="button"
                  className="th-sort"
                  onClick={() => toggleSort("soldQuantity")}
                >
                  Sold quantity (MT)
                  {sortIndicator(sortKey === "soldQuantity", sortDir)}
                </button>
              </th>
              <th>Last dispatch date</th>
              <th className="cell-num">
                <button
                  type="button"
                  className="th-sort"
                  onClick={() => toggleSort("due")}
                >
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
              <th>Planned call</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const rowClass = rowHighlightClass(row.plannedSaleCallDate, today);
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
                  <td>
                    {row.purchaserName
                      ? (capitalizeName(row.purchaserName) ?? row.purchaserName)
                      : "—"}
                  </td>
                  <td>{row.purchaserContact ?? "—"}</td>
                  <td>{row.purchaserRole ?? "—"}</td>
                  <td>
                    {row.saleExecutive
                      ? (capitalizeName(row.saleExecutive) ?? row.saleExecutive)
                      : "—"}
                  </td>
                  <td className="cell-num">{formatMt(row.orderInHand)}</td>
                  <td className="cell-num">{formatMt(row.soldQuantity)}</td>
                  <td>{row.lastDispatchDate ?? "—"}</td>
                  <td className="cell-num">{formatRs(row.due)}</td>
                  <td className="cell-num">{formatRs(row.overdue)}</td>
                  <td>
                    <input
                      type="date"
                      className="field-input collection-date-input"
                      aria-label={`Planned sales call for ${row.name}`}
                      value={row.plannedSaleCallDate ?? ""}
                      disabled={savingCallId === row.id || pending}
                      onChange={(e) =>
                        onPlannedCallChange(row.id, e.target.value)
                      }
                    />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11}>
                  {rows.length === 0
                    ? "No active customers."
                    : "No customers match these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
