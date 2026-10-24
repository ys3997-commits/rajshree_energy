import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { TableRefreshButton } from "@/components/TableRefreshButton";
import { Decimal } from "@prisma/client/runtime/library";
import { computeGst, toDecimal, type DecimalLike } from "@/lib/domain/computations";
import {
  formatAmount,
  formatCreditPeriod,
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatIndianNumber,
  formatLorryNumber,
} from "@/lib/domain/format";
import { PURCHASE_TCS_RATE } from "@/lib/domain/purchaseRate";
import type { DispatchListData } from "../../dispatches/dispatchListShared";

const COLUMNS = [
  { key: "date", header: "Date" },
  { key: "lorryNumber", header: "Lorry\nNo" },
  { key: "quantity", header: "Quantity", align: "right" as const },
  { key: "quality", header: "Quality" },
  { key: "vesselName", header: "Vessel\nName" },
  { key: "vendor", header: "Vendor" },
  { key: "purchasePrice", header: "Purchase\nPrice", align: "right" as const },
  {
    key: "purchaseAmount",
    header: "Purchase\nAmount",
    align: "right" as const,
  },
  { key: "customer", header: "Customer" },
  { key: "creditDays", header: "Credit\nDays", align: "right" as const },
  { key: "salePrice", header: "Sale\nPrice", align: "right" as const },
  { key: "saleAmount", header: "Sale\nAmount", align: "right" as const },
  { key: "transporter", header: "Transporter\nName" },
  { key: "freightPmt", header: "Freight\nPMT", align: "right" as const },
  { key: "freightAmount", header: "Freight\nAmount", align: "right" as const },
];

const QUALITY_COLUMNS = [
  { key: "quality", header: "Quality" },
  { key: "lorries", header: "Total no of lorries", align: "right" as const },
  { key: "quantity", header: "Total Quantities", align: "right" as const },
];

const TOTAL_KEYS = new Set([
  "quantity",
  "purchaseAmount",
  "saleAmount",
  "freightAmount",
]);

function purchaseAmountValue(
  quantity: DecimalLike,
  basicRate: DecimalLike | null | undefined,
): Decimal | null {
  if (basicRate == null) return null;
  const weight = toDecimal(quantity);
  const rate = toDecimal(basicRate);
  const basicAmount = weight.mul(rate);
  const gst = computeGst({ rate, quantity: weight });
  if (gst == null) return null;
  return basicAmount.plus(gst).plus(basicAmount.plus(gst).mul(PURCHASE_TCS_RATE));
}

function roundedAmount(value: Decimal | null): number {
  if (value == null) return 0;
  const amount = Number(value.toString());
  return Number.isFinite(amount) ? Math.round(amount) : 0;
}

function qualitySummaries(dispatches: DispatchListData["dispatches"]) {
  const groups = new Map<string, { count: number; quantity: Decimal }>();
  let lorryTotal = 0;
  let quantityTotal = toDecimal(0);
  for (const row of dispatches) {
    const quality = row.qualityClass?.qualityOption.name ?? "—";
    const current = groups.get(quality) ?? {
      count: 0,
      quantity: toDecimal(0),
    };
    current.count += 1;
    current.quantity = current.quantity.plus(toDecimal(row.dispatchedQuantity));
    groups.set(quality, current);
    lorryTotal += 1;
    quantityTotal = quantityTotal.plus(toDecimal(row.dispatchedQuantity));
  }

  const rows = [...groups.entries()].map(([quality, group]) => ({
    quality,
    lorries: `${group.count} Lorry`,
    quantity: formatDispatchMt(group.quantity),
  }));

  return {
    rows,
    total: {
      quality: "Total",
      lorries: `${lorryTotal} Lorry`,
      quantity: formatDispatchMt(quantityTotal),
    },
  };
}

export function TallyEntryListView({ data }: { data: DispatchListData }) {
  const { filters, dispatches } = data;
  const { rows: qualityRows, total: qualityTotal } = qualitySummaries(dispatches);
  let quantityTotal = toDecimal(0);
  let purchaseTotal = 0;
  let saleTotal = 0;
  let freightTotal = 0;

  const exportRows = dispatches.map((row) => {
    const quantity = row.dispatchedQuantity;
    const salePrice = row.saleTotalRate;
    const saleAmount =
      salePrice == null
        ? null
        : toDecimal(quantity).mul(toDecimal(salePrice));
    const purchaseAmount = purchaseAmountValue(quantity, row.purchaseBasicRate);
    const freightAmount =
      row.freightAmount == null ? null : toDecimal(row.freightAmount);

    quantityTotal = quantityTotal.plus(toDecimal(quantity));
    purchaseTotal += roundedAmount(purchaseAmount);
    saleTotal += roundedAmount(saleAmount);
    freightTotal += roundedAmount(freightAmount);

    return {
      date: formatDateDdMmYyyy(
        new Date(row.dispatchDate).toISOString().slice(0, 10),
      ),
      lorryNumber: formatLorryNumber(row.lorryNumber) ?? "—",
      quantity: formatDispatchMt(quantity),
      quality: row.qualityClass?.qualityOption.name ?? "—",
      vesselName: row.vesselName,
      vendor: row.vendorName ?? "—",
      purchasePrice: formatIndianNumber(row.purchaseTotalRate, 2),
      purchaseAmount: formatAmount(purchaseAmount),
      customer: row.customerName ?? "—",
      creditDays: formatCreditPeriod(row.creditDays),
      salePrice: formatIndianNumber(salePrice, 2),
      saleAmount: formatAmount(saleAmount),
      transporter: row.transporterName ?? "—",
      freightPmt: formatAmount(row.freight),
      freightAmount: formatAmount(freightAmount),
    };
  });

  const totalRow = {
    date: "Total",
    lorryNumber: "",
    quantity: formatDispatchMt(quantityTotal),
    quality: "",
    vesselName: "",
    vendor: "",
    purchasePrice: "",
    purchaseAmount: formatAmount(purchaseTotal),
    customer: "",
    creditDays: "",
    salePrice: "",
    saleAmount: formatAmount(saleTotal),
    transporter: "",
    freightPmt: "",
    freightAmount: formatAmount(freightTotal),
  };

  return (
    <>
      <form className="filters" method="get" action="/update/tally">
        <label>
          Date
          <input
            type="date"
            lang="en-GB"
            className="field-input"
            name="dispatchDate"
            defaultValue={filters.dispatchDate}
            required
          />
        </label>
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
        <TableRefreshButton />
        <TableDownloadButtons
          title="Tally Entry"
          filenameBase={`tally-entry-${filters.dispatchDate}`}
          columns={COLUMNS}
          rows={exportRows.length === 0 ? exportRows : [...exportRows, totalRow]}
          extraTables={
            qualityRows.length === 0
              ? undefined
              : [{ columns: QUALITY_COLUMNS, rows: [...qualityRows, qualityTotal] }]
          }
        />
      </form>

      <div className="table-wrap table-wrap-scroll update-tally-table-wrap">
        <div className="table-h-scroll">
          <table className="data update-tally-table">
            <thead>
              <tr>
                {COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    className={column.align === "right" ? "cell-num" : undefined}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exportRows.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length}>No dispatches on this date.</td>
                </tr>
              ) : (
                exportRows.map((row, index) => (
                  <tr key={dispatches[index].id}>
                    {COLUMNS.map((column) => (
                      <td
                        key={column.key}
                        className={
                          column.align === "right" ? "cell-num" : undefined
                        }
                      >
                        {row[column.key as keyof typeof row]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
            {exportRows.length > 0 && (
              <tfoot>
                <tr>
                  {COLUMNS.map((column) => (
                    <td
                      key={column.key}
                      className={
                        column.align === "right" ? "cell-num" : undefined
                      }
                    >
                      {TOTAL_KEYS.has(column.key) ? (
                        <strong>
                          {totalRow[column.key as keyof typeof totalRow]}
                        </strong>
                      ) : (
                        totalRow[column.key as keyof typeof totalRow]
                      )}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {qualityRows.length > 0 && (
        <div className="table-wrap update-tally-quality-summary">
          <table className="data">
            <thead>
              <tr>
                {QUALITY_COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    className={column.align === "right" ? "cell-num" : undefined}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {qualityRows.map((row) => (
                <tr key={row.quality}>
                  {QUALITY_COLUMNS.map((column) => (
                    <td
                      key={column.key}
                      className={column.align === "right" ? "cell-num" : undefined}
                    >
                      {row[column.key as keyof typeof row]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                {QUALITY_COLUMNS.map((column) => (
                  <td
                    key={column.key}
                    className={column.align === "right" ? "cell-num" : undefined}
                  >
                    {column.key === "quality" ? (
                      qualityTotal.quality
                    ) : (
                      <strong>
                        {qualityTotal[column.key as keyof typeof qualityTotal]}
                      </strong>
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}
