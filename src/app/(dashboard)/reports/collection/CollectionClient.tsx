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
  formatAmount,
} from "@/lib/domain/format";
import {
  collectionWhatsAppDisabledReason,
  collectionWhatsAppLinks,
  openCollectionWhatsAppWeb,
} from "@/lib/domain/collectionWhatsApp";
import { Modal } from "@/components/Modal";

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

function rowClassName(
  plannedDate: string | null,
  today: string,
  lastPaidYesterday: boolean,
): string | undefined {
  const highlight = rowHighlightClass(plannedDate, today);
  if (highlight) return highlight;
  if (lastPaidYesterday) return "payment-row-yesterday";
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
        <div className="table-h-scroll">
        <table className="data collection-engine-table">
          <thead>
            <tr>
              <th className="collection-engine-customer-col">
                <button
                  type="button"
                  className="th-sort"
                  onClick={() => toggleSort("name")}
                >
                  Customer
                  {sortIndicator(sortKey === "name", sortDir)}
                </button>
              </th>
              <th>Payment In Charge</th>
              <th>Contact Number</th>
              <th>Sales Executive</th>
              <th>Dealing Company</th>
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
              <th>Last Payment Date</th>
              <th className="cell-num">Last Payment Amount</th>
              <th className="cell-num">Credit Period</th>
              <th className="collection-date-col">Planned Call Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const lastPaidYesterday =
                normalizePlannedDate(row.lastPaymentDate) === yesterday;
              const waDisabledReason = collectionWhatsAppDisabledReason({
                dealingCompany: row.dealingCompany,
                paymentInChargeContact: row.paymentInChargeContact,
              });
              const waLinks = collectionWhatsAppLinks({
                paymentInChargeName: row.paymentInChargeName,
                paymentInChargeContact: row.paymentInChargeContact,
                dealingCompany: row.dealingCompany,
                due: row.due,
                overdue: row.overdue,
              });
              return (
                <tr
                  key={row.id}
                  className={rowClassName(
                    row.plannedCollectionCallDate,
                    today,
                    lastPaidYesterday,
                  )}
                >
                  <td className="collection-engine-customer-col">
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
                  <td className="cell-num">{formatAmount(row.due)}</td>
                  <td className="cell-num">{formatAmount(row.overdue)}</td>
                  <td>{formatDateDdMmYyyy(row.lastPaymentDate)}</td>
                  <td className="cell-num">
                    {row.lastPaymentAmount
                      ? formatAmount(row.lastPaymentAmount)
                      : "—"}
                  </td>
                  <td className="cell-num">
                    {formatCreditPeriod(row.creditDays)}
                  </td>
                  <td className="collection-date-col">
                    <div className="collection-call-actions">
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
                      <a
                        className={`btn-whatsapp-icon${waLinks ? "" : " disabled"}`}
                        href={waLinks?.web}
                        rel="noopener noreferrer"
                        aria-disabled={!waLinks}
                        aria-label={
                          waLinks
                            ? `WhatsApp ${row.paymentInChargeName ?? row.name}`
                            : (waDisabledReason ?? "WhatsApp unavailable")
                        }
                        tabIndex={waLinks ? undefined : -1}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!waLinks) {
                            setError(
                              waDisabledReason ??
                                "WhatsApp is unavailable for this row.",
                            );
                            return;
                          }
                          // One named tab for Web — later clicks reuse it.
                          const opened = openCollectionWhatsAppWeb(waLinks.web);
                          if (!opened) {
                            setError("Open WhatsApp First");
                            return;
                          }
                          // Also try the Desktop/mobile app.
                          const appUrl = waLinks.app;
                          window.setTimeout(() => {
                            const appLink = document.createElement("a");
                            appLink.href = appUrl;
                            appLink.style.display = "none";
                            document.body.appendChild(appLink);
                            appLink.click();
                            appLink.remove();
                          }, 0);
                        }}
                        title={
                          waLinks
                            ? "Open WhatsApp with collection message"
                            : (waDisabledReason ?? "WhatsApp unavailable")
                        }
                      >
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path
                            fill="currentColor"
                            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                          />
                        </svg>
                      </a>
                    </div>
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
      </div>
    </>
  );
}
