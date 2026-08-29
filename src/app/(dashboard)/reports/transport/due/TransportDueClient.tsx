"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { TransportDueRow } from "@/lib/actions/transportDue";
import { capitalizeName, formatDateDdMmYyyy, formatAmount } from "@/lib/domain/format";

type SortKey = "due" | "transporterDue";
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

export function TransportDueClient({
  initialRows,
}: {
  initialRows: TransportDueRow[];
}) {
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("desc");
  }

  const cityOptions = useMemo(
    () => distinctTrimmed(initialRows.map((row) => row.city)),
    [initialRows],
  );
  const stateOptions = useMemo(
    () => distinctTrimmed(initialRows.map((row) => row.state)),
    [initialRows],
  );

  const hasActiveFilters = Boolean(cityFilter || stateFilter);

  const filteredRows = useMemo(() => {
    const next = initialRows.filter((row) => {
      if (cityFilter && (row.city?.trim() ?? "") !== cityFilter) return false;
      if (stateFilter && (row.state?.trim() ?? "") !== stateFilter) return false;
      return true;
    });

    if (!sortKey) return next;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...next].sort(
      (a, b) => (numericValue(a[sortKey]) - numericValue(b[sortKey])) * dir,
    );
  }, [initialRows, cityFilter, stateFilter, sortKey, sortDir]);

  const totals = useMemo(() => {
    let due = 0;
    let transporterDue = 0;
    for (const row of filteredRows) {
      due += numericValue(row.due);
      transporterDue += numericValue(row.transporterDue);
    }
    return { due, transporterDue };
  }, [filteredRows]);

  const exportColumns = [
    { key: "transporter", header: "Transporter" },
    { key: "owner", header: "Owner" },
    { key: "contact", header: "Contact" },
    { key: "city", header: "City" },
    { key: "state", header: "State" },
    { key: "due", header: "Transport due", align: "right" as const },
    { key: "transporterDue", header: "Transport due after TDS", align: "right" as const },
    { key: "lastFundPaidDate", header: "Date of last fund paid", align: "center" as const },
    {
      key: "lastFundPaidAmount",
      header: "Amount of last fund paid",
      align: "right" as const,
    },
  ];

  const exportRows = filteredRows.map((row) => ({
    transporter: capitalizeName(row.name) ?? row.name,
    owner: row.ownerName ? (capitalizeName(row.ownerName) ?? row.ownerName) : "—",
    contact: row.ownerContactNumber1 ?? "—",
    city: row.city ?? "—",
    state: row.state ?? "—",
    due: formatAmount(row.due),
    transporterDue: formatAmount(row.transporterDue),
    lastFundPaidDate: formatDateDdMmYyyy(row.lastFundPaidDate),
    lastFundPaidAmount: row.lastFundPaidAmount
      ? formatAmount(row.lastFundPaidAmount)
      : "—",
  }));

  return (
    <>
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
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
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setCityFilter("");
              setStateFilter("");
            }}
          >
            Clear
          </button>
        )}
        <TableDownloadButtons
          title="Transport Due"
          filenameBase="transport-due"
          columns={exportColumns}
          rows={exportRows}
        />
      </form>

      <div className="detail-stat-row transport-due-totals">
        <div className="detail-stat">
          <span className="detail-stat-label">Total Due</span>
          <span className="detail-stat-value">{formatAmount(String(totals.due))}</span>
        </div>
        <div className="detail-stat">
          <span className="detail-stat-label">
            Transport Due
            <br />
            after TDS
          </span>
          <span className="detail-stat-value">
            {formatAmount(String(totals.transporterDue))}
          </span>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-h-scroll"><table className="data">
          <thead>
            <tr>
              <th>Transporter</th>
              <th>Owner</th>
              <th>Contact</th>
              <th>City</th>
              <th>State</th>
              <th className="cell-num">
                <button
                  type="button"
                  className="th-sort"
                  onClick={() => toggleSort("due")}
                >
                  Transport Due
                  {sortIndicator(sortKey === "due", sortDir)}
                </button>
              </th>
              <th className="cell-num">
                <button
                  type="button"
                  className="th-sort"
                  onClick={() => toggleSort("transporterDue")}
                >
                  Transport Due
                  <br />
                  after TDS
                  {sortIndicator(sortKey === "transporterDue", sortDir)}
                </button>
              </th>
              <th className="cell-center">
                Date of last
                <br />
                fund paid
              </th>
              <th className="cell-num">
                Amount of last
                <br />
                fund paid
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link
                    href={`/transporters/${row.id}?from=due`}
                    className="btn-link"
                  >
                    {capitalizeName(row.name) ?? row.name}
                  </Link>
                </td>
                <td>
                  {row.ownerName
                    ? (capitalizeName(row.ownerName) ?? row.ownerName)
                    : "—"}
                </td>
                <td>{row.ownerContactNumber1 ?? "—"}</td>
                <td>{row.city ?? "—"}</td>
                <td>{row.state ?? "—"}</td>
                <td className="cell-num">{formatAmount(row.due)}</td>
                <td className="cell-num">{formatAmount(row.transporterDue)}</td>
                <td className="cell-center">
                  {formatDateDdMmYyyy(row.lastFundPaidDate)}
                </td>
                <td className="cell-num">
                  {row.lastFundPaidAmount
                    ? formatAmount(row.lastFundPaidAmount)
                    : "—"}
                </td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={9}>
                  {initialRows.length === 0
                    ? "No outstanding transporter dues."
                    : "No transporters match these filters."}
                </td>
              </tr>
            )}
          </tbody>
          {filteredRows.length > 0 && (
            <tfoot>
              <tr>
                <td>Total Due</td>
                <td colSpan={4} />
                <td className="cell-num">{formatAmount(String(totals.due))}</td>
                <td className="cell-num">
                  {formatAmount(String(totals.transporterDue))}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table></div>
      </div>
    </>
  );
}
