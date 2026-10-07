"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { BankStatementLine } from "@/lib/domain/bankStatement";
import {
  capitalizeName,
  formatAmount,
  formatDateDdMmYyyy,
} from "@/lib/domain/format";

function exportBlank(value: string | null | undefined): string {
  if (value == null || value === "" || value === "—") return "";
  return value;
}

function exportDate(value: string | null | undefined): string {
  if (!value) return "";
  return exportBlank(formatDateDdMmYyyy(value));
}

function exportRsAmount(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  return exportBlank(formatAmount(value));
}

export function BankStatementClient({
  accountId,
  accountName,
  bankName,
  dateFrom,
  dateTo,
  openingBalance,
  closingBalance,
  totalDebit,
  totalCredit,
  rows,
}: {
  accountId: string;
  accountName: string;
  bankName: string;
  dateFrom: string;
  dateTo: string;
  openingBalance: string;
  closingBalance: string;
  totalDebit: string;
  totalCredit: string;
  rows: BankStatementLine[];
}) {
  const router = useRouter();

  const titleName = capitalizeName(accountName) ?? accountName;
  const bankLabel = capitalizeName(bankName) ?? bankName;

  const dateRangeLabel = useMemo(() => {
    if (dateFrom && dateTo) {
      return `${formatDateDdMmYyyy(dateFrom)} – ${formatDateDdMmYyyy(dateTo)}`;
    }
    if (dateFrom) return `from ${formatDateDdMmYyyy(dateFrom)}`;
    if (dateTo) return `to ${formatDateDdMmYyyy(dateTo)}`;
    return "";
  }, [dateFrom, dateTo]);

  const filenameBase = useMemo(() => {
    const slug = titleName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return slug ? `bank-statement-${slug}` : "bank-statement";
  }, [titleName]);

  const exportColumns = useMemo(
    () => [
      { key: "date", header: "Date" },
      { key: "particular", header: "Particulars" },
      { key: "debit", header: "Debit", align: "right" as const },
      { key: "credit", header: "Credit", align: "right" as const },
      { key: "balance", header: "Balance", align: "right" as const },
    ],
    [],
  );

  const exportRows = useMemo(() => {
    const next: Array<Record<string, string>> = [
      {
        date: "",
        particular: "Opening balance",
        debit: "",
        credit: "",
        balance: exportRsAmount(openingBalance),
      },
    ];
    for (const row of rows) {
      next.push({
        date: exportDate(row.date),
        particular: row.particular,
        debit: exportRsAmount(row.debit),
        credit: exportRsAmount(row.credit),
        balance: exportRsAmount(row.balance),
      });
    }
    next.push({
      date: "",
      particular: "Closing balance",
      debit: exportRsAmount(totalDebit),
      credit: exportRsAmount(totalCredit),
      balance: exportRsAmount(closingBalance),
    });
    return next;
  }, [rows, openingBalance, closingBalance, totalDebit, totalCredit]);

  function statementHref(next: { dateFrom?: string; dateTo?: string }) {
    const params = new URLSearchParams();
    const from = next.dateFrom ?? dateFrom;
    const to = next.dateTo ?? dateTo;
    if (from) params.set("dateFrom", from);
    if (to) params.set("dateTo", to);
    const qs = params.toString();
    return qs
      ? `/reports/bank-statement/${accountId}?${qs}`
      : `/reports/bank-statement/${accountId}`;
  }

  function onDateFromChange(next: string) {
    router.push(statementHref({ dateFrom: next }));
  }

  function onDateToChange(next: string) {
    router.push(statementHref({ dateTo: next }));
  }

  const closingNegative = Number(closingBalance) < 0;

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Bank
            <span aria-hidden="true"> · </span>
            <Link href="/reports/bank-statement">Bank Statement</Link>
            <span aria-hidden="true"> · </span>
            {titleName}
          </p>
          <h1 className="page-title">{titleName}</h1>
          <p className="page-subtitle">{bankLabel}</p>
        </div>
        <div className="detail-stat-row">
          <div className="detail-stat">
            <span className="detail-stat-label">Opening balance</span>
            <span className="detail-stat-value">
              {formatAmount(openingBalance)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Credit</span>
            <span className="detail-stat-value fund-type-in">
              {formatAmount(totalCredit)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Debit</span>
            <span className="detail-stat-value fund-type-out">
              {formatAmount(totalDebit)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Closing balance</span>
            <span
              className={
                closingNegative
                  ? "detail-stat-value fund-type-out"
                  : "detail-stat-value"
              }
            >
              {formatAmount(closingBalance)}
            </span>
          </div>
        </div>
      </div>

      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <label>
          Start date
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            max={dateTo || undefined}
            aria-label="Start date"
          />
        </label>
        <label>
          End date
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            min={dateFrom || undefined}
            aria-label="End date"
          />
        </label>
        <TableDownloadButtons
          title={`Bank Statement — ${titleName}${dateRangeLabel ? ` · ${dateRangeLabel}` : ""} · Opening ${formatAmount(openingBalance)} · Credit ${formatAmount(totalCredit)} · Debit ${formatAmount(totalDebit)} · Closing ${formatAmount(closingBalance)}`}
          filenameBase={filenameBase}
          columns={exportColumns}
          rows={exportRows}
        />
      </form>

      <div className="table-wrap table-wrap-scroll">
        <div className="table-h-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Date</th>
                <th>Particulars</th>
                <th className="cell-num">Debit</th>
                <th className="cell-num">Credit</th>
                <th className="cell-num">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>—</td>
                <td>Opening balance</td>
                <td className="cell-num">—</td>
                <td className="cell-num">—</td>
                <td className="cell-num">{formatAmount(openingBalance)}</td>
              </tr>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>No transactions in this period.</td>
                </tr>
              ) : (
                rows.map((row) => {
                  const isOut = row.debit != null;
                  return (
                    <tr
                      key={row.id}
                      className={isOut ? "fund-row-out" : "fund-row-in"}
                    >
                      <td>{formatDateDdMmYyyy(row.date)}</td>
                      <td>{row.particular}</td>
                      <td
                        className={
                          row.debit != null
                            ? "cell-num fund-type-out"
                            : "cell-num"
                        }
                      >
                        {row.debit != null ? formatAmount(row.debit) : "—"}
                      </td>
                      <td
                        className={
                          row.credit != null
                            ? "cell-num fund-type-in"
                            : "cell-num"
                        }
                      >
                        {row.credit != null ? formatAmount(row.credit) : "—"}
                      </td>
                      <td className="cell-num">{formatAmount(row.balance)}</td>
                    </tr>
                  );
                })
              )}
              <tr>
                <td>—</td>
                <td>Closing balance</td>
                <td className="cell-num fund-type-out">
                  {formatAmount(totalDebit)}
                </td>
                <td className="cell-num fund-type-in">
                  {formatAmount(totalCredit)}
                </td>
                <td
                  className={
                    closingNegative
                      ? "cell-num fund-type-out"
                      : "cell-num"
                  }
                >
                  {formatAmount(closingBalance)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
