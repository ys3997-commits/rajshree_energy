"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CustomerCategory } from "@/generated/prisma";
import type { CustomerDueRow } from "@/lib/actions/customers";
import {
  capitalizeName,
  formatCreditPeriod,
  formatAmount,
} from "@/lib/domain/format";

type CollectionSortKey = "due" | "overdue";
type SortDir = "asc" | "desc";

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

export function VendorCollectionClient({
  initialRows,
}: {
  initialRows: CustomerDueRow[];
}) {
  const [saleExecutiveFilter, setSaleExecutiveFilter] = useState("");
  const [approachForFundsFilter, setApproachForFundsFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [sortKey, setSortKey] = useState<CollectionSortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const vendorRows = useMemo(
    () =>
      initialRows.filter((row) => row.category === CustomerCategory.SUPPLIER),
    [initialRows],
  );

  function toggleSort(key: CollectionSortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("desc");
  }

  const saleExecutiveOptions = useMemo(
    () => distinctTrimmed(vendorRows.map((row) => row.saleExecutive)),
    [vendorRows],
  );
  const approachForFundsOptions = useMemo(
    () => distinctTrimmed(vendorRows.map((row) => row.approachForFunds)),
    [vendorRows],
  );
  const cityOptions = useMemo(
    () => distinctTrimmed(vendorRows.map((row) => row.city)),
    [vendorRows],
  );
  const stateOptions = useMemo(
    () => distinctTrimmed(vendorRows.map((row) => row.state)),
    [vendorRows],
  );
  const sectorOptions = useMemo(
    () => distinctTrimmed(vendorRows.map((row) => row.sector)),
    [vendorRows],
  );

  const hasActiveFilters = Boolean(
    saleExecutiveFilter ||
      approachForFundsFilter ||
      cityFilter ||
      stateFilter ||
      sectorFilter,
  );

  const filteredRows = useMemo(() => {
    const next = vendorRows.filter((row) => {
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
      if (cityFilter && (row.city?.trim() ?? "") !== cityFilter) return false;
      if (stateFilter && (row.state?.trim() ?? "") !== stateFilter) return false;
      if (sectorFilter && (row.sector?.trim() ?? "") !== sectorFilter) {
        return false;
      }
      return true;
    });

    if (!sortKey) return next;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...next].sort(
      (a, b) => (numericValue(a[sortKey]) - numericValue(b[sortKey])) * dir,
    );
  }, [
    vendorRows,
    saleExecutiveFilter,
    approachForFundsFilter,
    cityFilter,
    stateFilter,
    sectorFilter,
    sortKey,
    sortDir,
  ]);

  return (
    <>
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
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
              setSaleExecutiveFilter("");
              setApproachForFundsFilter("");
              setCityFilter("");
              setStateFilter("");
              setSectorFilter("");
            }}
          >
            Clear
          </button>
        )}
      </form>

      <div className="table-wrap">
        <div className="table-h-scroll"><table className="data">
          <thead>
            <tr>
              <th className="report-customer-col">Customer</th>
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
              <th className="cell-num">Credit period</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td className="report-customer-col">
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
                <td className="cell-num">{formatAmount(row.due)}</td>
                <td className="cell-num">{formatAmount(row.overdue)}</td>
                <td className="cell-num">
                  {formatCreditPeriod(row.creditDays)}
                </td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={7}>
                  {vendorRows.length === 0
                    ? "No outstanding dues."
                    : "No vendors match these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
