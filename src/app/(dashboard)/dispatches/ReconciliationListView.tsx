import Link from "next/link";
import { EditDispatchReconcileButton } from "@/components/EditDispatchReconcileButton";
import { ResizableDataTable } from "@/components/ResizableDataTable";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import {
  formatAmount,
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatDispatchTerms,
  formatLorryNumber,
} from "@/lib/domain/format";
import { dayKeyInIst } from "@/lib/auth/sameDayEntryModify";
import { displayDispatchNumber } from "@/lib/domain/dispatchNumbers";
import {
  buildDispatchExportRows,
  dispatchExportColumnsReconciliation,
  displayOrderDigits,
  formatPurchaseGstAmount,
  formatPurchaseTcsAmount,
  formatPurchaseTotalAmount,
  formatSaleGstAmount,
  formatSaleTcsAmount,
  formatSaleTotalAmount,
  type DispatchListData,
} from "./dispatchListShared";

const COLUMN_COUNT = 21;

export function ReconciliationListView({
  data,
  canResizeColumns = false,
}: {
  data: DispatchListData;
  canResizeColumns?: boolean;
}) {
  const { filters, dispatches, customers, vessels } = data;
  const exportRows = buildDispatchExportRows(dispatches);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reconciliation</h1>
          <p className="page-subtitle">
            Confirm purchase and sale details, then mark each dispatch reconciled.
          </p>
        </div>
      </div>

      <form className="filters" method="get" action="/dispatches/reconciliation">
        <label>
          Reconciled
          <select
            name="reconciliationStatus"
            defaultValue={filters.reconciliationStatus}
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="RECONCILED">Reconciled</option>
          </select>
        </label>
        <label>
          Sale PO
          <input
            name="poNumber"
            defaultValue={filters.poNumber}
            placeholder="Search sale PO"
          />
        </label>
        <label>
          Purchase PO
          <input
            name="purchasePoNumber"
            defaultValue={filters.purchasePoNumber}
            placeholder="Search purchase PO"
          />
        </label>
        <label>
          Start date
          <input
            type="date"
            lang="en-GB"
            className="field-input"
            name="dispatchDateStart"
            defaultValue={filters.dispatchDateStart}
            max={filters.dispatchDateEnd || undefined}
          />
        </label>
        <label>
          End date
          <input
            type="date"
            lang="en-GB"
            className="field-input"
            name="dispatchDateEnd"
            defaultValue={filters.dispatchDateEnd}
            min={filters.dispatchDateStart || undefined}
          />
        </label>
        <label>
          Vessel
          <select name="vesselId" defaultValue={filters.vesselId}>
            <option value="">All</option>
            {vessels.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vesselName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Vendor
          <select name="vendorId" defaultValue={filters.vendorId}>
            <option value="">All</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Customer
          <select name="customerId" defaultValue={filters.customerId}>
            <option value="">All</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
        <TableDownloadButtons
          title="Reconciliation"
          filenameBase="dispatch-reconciliation"
          columns={dispatchExportColumnsReconciliation}
          rows={exportRows}
        />
      </form>

      <div className="table-wrap table-wrap-scroll dispatches-table-wrap">
        <ResizableDataTable
          canResize={canResizeColumns}
          storageKey="reconciliation"
          columnCount={COLUMN_COUNT}
          tableClassName="data report-table report-table-reconciliation"
        >
            <thead>
              <tr className="report-group-row">
                <th colSpan={5}>Dispatch</th>
                <th colSpan={7}>Purchase</th>
                <th colSpan={8}>Sale</th>
                <th colSpan={1}></th>
              </tr>
              <tr>
                <th className="col-wrap-head">
                  Dispatch
                  <br />
                  no
                </th>
                <th>Date</th>
                <th className="col-wrap-head">
                  Lorry
                  <br />
                  no
                </th>
                <th className="cell-num">Weight</th>
                <th className="col-wrap-head">
                  GST
                  <br />
                  state
                </th>
                <th className="col-wrap-head col-tight">
                  PO
                  <br />
                  no
                </th>
                <th className="col-wrap-head col-tight">
                  Purchase
                  <br />
                  invoice
                </th>
                <th className="col-tight">Vendor</th>
                <th className="cell-num col-wrap-head col-tight col-amt">
                  Basic
                  <br />
                  price
                </th>
                <th className="cell-num col-tight col-amt">GST</th>
                <th className="cell-num col-tight col-amt">TCS</th>
                <th className="cell-num col-wrap-head col-tight col-amt">
                  Total
                  <br />
                  Amount
                </th>
                <th className="col-wrap-head col-tight">
                  SO
                  <br />
                  no
                </th>
                <th className="col-wrap-head col-tight">
                  Sale
                  <br />
                  invoice
                </th>
                <th className="col-wrap-head col-tight">
                  Customer
                  <br />
                  name
                </th>
                <th className="cell-num col-wrap-head col-tight col-amt">
                  Basic
                  <br />
                  price
                </th>
                <th className="cell-num col-tight col-amt">GST</th>
                <th className="cell-num col-tight col-amt">TCS</th>
                <th className="cell-num col-wrap-head col-tight col-amt">
                  Total
                  <br />
                  Amount
                </th>
                <th className="col-wrap-head">
                  Delivery
                  <br />
                  terms
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dispatches.map((row) => {
                const purchasePoLabel = displayOrderDigits(
                  row.purchasePoNumber,
                  "purchase",
                );
                const salePoLabel = displayOrderDigits(row.salePoNumber, "sale");
                return (
                  <tr key={row.id} data-dispatch-id={row.id}>
                    <td>{displayDispatchNumber(row.dispatchNumber)}</td>
                    <td>
                      {formatDateDdMmYyyy(
                        new Date(row.dispatchDate).toISOString().slice(0, 10),
                      )}
                    </td>
                    <td className={row.lorryNumber ? undefined : "cell-center"}>
                      {formatLorryNumber(row.lorryNumber) ?? "—"}
                    </td>
                    <td className="cell-num">
                      {formatDispatchMt(row.dispatchedQuantity)}
                    </td>
                    <td className={row.gstState ? undefined : "cell-center"}>
                      {row.gstState ?? "—"}
                    </td>
                    <td className="col-tight">
                      {row.purchaseOrderId ? (
                        <Link
                          href={`/purchase-orders/${row.purchaseOrderId}`}
                          className="font-medium"
                        >
                          {purchasePoLabel}
                        </Link>
                      ) : (
                        purchasePoLabel
                      )}
                    </td>
                    <td
                      className={
                        row.purchaseInvoiceNumber
                          ? "col-tight"
                          : "col-tight cell-center"
                      }
                    >
                      {row.purchaseInvoiceNumber ?? "—"}
                    </td>
                    <td
                      className={
                        row.vendorName ? "col-tight" : "col-tight cell-center"
                      }
                    >
                      {row.vendorName ?? "—"}
                    </td>
                    <td className="cell-num col-tight col-amt">
                      {formatAmount(row.purchaseBasicRate)}
                    </td>
                    <td className="cell-num col-tight col-amt">
                      {formatPurchaseGstAmount(
                        row.dispatchedQuantity,
                        row.purchaseBasicRate,
                      )}
                    </td>
                    <td className="cell-num col-tight col-amt">
                      {formatPurchaseTcsAmount(
                        row.dispatchedQuantity,
                        row.purchaseBasicRate,
                      )}
                    </td>
                    <td className="cell-num col-tight col-amt">
                      {formatPurchaseTotalAmount(
                        row.dispatchedQuantity,
                        row.purchaseBasicRate,
                      )}
                    </td>
                    <td className="col-tight">
                      {row.orderId ? (
                        <Link href={`/orders/${row.orderId}`} className="font-medium">
                          {salePoLabel}
                        </Link>
                      ) : (
                        salePoLabel
                      )}
                    </td>
                    <td
                      className={
                        row.saleInvoiceNumber
                          ? "col-tight"
                          : "col-tight cell-center"
                      }
                    >
                      {row.saleInvoiceNumber ?? "—"}
                    </td>
                    <td
                      className={
                        row.customerName ? "col-tight" : "col-tight cell-center"
                      }
                    >
                      {row.customerName ?? "—"}
                    </td>
                    <td className="cell-num col-tight col-amt">
                      {formatAmount(row.saleBasicRate)}
                    </td>
                    <td className="cell-num col-tight col-amt">
                      {formatSaleGstAmount(
                        row.dispatchedQuantity,
                        row.saleBasicRate,
                      )}
                    </td>
                    <td className="cell-num col-tight col-amt">
                      {formatSaleTcsAmount(
                        row.dispatchedQuantity,
                        row.saleBasicRate,
                        row.customerCategory,
                      )}
                    </td>
                    <td className="cell-num col-tight col-amt">
                      {formatSaleTotalAmount(
                        row.dispatchedQuantity,
                        row.saleBasicRate,
                        row.customerCategory,
                      )}
                    </td>
                    <td>{formatDispatchTerms(row.dispatchTerms)}</td>
                    <td>
                      <div className="dispatch-edit-actions">
                        <EditDispatchReconcileButton
                          dispatchId={row.id}
                          reconciled={Boolean(row.reconciled)}
                          reconciledAt={
                            row.reconciliationCompletedAt
                              ? formatDateDdMmYyyy(
                                  dayKeyInIst(
                                    new Date(row.reconciliationCompletedAt),
                                  ),
                                )
                              : null
                          }
                          canEdit={row.canEditReconciliation}
                          rowSummary={{
                            dispatchNumber: displayDispatchNumber(
                              row.dispatchNumber,
                            ),
                            date: formatDateDdMmYyyy(
                              new Date(row.dispatchDate)
                                .toISOString()
                                .slice(0, 10),
                            ),
                            lorryNumber:
                              formatLorryNumber(row.lorryNumber) ?? "—",
                            weight: formatDispatchMt(row.dispatchedQuantity),
                            gstState: row.gstState ?? "—",
                            purchasePo: purchasePoLabel,
                            purchaseInvoice: row.purchaseInvoiceNumber ?? "—",
                            vendor: row.vendorName ?? "—",
                            purchaseBasic: formatAmount(row.purchaseBasicRate),
                            purchaseGst: formatPurchaseGstAmount(
                              row.dispatchedQuantity,
                              row.purchaseBasicRate,
                            ),
                            purchaseTcs: formatPurchaseTcsAmount(
                              row.dispatchedQuantity,
                              row.purchaseBasicRate,
                            ),
                            purchaseInvoiceAmount: formatPurchaseTotalAmount(
                              row.dispatchedQuantity,
                              row.purchaseBasicRate,
                            ),
                            salePo: salePoLabel,
                            saleInvoice: row.saleInvoiceNumber ?? "—",
                            customer: row.customerName ?? "—",
                            saleBasic: formatAmount(row.saleBasicRate),
                            saleGst: formatSaleGstAmount(
                              row.dispatchedQuantity,
                              row.saleBasicRate,
                            ),
                            saleTcs: formatSaleTcsAmount(
                              row.dispatchedQuantity,
                              row.saleBasicRate,
                              row.customerCategory,
                            ),
                            saleInvoiceAmount: formatSaleTotalAmount(
                              row.dispatchedQuantity,
                              row.saleBasicRate,
                              row.customerCategory,
                            ),
                            deliveryTerms: formatDispatchTerms(row.dispatchTerms),
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {dispatches.length === 0 && (
                <tr>
                  <td colSpan={COLUMN_COUNT}>No dispatches match filters.</td>
                </tr>
              )}
            </tbody>
        </ResizableDataTable>
      </div>
    </>
  );
}
