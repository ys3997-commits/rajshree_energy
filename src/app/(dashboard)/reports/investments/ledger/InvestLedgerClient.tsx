"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type {
  InvestLedgerCompanyOption,
  InvestLedgerFundRow,
  InvestLedgerFundType,
  InvestLedgerReturnRow,
} from "@/lib/actions/investmentLedger";
import { capitalizeName, formatAmount } from "@/lib/domain/format";

function formatDateDdMmYyyy(value: string | null | undefined): string {
  if (!value) return "—";
  const datePart = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** Export cells: blank when empty (no em dash). */
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

/** Fund paid and discount received display as "- …". */
function formatFundAmount(
  fundType: InvestLedgerFundType,
  amount: string | null,
): string {
  if (amount == null) return "—";
  const formatted = formatAmount(amount);
  if (fundType === "Fund paid" || fundType === "Discount received") {
    return `- ${formatted}`;
  }
  return formatted;
}

function exportFundAmount(
  fundType: InvestLedgerFundType,
  amount: string | null,
): string {
  if (amount == null) return "";
  return exportBlank(formatFundAmount(fundType, amount));
}

function toAmount(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function InvestLedgerClient({
  companies,
  companyId,
  dateFrom,
  dateTo,
  returnRows,
  fundRows,
  openingDue,
  currentDue,
}: {
  companies: InvestLedgerCompanyOption[];
  companyId: string;
  dateFrom: string;
  dateTo: string;
  returnRows: InvestLedgerReturnRow[];
  fundRows: InvestLedgerFundRow[];
  openingDue: string | null;
  currentDue: string | null;
}) {
  const router = useRouter();

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === companyId) ?? null,
    [companies, companyId],
  );

  const profitTotal = useMemo(
    () => returnRows.reduce((sum, row) => sum + toAmount(row.profit), 0),
    [returnRows],
  );

  const interestTotal = useMemo(
    () => returnRows.reduce((sum, row) => sum + toAmount(row.interest), 0),
    [returnRows],
  );

  const fundTotal = useMemo(
    () =>
      fundRows.reduce((sum, row) => {
        const amount = toAmount(row.amount);
        if (
          row.fundType === "Fund paid" ||
          row.fundType === "Discount received"
        ) {
          return sum - amount;
        }
        if (
          row.fundType === "Fund received" ||
          row.fundType === "Discount paid"
        ) {
          return sum + amount;
        }
        return sum;
      }, 0),
    [fundRows],
  );

  const companyLabel = selectedCompany
    ? (capitalizeName(selectedCompany.name) ?? selectedCompany.name)
    : "Company";

  const DIVIDER = "     |     ";

  const exportColumns = useMemo(
    () => [
      { key: "date", header: "Date" },
      { key: "period", header: "Period" },
      { key: "profit", header: "Profit / Loss", align: "right" as const },
      { key: "interest", header: "Interest", align: "right" as const },
      { key: "amount", header: "Amount", align: "right" as const },
      {
        key: "divider",
        header: DIVIDER,
        align: "center" as const,
        divider: true,
      },
      { key: "fundDate", header: "Date" },
      { key: "particular", header: "Particular" },
      { key: "fundAmount", header: "Amount", align: "right" as const },
    ],
    [],
  );

  const exportRows = useMemo(() => {
    const len = Math.max(returnRows.length, fundRows.length);
    const next: Array<Record<string, string>> = [];

    for (let i = 0; i < len; i++) {
      const entry = returnRows[i];
      const fund = fundRows[i];
      next.push({
        date: entry ? exportDate(entry.date) : "",
        period: entry?.periodName ?? "",
        profit: entry ? exportRsAmount(entry.profit) : "",
        interest: entry ? exportRsAmount(entry.interest) : "",
        amount: entry ? exportRsAmount(entry.amount) : "",
        divider: DIVIDER,
        fundDate: fund ? exportDate(fund.date) : "",
        particular: fund?.fundType ?? "",
        fundAmount: fund ? exportFundAmount(fund.fundType, fund.amount) : "",
      });
    }

    return next;
  }, [returnRows, fundRows]);

  const dateRangeLabel = useMemo(() => {
    if (dateFrom && dateTo) {
      return `${formatDateDdMmYyyy(dateFrom)} – ${formatDateDdMmYyyy(dateTo)}`;
    }
    if (dateFrom) return `from ${formatDateDdMmYyyy(dateFrom)}`;
    if (dateTo) return `to ${formatDateDdMmYyyy(dateTo)}`;
    return "";
  }, [dateFrom, dateTo]);

  const filenameBase = useMemo(() => {
    const slug = companyLabel
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return slug ? `invest-ledger-${slug}` : "invest-ledger";
  }, [companyLabel]);

  function ledgerHref(next: {
    companyId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const params = new URLSearchParams();
    const id = next.companyId ?? companyId;
    const from = next.dateFrom ?? dateFrom;
    const to = next.dateTo ?? dateTo;
    if (id) params.set("companyId", id);
    if (from) params.set("dateFrom", from);
    if (to) params.set("dateTo", to);
    const qs = params.toString();
    return qs
      ? `/reports/investments/ledger?${qs}`
      : "/reports/investments/ledger";
  }

  function onCompanyChange(nextId: string) {
    router.push(ledgerHref({ companyId: nextId }));
  }

  function onDateFromChange(next: string) {
    router.push(ledgerHref({ dateFrom: next }));
  }

  function onDateToChange(next: string) {
    router.push(ledgerHref({ dateTo: next }));
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Investment
            <span aria-hidden="true"> · </span>
            Invest Ledger
          </p>
          <h1 className="page-title">Invest Ledger</h1>
          <p className="page-subtitle">
            Investment ledger of period returns, funds, and discounts.
          </p>
        </div>
        {companyId ? (
          <div className="detail-stat-row">
            <div className="detail-stat">
              <span className="detail-stat-label">Opening balance</span>
              <span className="detail-stat-value">
                {formatAmount(openingDue)}
              </span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-label">Profit / Loss</span>
              <span className="detail-stat-value">
                {formatAmount(profitTotal)}
              </span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-label">Interest</span>
              <span className="detail-stat-value">
                {formatAmount(interestTotal)}
              </span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-label">Fund</span>
              <span className="detail-stat-value">{formatAmount(fundTotal)}</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-label">Current investment</span>
              <span className="detail-stat-value">
                {formatAmount(currentDue)}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <label>
          Company Name
          <select
            value={companyId}
            onChange={(e) => onCompanyChange(e.target.value)}
            aria-label="Company name"
          >
            <option value="">Select company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {capitalizeName(company.name) ?? company.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Start Date
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            max={dateTo || undefined}
            aria-label="Start date"
          />
        </label>
        <label>
          End Date
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            min={dateFrom || undefined}
            aria-label="End date"
          />
        </label>
        {companyId ? (
          <TableDownloadButtons
            title={`Invest Ledger — ${companyLabel}${dateRangeLabel ? ` · ${dateRangeLabel}` : ""} · Opening balance ${formatAmount(openingDue)} · Profit / Loss ${formatAmount(profitTotal)} · Interest ${formatAmount(interestTotal)} · Fund ${formatAmount(fundTotal)} · Current investment ${formatAmount(currentDue)}`}
            filenameBase={filenameBase}
            columns={exportColumns}
            rows={exportRows}
          />
        ) : null}
      </form>

      {!companyId ? (
        <p className="page-subtitle">Select a company to view the ledger.</p>
      ) : (
        <div className="ledger-panels">
          <section className="ledger-panel ledger-panel-dispatch">
            <h2 className="ledger-panel-title">Profit / Loss</h2>
            <div className="ledger-panel-body table-wrap-scroll">
              <div className="table-h-scroll">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Period</th>
                      <th className="cell-num">Profit / Loss</th>
                      <th className="cell-num">Interest</th>
                      <th className="cell-num">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnRows.map((row) => (
                      <tr key={row.id}>
                        <td>{formatDateDdMmYyyy(row.date)}</td>
                        <td>{row.periodName.trim() ? row.periodName : "—"}</td>
                        <td className="cell-num">{formatAmount(row.profit)}</td>
                        <td className="cell-num">
                          {row.interest != null
                            ? formatAmount(row.interest)
                            : "—"}
                        </td>
                        <td className="cell-num">{formatAmount(row.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="ledger-panel ledger-panel-funds">
            <h2 className="ledger-panel-title">Funds &amp; Discounts</h2>
            <div className="ledger-panel-body table-wrap-scroll">
              <div className="table-h-scroll">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Particular</th>
                      <th className="cell-num">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundRows.map((row) => (
                      <tr key={row.id}>
                        <td>{formatDateDdMmYyyy(row.date)}</td>
                        <td>{row.fundType}</td>
                        <td className="cell-num">
                          {formatFundAmount(row.fundType, row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
