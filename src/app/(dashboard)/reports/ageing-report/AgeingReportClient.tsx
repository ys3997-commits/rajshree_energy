"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Modal } from "@/components/Modal";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { CustomerCategory } from "@/generated/prisma";
import {
  AGEING_BUCKETS,
  type AgeingBucketKey,
  type AgeingReportRow,
} from "@/lib/domain/ageingBuckets";
import {
  ageingWhatsAppDisabledReason,
  ageingWhatsAppLinks,
  type AgeingWhatsAppInput,
} from "@/lib/domain/ageingWhatsApp";
import { capitalizeName, formatAmount } from "@/lib/domain/format";
import { openWhatsAppMessage } from "@/lib/domain/whatsappWeb";

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

export function AgeingReportClient({
  rows,
  canMessageOwner,
}: {
  rows: AgeingReportRow[];
  canMessageOwner: boolean;
}) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [error, setError] = useState<string | null>(null);

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
      <Modal
        open={error !== null}
        title="Message"
        onClose={() => setError(null)}
      >
        <p className="mb-4">{error}</p>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={() => setError(null)}>
            OK
          </button>
        </div>
      </Modal>

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
                <th className="collection-whatsapp-col" aria-hidden="true">
                  &nbsp;
                </th>
                <th className="collection-whatsapp-col" aria-hidden="true">
                  &nbsp;
                </th>
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
                <th className="collection-whatsapp-col">Payment</th>
                <th className="collection-whatsapp-col">Owner</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const paymentWaInput: AgeingWhatsAppInput = {
                  recipientName: row.paymentInChargeName,
                  recipientContact: row.paymentInChargeContact,
                  dealingCompany: row.dealingCompany,
                  totalDue: row.totalDue,
                  overdue: row.overdue,
                  creditDays: row.creditDays,
                  buckets: row,
                  recipient: "payment",
                };
                const ownerWaInput: AgeingWhatsAppInput = {
                  recipientName: row.ownerName,
                  recipientContact: row.ownerContact,
                  dealingCompany: row.dealingCompany,
                  totalDue: row.totalDue,
                  overdue: row.overdue,
                  creditDays: row.creditDays,
                  buckets: row,
                  recipient: "owner",
                  canMessageOwner,
                };
                const paymentWaDisabledReason =
                  ageingWhatsAppDisabledReason(paymentWaInput);
                const paymentWaLinks = ageingWhatsAppLinks(paymentWaInput);
                const ownerWaDisabledReason =
                  ageingWhatsAppDisabledReason(ownerWaInput);
                const ownerWaLinks = ageingWhatsAppLinks(ownerWaInput);
                return (
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
                    <td className="collection-whatsapp-col">
                      <AgeingWhatsAppButton
                        links={paymentWaLinks}
                        disabledReason={paymentWaDisabledReason}
                        ariaLabel={
                          paymentWaLinks
                            ? `WhatsApp ${row.paymentInChargeName ?? row.name}`
                            : (paymentWaDisabledReason ?? "WhatsApp unavailable")
                        }
                        title={
                          paymentWaLinks
                            ? "Open WhatsApp with ageing message for payment in-charge"
                            : (paymentWaDisabledReason ?? "WhatsApp unavailable")
                        }
                        onError={setError}
                      />
                    </td>
                    <td className="collection-whatsapp-col">
                      <AgeingWhatsAppButton
                        links={ownerWaLinks}
                        disabledReason={ownerWaDisabledReason}
                        ariaLabel={
                          ownerWaLinks
                            ? `WhatsApp ${row.ownerName ?? row.name}`
                            : (ownerWaDisabledReason ?? "WhatsApp unavailable")
                        }
                        title={
                          ownerWaLinks
                            ? "Open WhatsApp with ageing message for owner"
                            : (ownerWaDisabledReason ?? "WhatsApp unavailable")
                        }
                        onError={setError}
                      />
                    </td>
                  </tr>
                );
              })}
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
                <td className="collection-whatsapp-col" aria-hidden="true" />
                <td className="collection-whatsapp-col" aria-hidden="true" />
              </tr>
            </tfoot>
          </table></div>
        </div>
      )}
    </div>
  );
}

function AgeingWhatsAppButton({
  links,
  disabledReason,
  ariaLabel,
  title,
  onError,
}: {
  links: { app: string; web: string } | null;
  disabledReason: string | null;
  ariaLabel: string;
  title: string;
  onError: (message: string) => void;
}) {
  return (
    <a
      className={`btn-whatsapp-icon${links ? "" : " disabled"}`}
      href={links?.web}
      rel="noopener noreferrer"
      aria-disabled={!links}
      aria-label={ariaLabel}
      tabIndex={links ? undefined : -1}
      onClick={(e) => {
        e.preventDefault();
        if (!links) {
          onError(disabledReason ?? "WhatsApp is unavailable for this row.");
          return;
        }
        const opened = openWhatsAppMessage(links);
        if (!opened) {
          onError("Open WhatsApp First");
        }
      }}
      title={title}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
        />
      </svg>
    </a>
  );
}
