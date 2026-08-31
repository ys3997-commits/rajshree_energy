"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { CustomerCategory } from "@/generated/prisma";
import { AGEING_BUCKETS } from "@/lib/domain/ageingBuckets";
import { capitalizeName, formatAmount } from "@/lib/domain/format";

type AgeingBucketKey = (typeof AGEING_BUCKETS)[number]["key"];
type AgeingReportRow = {
  id: string;
  name: string;
  category: "INDUSTRY" | "TRADER";
  sector: string | null;
  state: string | null;
  totalDue: string;
} & Record<AgeingBucketKey, string>;

type CategoryFilter = "" | "industry" | "trader";
type SortKey = "name" | "totalDue" | AgeingBucketKey;
type SortDir = "asc" | "desc";

const NUMERIC_SORT_KEYS: ReadonlySet<SortKey> = new Set([
  "totalDue",
  ...AGEING_BUCKETS.map((b) => b.key),
]);

function numericValue(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function sortIndicator(active: boolean, dir: SortDir): string {
  if (!active) return "";
  return dir === "asc" ? " ↑" : " ↓";
}

function formatBucket(value: string): string {
  return numericValue(value) === 0 ? "—" : formatAmount(value);
}

function emptyTotals(): Record<AgeingBucketKey, number> {
  return Object.fromEntries(AGEING_BUCKETS.map((b) => [b.key, 0])) as Record<
    AgeingBucketKey,
    number
  >;
}

export function AgeingReportClient({ rows }: { rows: AgeingReportRow[] }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(NUMERIC_SORT_KEYS.has(key) ? "desc" : "asc");
  }

  function matchesCategory(row: AgeingReportRow): boolean {
    if (categoryFilter === "industry") {
      return row.category === CustomerCategory.INDUSTRY;
    }
    if (categoryFilter === "trader") {
      return row.category === CustomerCategory.TRADER;
    }
    return true;
  }

  const sectorOptions = useMemo(() => {
    const names = new Set<string>();
    for (const row of rows) {
      if (!matchesCategory(row)) continue;
      const sector = row.sector?.trim();
      if (sector) names.add(sector);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [categoryFilter, rows]);

  const stateOptions = useMemo(() => {
    const names = new Set<string>();
    for (const row of rows) {
      if (!matchesCategory(row)) continue;
      if (sectorFilter && (row.sector?.trim() ?? "") !== sectorFilter) continue;
      const state = row.state?.trim();
      if (state) names.add(state);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [categoryFilter, rows, sectorFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = rows.filter((row) => {
      if (!matchesCategory(row)) return false;
      if (sectorFilter && (row.sector?.trim() ?? "") !== sectorFilter) {
        return false;
      }
      if (stateFilter && (row.state?.trim() ?? "") !== stateFilter) {
        return false;
      }
      if (q && !row.name.toLowerCase().includes(q)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...matched].sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name) * dir;
      }
      return (numericValue(a[sortKey]) - numericValue(b[sortKey])) * dir;
    });
  }, [categoryFilter, query, rows, sectorFilter, sortDir, sortKey, stateFilter]);

  const totals = useMemo(() => {
    const buckets = emptyTotals();
    let totalDue = 0;
    for (const row of filtered) {
      totalDue += numericValue(row.totalDue);
      for (const bucket of AGEING_BUCKETS) {
        buckets[bucket.key] += numericValue(row[bucket.key]);
      }
    }
    return { totalDue, buckets };
  }, [filtered]);

  const exportColumns = [
    { key: "customer", header: "Customer" },
    { key: "totalDue", header: "Total due", align: "right" as const },
    ...AGEING_BUCKETS.map((bucket) => ({
      key: bucket.key,
      header: bucket.label,
      align: "right" as const,
    })),
  ];

  const exportRows = useMemo(
    () =>
      filtered.map((row) => ({
        customer: row.name,
        totalDue: formatAmount(row.totalDue),
        ...Object.fromEntries(
          AGEING_BUCKETS.map((bucket) => [
            bucket.key,
            formatBucket(row[bucket.key]),
          ]),
        ),
      })),
    [filtered],
  );

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Analysis
            <span aria-hidden="true"> · </span>
            Ageing Report
          </p>
          <h1 className="page-title">Ageing report</h1>
        </div>
        <div className="detail-stat-row">
          <div className="detail-stat">
            <span className="detail-stat-label">Customers</span>
            <span className="detail-stat-value">{filtered.length}</span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Total due</span>
            <span className="detail-stat-value">
              {formatAmount(totals.totalDue.toFixed(2))}
            </span>
          </div>
        </div>
      </div>

      <div className="filters">
        <label>
          Customer
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name"
          />
        </label>
        <label>
          Category
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as CategoryFilter);
              setSectorFilter("");
              setStateFilter("");
            }}
          >
            <option value="">All</option>
            <option value="industry">Industry</option>
            <option value="trader">Trader</option>
          </select>
        </label>
        <label>
          Sector
          <select
            value={sectorFilter}
            onChange={(e) => {
              setSectorFilter(e.target.value);
              setStateFilter("");
            }}
          >
            <option value="">All</option>
            {sectorOptions.map((name) => (
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
        <TableDownloadButtons
          title="Ageing report"
          filenameBase="ageing-report"
          columns={exportColumns}
          rows={exportRows}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="home-empty">
          {rows.length === 0
            ? "No customers with outstanding due."
            : "No customers match your filter."}
        </p>
      ) : (
        <div className="table-wrap ageing-table-wrap">
          <div className="table-h-scroll">
          <table className="data ageing-table">
            <thead>
              <tr className="ageing-amount-row">
                <th
                  className="ageing-customer-col ageing-customer-col-continued"
                  aria-hidden="true"
                >
                  &nbsp;
                </th>
                <th className="cell-num ageing-total-col">
                  {formatAmount(totals.totalDue.toFixed(2))}
                </th>
                {AGEING_BUCKETS.map((bucket) => (
                  <th key={bucket.key} className="cell-num">
                    {formatBucket(totals.buckets[bucket.key].toFixed(2))}
                  </th>
                ))}
              </tr>
              <tr className="ageing-days-row">
                <th className="ageing-customer-col">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("name")}
                  >
                    Customer name
                    {sortIndicator(sortKey === "name", sortDir)}
                  </button>
                </th>
                <th className="cell-num ageing-total-col">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("totalDue")}
                  >
                    Total due
                    {sortIndicator(sortKey === "totalDue", sortDir)}
                  </button>
                </th>
                {AGEING_BUCKETS.map((bucket) => (
                  <th key={bucket.key} className="cell-num">
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort(bucket.key)}
                    >
                      {bucket.label}
                      {sortIndicator(sortKey === bucket.key, sortDir)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td className="ageing-customer-col">
                    <Link
                      href={`/reports/customer-analysis/${row.id}`}
                      className="btn-link"
                    >
                      {capitalizeName(row.name) ?? row.name}
                    </Link>
                  </td>
                  <td className="cell-num ageing-total-col">
                    {formatAmount(row.totalDue)}
                  </td>
                  {AGEING_BUCKETS.map((bucket) => (
                    <td key={bucket.key} className="cell-num">
                      {formatBucket(row[bucket.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="ageing-customer-col">Total</td>
                <td className="cell-num ageing-total-col">
                  {formatAmount(totals.totalDue.toFixed(2))}
                </td>
                {AGEING_BUCKETS.map((bucket) => (
                  <td key={bucket.key} className="cell-num">
                    {formatBucket(totals.buckets[bucket.key].toFixed(2))}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table></div>
        </div>
      )}
    </div>
  );
}
