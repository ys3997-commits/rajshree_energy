"use client";

import { useMemo } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { BankAccountBalanceRow } from "@/lib/actions/bankAccounts";
import { formatAmount } from "@/lib/domain/format";
import type { ExportColumn, ExportRow } from "@/lib/export/tableDownload";

const exportColumns: ExportColumn[] = [
  { key: "accountName", header: "Account" },
  { key: "bankName", header: "Bank" },
  { key: "balance", header: "Balance", align: "right" },
];

export function BankBalancesClient({
  initialRows,
}: {
  initialRows: BankAccountBalanceRow[];
}) {
  const sorted = useMemo(
    () =>
      [...initialRows].sort((a, b) =>
        a.accountName.localeCompare(b.accountName),
      ),
    [initialRows],
  );

  const totalBalance = useMemo(
    () =>
      sorted.reduce((sum, row) => sum + Number(row.balance), 0).toFixed(2),
    [sorted],
  );

  const exportRows: ExportRow[] = useMemo(
    () =>
      sorted.map((row) => ({
        accountName: row.accountName,
        bankName: row.bankName,
        balance: formatAmount(row.balance),
      })),
    [sorted],
  );

  if (sorted.length === 0) {
    return (
      <p className="page-subtitle">
        No bank accounts yet. Add them under Masters → Bank.
      </p>
    );
  }

  const totalNegative = Number(totalBalance) < 0;

  return (
    <div>
      <div className="filters">
        <TableDownloadButtons
          title="Bank Balances"
          filenameBase="bank-balances"
          columns={exportColumns}
          rows={exportRows}
        />
      </div>

      <div className="detail-stat-row">
        <div className="detail-stat">
          <span className="detail-stat-label">Total balance</span>
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
      </div>

      <div className="table-wrap">
        <div className="table-h-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Account</th>
                <th>Bank</th>
                <th className="cell-num">Balance</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => {
                const negative = Number(row.balance) < 0;
                return (
                  <tr key={row.id}>
                    <td>{row.accountName}</td>
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
