"use client";

import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { BankAccountBalanceRow } from "@/lib/actions/bankAccounts";
import { formatAmount } from "@/lib/domain/format";
import type { ExportColumn, ExportRow } from "@/lib/export/tableDownload";

type SortKey = "accountName" | "accountTypeName" | "bankName" | "balance";
type SortDir = "asc" | "desc";

const OTHER_ACCOUNT = "other account";

const exportColumns: ExportColumn[] = [
  { key: "accountName", header: "Account" },
  { key: "accountTypeName", header: "Type of Account" },
  { key: "bankName", header: "Bank" },
  { key: "balance", header: "Balance", align: "right" },
];

function isOtherAccount(row: BankAccountBalanceRow): boolean {
  const name = row.accountName.trim().toLowerCase();
  const type = (row.accountTypeName ?? "").trim().toLowerCase();
  return name === OTHER_ACCOUNT || type === OTHER_ACCOUNT;
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

function compareText(
  a: string | null | undefined,
  b: string | null | undefined,
): number {
  return (a?.trim() ?? "").localeCompare(b?.trim() ?? "", undefined, {
    sensitivity: "base",
  });
}

export function BankBalancesClient({
  initialRows,
}: {
  initialRows: BankAccountBalanceRow[];
}) {
  const [typeFilter, setTypeFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("accountName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const visibleRows = useMemo(
    () => initialRows.filter((row) => !isOtherAccount(row)),
    [initialRows],
  );

  const typeOptions = useMemo(
    () => distinctTrimmed(visibleRows.map((row) => row.accountTypeName)),
    [visibleRows],
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "balance" ? "desc" : "asc");
  }

  const filteredRows = useMemo(() => {
    const next = visibleRows.filter((row) => {
      if (!typeFilter) return true;
      return (row.accountTypeName?.trim() ?? "") === typeFilter;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return [...next].sort((a, b) => {
      if (sortKey === "balance") {
        return (numericValue(a.balance) - numericValue(b.balance)) * dir;
      }
      if (sortKey === "accountTypeName") {
        return compareText(a.accountTypeName, b.accountTypeName) * dir;
      }
      if (sortKey === "bankName") {
        return compareText(a.bankName, b.bankName) * dir;
      }
      return compareText(a.accountName, b.accountName) * dir;
    });
  }, [visibleRows, typeFilter, sortKey, sortDir]);

  const typeTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of visibleRows) {
      const type = row.accountTypeName?.trim() || "Untyped";
      map.set(type, (map.get(type) ?? 0) + numericValue(row.balance));
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([typeName, balance]) => ({
        typeName,
        balance: balance.toFixed(2),
      }));
  }, [visibleRows]);

  const totalBalance = useMemo(
    () =>
      visibleRows
        .reduce((sum, row) => sum + numericValue(row.balance), 0)
        .toFixed(2),
    [visibleRows],
  );

  const exportRows: ExportRow[] = useMemo(
    () =>
      filteredRows.map((row) => ({
        accountName: row.accountName,
        accountTypeName: row.accountTypeName ?? "—",
        bankName: row.bankName,
        balance: formatAmount(row.balance),
      })),
    [filteredRows],
  );

  if (visibleRows.length === 0) {
    return (
      <p className="page-subtitle">
        No bank accounts yet. Add them under Masters → Bank → Create Bank
        Account.
      </p>
    );
  }

  const totalNegative = Number(totalBalance) < 0;

  return (
    <div>
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <label>
          Type of Account
          <select
            className="field-input"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All</option>
            {typeOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        {typeFilter ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setTypeFilter("")}
          >
            Clear
          </button>
        ) : null}
        <TableDownloadButtons
          title="Bank Balances"
          filenameBase="bank-balances"
          columns={exportColumns}
          rows={exportRows}
        />
      </form>

      <section className="extra-information" aria-label="Extra information">
        <h2 className="extra-information-title">Extra information</h2>
        <div className="detail-stat-row">
          <div className="detail-stat">
            <span className="detail-stat-label">Total Balance</span>
            <span
              className={
                totalNegative
                  ? "detail-stat-value fund-type-out"
                  : "detail-stat-value"
              }
            >
              {formatAmount(totalBalance)}
            </span>
          </div>
          {typeTotals.map((item) => {
            const negative = Number(item.balance) < 0;
            return (
              <div key={item.typeName} className="detail-stat">
                <span className="detail-stat-label">
                  {item.typeName} Balance
                </span>
                <span
                  className={
                    negative
                      ? "detail-stat-value fund-type-out"
                      : "detail-stat-value"
                  }
                >
                  {formatAmount(item.balance)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="table-wrap">
        <div className="table-h-scroll">
          <table className="data bank-balances-table">
            <thead>
              <tr>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("accountName")}
                  >
                    Account
                    {sortIndicator(sortKey === "accountName", sortDir)}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("accountTypeName")}
                  >
                    Type of Account
                    {sortIndicator(sortKey === "accountTypeName", sortDir)}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("bankName")}
                  >
                    Bank
                    {sortIndicator(sortKey === "bankName", sortDir)}
                  </button>
                </th>
                <th className="cell-num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("balance")}
                  >
                    Balance
                    {sortIndicator(sortKey === "balance", sortDir)}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={4}>No accounts match this filter.</td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const negative = Number(row.balance) < 0;
                  return (
                    <tr key={row.id}>
                      <td>{row.accountName}</td>
                      <td>{row.accountTypeName ?? "—"}</td>
                      <td>{row.bankName}</td>
                      <td
                        className={
                          negative ? "cell-num fund-type-out" : "cell-num"
                        }
                      >
                        {formatAmount(row.balance)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
