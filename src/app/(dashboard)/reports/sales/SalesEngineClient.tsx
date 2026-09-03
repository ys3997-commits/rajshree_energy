"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Modal } from "@/components/Modal";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import {
  clearAllSalesOffers,
  updatePlannedSaleCall,
  updateSalesOfferFreight,
  updateSalesOfferPrice,
  updateSalesSmsType,
  type SalesEngineRow,
} from "@/lib/actions/salesEngine";
import {
  salesWhatsAppDisabledReason,
  salesWhatsAppLinks,
} from "@/lib/domain/salesWhatsApp";
import { openWhatsAppMessage } from "@/lib/domain/whatsappWeb";
import type { ExecScopeFilter } from "@/lib/auth/report-exec-access";
import {
  capitalizeName,
  formatAmount,
  formatCreditPeriod,
  formatCustomerCategory,
  formatDateDdMmYyyy,
  formatIndianAmountTyping,
  formatMt,
  formatRs,
  parseAmountInput,
} from "@/lib/domain/format";

type PlannedCallFilter =
  | ""
  | "today"
  | "tomorrow"
  | "older"
  | "future"
  | "none";
type NumericSortKey = "orderInHand" | "soldQuantity" | "due" | "overdue";
type TextSortKey = "name" | "saleExecutive";
type SortKey = NumericSortKey | TextSortKey;
type SortDir = "asc" | "desc";

const NUMERIC_SORT_KEYS: ReadonlySet<SortKey> = new Set([
  "orderInHand",
  "soldQuantity",
  "due",
  "overdue",
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

function distinctTrimmed(values: Array<string | null | undefined>): string[] {
  const names = new Set<string>();
  for (const value of values) {
    if (value?.trim()) names.add(value.trim());
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

function numericValue(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function daysSinceLastDispatch(
  value: string | null | undefined,
  todayYmd: string,
): string {
  if (!value) return "—";
  const lastYmd = value.trim().slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(lastYmd);
  if (!m) return "—";
  const [, y, mo, d] = m;
  const lastUtc = Date.UTC(Number(y), Number(mo) - 1, Number(d));

  const tm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(todayYmd);
  if (!tm) return "—";
  const [, ty, tmo, td] = tm;
  const todayUtc = Date.UTC(Number(ty), Number(tmo) - 1, Number(td));

  const diffDays = Math.floor((todayUtc - lastUtc) / 86_400_000);
  return `${diffDays < 0 ? 0 : diffDays} days`;
}

function sortIndicator(active: boolean, dir: SortDir): string {
  if (!active) return "";
  return dir === "asc" ? " ↑" : " ↓";
}

type OfferField = "offerPrice" | "offerFreight";
type SalesSmsTypeValue = "DELIVERED" | "EX_PORT" | "REQUIREMENT";

const SMS_TYPE_OPTIONS: { value: SalesSmsTypeValue; label: string }[] = [
  { value: "DELIVERED", label: "Delivered" },
  { value: "EX_PORT", label: "Ex-Port" },
  { value: "REQUIREMENT", label: "Requirement" },
];

function formatSalesSmsType(
  value: SalesSmsTypeValue | null | undefined,
): string {
  if (!value) return "";
  return SMS_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function formatOfferAmountDisplay(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  return formatIndianAmountTyping(value, 3);
}

function normalizeOfferDraft(value: string): string | null {
  const trimmed = parseAmountInput(value).replace(/[^\d.]/g, "");
  return trimmed === "" ? null : trimmed;
}

function isValidOfferDraft(value: string): boolean {
  const trimmed = parseAmountInput(value).replace(/[^\d.]/g, "");
  if (trimmed === "") return true;
  return /^\d*\.?\d{0,3}$/.test(trimmed);
}

function OfferAmountInput({
  customerName,
  field,
  value,
  disabled,
  onSave,
}: {
  customerName: string;
  field: OfferField;
  value: string | null;
  disabled: boolean;
  onSave: (value: string | null) => void;
}) {
  const [draft, setDraft] = useState(formatOfferAmountDisplay(value));

  useEffect(() => {
    setDraft(formatOfferAmountDisplay(value));
  }, [value]);

  const label =
    field === "offerPrice"
      ? `Offer price for ${customerName}`
      : `Offer freight for ${customerName}`;

  return (
    <input
      type="text"
      inputMode="decimal"
      className="field-input sales-offer-input"
      aria-label={label}
      value={draft}
      disabled={disabled}
      onChange={(e) => {
        const raw = parseAmountInput(e.target.value).replace(/[^\d.]/g, "");
        if (raw === "") {
          setDraft("");
          return;
        }
        if (!isValidOfferDraft(raw)) return;
        setDraft(formatIndianAmountTyping(raw, 3));
      }}
      onBlur={() => {
        const next = normalizeOfferDraft(draft);
        const current = value?.trim() ? value.trim() : null;
        if (next === current) {
          setDraft(formatOfferAmountDisplay(next));
          return;
        }
        onSave(next);
      }}
    />
  );
}

export function SalesEngineClient({
  initialRows,
  allowedSaleExecutives,
}: {
  initialRows: SalesEngineRow[];
  allowedSaleExecutives: ExecScopeFilter;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [savingCallId, setSavingCallId] = useState<string | null>(null);
  const [savingOffer, setSavingOffer] = useState<{
    id: string;
    field: OfferField;
  } | null>(null);
  const [savingSmsTypeId, setSavingSmsTypeId] = useState<string | null>(null);
  const [clearingAllOffers, setClearingAllOffers] = useState(false);

  const [plannedCallFilter, setPlannedCallFilter] =
    useState<PlannedCallFilter>("");
  const [saleExecutiveFilter, setSaleExecutiveFilter] = useState("");
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
    setSortDir(NUMERIC_SORT_KEYS.has(key) ? "desc" : "asc");
  }

  function sortText(value: string | null | undefined): string {
    return (value ?? "").trim().toLocaleLowerCase();
  }

  const saleExecutiveOptions = useMemo(() => {
    const fromRows = distinctTrimmed(rows.map((row) => row.saleExecutive));
    if (allowedSaleExecutives === "all") return fromRows;
    const allowed = new Set(
      allowedSaleExecutives.map((name) => name.trim().toLowerCase()),
    );
    return fromRows.filter((name) => allowed.has(name.toLowerCase()));
  }, [rows, allowedSaleExecutives]);
  const showSaleExecutiveFilter =
    allowedSaleExecutives === "all" || allowedSaleExecutives.length > 1;
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
      saleExecutiveFilter ||
      cityFilter ||
      stateFilter ||
      categoryFilter ||
      sectorFilter,
  );

  const hasAnyOfferData = useMemo(
    () =>
      rows.some(
        (row) =>
          Boolean(row.offerPrice?.trim()) ||
          Boolean(row.offerFreight?.trim()) ||
          row.smsType != null,
      ),
    [rows],
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
      if (
        saleExecutiveFilter &&
        (row.saleExecutive?.trim() ?? "") !== saleExecutiveFilter
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
    return [...next].sort((a, b) => {
      if (sortKey === "name" || sortKey === "saleExecutive") {
        return (
          sortText(a[sortKey]).localeCompare(sortText(b[sortKey])) * dir
        );
      }
      return (numericValue(a[sortKey]) - numericValue(b[sortKey])) * dir;
    });
  }, [
    rows,
    plannedCallFilter,
    saleExecutiveFilter,
    cityFilter,
    stateFilter,
    categoryFilter,
    sectorFilter,
    sortKey,
    sortDir,
    today,
    tomorrow,
  ]);

  const exportColumns = [
    { key: "customer", header: "Customer Name" },
    { key: "purchaser", header: "Purchaser Name" },
    { key: "phone", header: "Phone Number" },
    { key: "role", header: "Role" },
    { key: "saleExecutive", header: "Sale Executive" },
    { key: "orderInHand", header: "Order In Hand", align: "right" as const },
    { key: "soldQuantity", header: "Sold Quantity", align: "right" as const },
    {
      key: "daysSince",
      header: "Days Since Last Dispatch",
      align: "right" as const,
    },
    { key: "due", header: "Total Due", align: "right" as const },
    { key: "overdue", header: "Overdue", align: "right" as const },
    { key: "creditPeriod", header: "Credit Period", align: "right" as const },
    { key: "plannedCall", header: "Planned Call" },
    { key: "offerPrice", header: "Offer Price", align: "right" as const },
    { key: "offerFreight", header: "Offer Freight", align: "right" as const },
    { key: "smsType", header: "SMS Type" },
  ];

  const exportRows = useMemo(
    () =>
      filtered.map((row) => ({
        customer: capitalizeName(row.name) ?? row.name,
        purchaser: row.purchaserName
          ? (capitalizeName(row.purchaserName) ?? row.purchaserName)
          : "—",
        phone: row.purchaserContact ?? "—",
        role: row.purchaserRole ?? "—",
        saleExecutive: row.saleExecutive
          ? (capitalizeName(row.saleExecutive) ?? row.saleExecutive)
          : "—",
        orderInHand: formatMt(row.orderInHand),
        soldQuantity: formatMt(row.soldQuantity),
        daysSince: daysSinceLastDispatch(row.lastDispatchDate, today),
        due: formatAmount(row.due),
        overdue: formatAmount(row.overdue),
        creditPeriod: formatCreditPeriod(row.creditDays),
        plannedCall: formatDateDdMmYyyy(row.plannedSaleCallDate),
        offerPrice: row.offerPrice ? formatRs(row.offerPrice) : "",
        offerFreight: row.offerFreight ? formatRs(row.offerFreight) : "",
        smsType: formatSalesSmsType(row.smsType),
      })),
    [filtered, today],
  );

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

  function onOfferFieldSave(
    customerId: string,
    field: OfferField,
    value: string | null,
  ) {
    setError(null);
    setRows((prev) =>
      prev.map((row) => (row.id === customerId ? { ...row, [field]: value } : row)),
    );
    setSavingOffer({ id: customerId, field });
    startTransition(async () => {
      try {
        const result =
          field === "offerPrice"
            ? await updateSalesOfferPrice(customerId, value)
            : await updateSalesOfferFreight(customerId, value);
        setRows((prev) =>
          prev.map((row) =>
            row.id === customerId ? { ...row, ...result } : row,
          ),
        );
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to save ${field === "offerPrice" ? "offer price" : "offer freight"}`,
        );
        router.refresh();
      } finally {
        setSavingOffer(null);
      }
    });
  }

  function onSmsTypeChange(customerId: string, value: string) {
    const nextSmsType =
      value === "DELIVERED" || value === "EX_PORT" || value === "REQUIREMENT"
        ? value
        : null;
    setError(null);
    setRows((prev) =>
      prev.map((row) =>
        row.id === customerId ? { ...row, smsType: nextSmsType } : row,
      ),
    );
    setSavingSmsTypeId(customerId);
    startTransition(async () => {
      try {
        const result = await updateSalesSmsType(customerId, nextSmsType);
        setRows((prev) =>
          prev.map((row) =>
            row.id === customerId ? { ...row, smsType: result.smsType } : row,
          ),
        );
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to save SMS type",
        );
        router.refresh();
      } finally {
        setSavingSmsTypeId(null);
      }
    });
  }

  function onClearAllOffers() {
    setError(null);
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        offerPrice: null,
        offerFreight: null,
        smsType: null,
      })),
    );
    setClearingAllOffers(true);
    startTransition(async () => {
      try {
        await clearAllSalesOffers();
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to clear offers",
        );
        router.refresh();
      } finally {
        setClearingAllOffers(false);
      }
    });
  }

  return (
    <div>
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
        {showSaleExecutiveFilter && (
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
        )}
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
              setCityFilter("");
              setStateFilter("");
              setCategoryFilter("");
              setSectorFilter("");
            }}
          >
            Clear
          </button>
        )}
        <button
          type="button"
          className="btn btn-secondary"
          disabled={
            pending ||
            clearingAllOffers ||
            !hasAnyOfferData ||
            savingCallId !== null ||
            savingOffer !== null ||
            savingSmsTypeId !== null
          }
          onClick={onClearAllOffers}
        >
          Clear Offer
        </button>
        <TableDownloadButtons
          title="Sales Engine Report"
          filenameBase="sales"
          columns={exportColumns}
          rows={exportRows}
          whatsapp
        />
      </form>

      <div className="table-wrap sales-engine-table-wrap">
        <div className="table-h-scroll"><table className="data sales-engine-table">
          <thead>
            <tr>
              <th className="sales-engine-customer-col">
                <button
                  type="button"
                  className="th-sort"
                  onClick={() => toggleSort("name")}
                >
                  Customer
                  {sortIndicator(sortKey === "name", sortDir)}
                </button>
              </th>
              <th>Purchaser Name</th>
              <th>Phone Number</th>
              <th>Role</th>
              <th>
                <button
                  type="button"
                  className="th-sort"
                  onClick={() => toggleSort("saleExecutive")}
                >
                  Sale Executive
                  {sortIndicator(sortKey === "saleExecutive", sortDir)}
                </button>
              </th>
              <th className="cell-num">
                <button
                  type="button"
                  className="th-sort"
                  onClick={() => toggleSort("orderInHand")}
                >
                  Order In Hand
                  {sortIndicator(sortKey === "orderInHand", sortDir)}
                </button>
              </th>
              <th className="cell-num">
                <button
                  type="button"
                  className="th-sort"
                  onClick={() => toggleSort("soldQuantity")}
                >
                  Sold Quantity
                  {sortIndicator(sortKey === "soldQuantity", sortDir)}
                </button>
              </th>
              <th className="cell-num">Last Dispatch</th>
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
              <th className="cell-num">Credit Period</th>
              <th className="collection-date-col">Planned Call</th>
              <th className="cell-num sales-offer-col">Offer Price</th>
              <th className="cell-num sales-offer-col">Offer Freight</th>
              <th className="sales-sms-type-col">SMS Type</th>
              <th className="collection-whatsapp-col" aria-label="WhatsApp" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const rowClass = rowHighlightClass(row.plannedSaleCallDate, today);
              const waDisabledReason = salesWhatsAppDisabledReason({
                purchaserContact: row.purchaserContact,
                smsType: row.smsType,
                offerPrice: row.offerPrice,
                offerFreight: row.offerFreight,
              });
              const waLinks = salesWhatsAppLinks({
                purchaserName: row.purchaserName,
                purchaserContact: row.purchaserContact,
                smsType: row.smsType,
                offerPrice: row.offerPrice,
                offerFreight: row.offerFreight,
              });
              return (
                <tr key={row.id} className={rowClass}>
                  <td className="sales-engine-customer-col">
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
                  <td className="cell-num">
                    {daysSinceLastDispatch(row.lastDispatchDate, today)}
                  </td>
                  <td className="cell-num">{formatAmount(row.due)}</td>
                  <td className="cell-num">{formatAmount(row.overdue)}</td>
                  <td className="cell-num">
                    {formatCreditPeriod(row.creditDays)}
                  </td>
                  <td className="collection-date-col">
                    <input
                      type="date"
                      lang="en-GB"
                      className="field-input collection-date-input"
                      aria-label={`Planned sales call for ${row.name}`}
                      value={row.plannedSaleCallDate ?? ""}
                      disabled={savingCallId === row.id || pending}
                      onChange={(e) =>
                        onPlannedCallChange(row.id, e.target.value)
                      }
                    />
                  </td>
                  <td className="cell-num sales-offer-col">
                    <OfferAmountInput
                      customerName={row.name}
                      field="offerPrice"
                      value={row.offerPrice}
                      disabled={
                        pending ||
                        (savingOffer?.id === row.id &&
                          savingOffer.field === "offerPrice")
                      }
                      onSave={(value) =>
                        onOfferFieldSave(row.id, "offerPrice", value)
                      }
                    />
                  </td>
                  <td className="cell-num sales-offer-col">
                    <OfferAmountInput
                      customerName={row.name}
                      field="offerFreight"
                      value={row.offerFreight}
                      disabled={
                        pending ||
                        (savingOffer?.id === row.id &&
                          savingOffer.field === "offerFreight")
                      }
                      onSave={(value) =>
                        onOfferFieldSave(row.id, "offerFreight", value)
                      }
                    />
                  </td>
                  <td className="sales-sms-type-col">
                    <select
                      className="field-input sales-sms-type-select"
                      aria-label={`SMS type for ${row.name}`}
                      value={row.smsType ?? ""}
                      disabled={savingSmsTypeId === row.id || pending}
                      onChange={(e) => onSmsTypeChange(row.id, e.target.value)}
                    >
                      <option value="" />
                      {SMS_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="collection-whatsapp-col">
                    <a
                      className={`btn-whatsapp-icon${waLinks ? "" : " disabled"}`}
                      href={waLinks?.web}
                      rel="noopener noreferrer"
                      aria-disabled={!waLinks}
                      aria-label={
                        waLinks
                          ? `WhatsApp ${row.purchaserName ?? row.name}`
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
                        const opened = openWhatsAppMessage(waLinks);
                        if (!opened) {
                          setError("Open WhatsApp First");
                          return;
                        }
                      }}
                      title={
                        waLinks
                          ? "Open WhatsApp with sales message"
                          : (waDisabledReason ?? "WhatsApp unavailable")
                      }
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path
                          fill="currentColor"
                          d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                        />
                      </svg>
                    </a>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={16}>
                  {rows.length === 0
                    ? "No active customers."
                    : "No customers match these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
