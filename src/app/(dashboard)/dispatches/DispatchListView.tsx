import Link from "next/link";
import { DispatchTerms } from "@/generated/prisma";
import { CreateDispatchButton } from "@/components/CreateDispatchButton";
import { EditDispatchButton } from "@/components/EditDispatchButton";
import { EditDispatchPurchaseButton } from "@/components/EditDispatchPurchaseButton";
import { EditDispatchSaleButton } from "@/components/EditDispatchSaleButton";
import { ResizableDataTable } from "@/components/ResizableDataTable";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import {
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatDispatchTerms,
  formatLorryNumber,
  formatQualityClass,
  formatAmount,
} from "@/lib/domain/format";
import { displayDispatchNumber } from "@/lib/domain/dispatchNumbers";
import {
  buildDispatchExportRows,
  dispatchExportColumns,
  displayOrderDigits,
  formatPurchaseGstAmount,
  formatPurchaseTcsAmount,
  formatPurchaseTotalAmount,
  formatSaleGstAmount,
  formatSaleTcsAmount,
  formatSaleTotalAmount,
  type DispatchListData,
} from "./dispatchListShared";

const COLUMN_COUNT = 29;

export function DispatchListView({
  filterPath,
  linkPoNumbers,
  showCreateButton,
  exportTitle,
  exportFilenameBase,
  exportColumns = dispatchExportColumns,
  data,
  canResizeColumns = false,
}: {
  filterPath: string;
  linkPoNumbers: boolean;
  showCreateButton: boolean;
  exportTitle: string;
  exportFilenameBase: string;
  exportColumns?: typeof dispatchExportColumns;
  data: DispatchListData;
  canResizeColumns?: boolean;
}) {
  const {
    filters,
    dispatches,
    customers,
    vessels,
    balanceOrders,
    balancePurchases,
    transporters,
    suggestedPo,
    suggestedPurchasePo,
    suggestedDispatchNumber,
    customerOpts,
    activeVessels,
  } = data;

  const exportRows = buildDispatchExportRows(dispatches);

  return (
    <>
      {showCreateButton ? (
        <div className="page-header">
          <div>
            <h1 className="page-title">Complete Dispatch</h1>
            <p className="page-subtitle">
              All truck movements, receipts, and quantity diffs.
            </p>
          </div>
          <CreateDispatchButton
            orders={balanceOrders}
            purchaseOrders={balancePurchases}
            transporters={transporters}
            customers={customerOpts}
            vessels={activeVessels}
            suggestedPo={suggestedPo}
            suggestedPurchasePo={suggestedPurchasePo}
            suggestedDispatchNumber={suggestedDispatchNumber}
          />
        </div>
      ) : null}

      <form className="filters" method="get" action={filterPath}>
        <label>
          Receipt status
          <select name="receiptStatus" defaultValue={filters.receiptStatus}>
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="RECEIVED">RECEIVED</option>
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
          Dispatch date
          <input
            type="date"
            name="dispatchDate"
            defaultValue={filters.dispatchDate}
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
          title={exportTitle}
          filenameBase={exportFilenameBase}
          columns={exportColumns}
          rows={exportRows}
        />
      </form>

      <div className="table-wrap table-wrap-scroll dispatches-table-wrap">
        <ResizableDataTable
          canResize={canResizeColumns}
          storageKey="complete-dispatch"
          columnCount={COLUMN_COUNT}
          tableClassName="data report-table report-table-dispatches"
        >
            <thead>
              <tr className="report-group-row">
                <th colSpan={7}>Dispatch</th>
                <th colSpan={7}>Purchase</th>
                <th colSpan={7}>Sale</th>
                <th colSpan={4}>Transport</th>
                <th colSpan={3}>Status</th>
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
                <th className="col-wrap-head col-tight">
                  Vessel
                  <br />
                  name
                </th>
                <th className="col-tight">Quality</th>
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
                  Invoice
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
                  Invoice
                  <br />
                  Amount
                </th>
                <th className="col-wrap-head">
                  Delivery
                  <br />
                  terms
                </th>
                <th className="col-wrap-head col-tight">
                  Transporter
                  <br />
                  name
                </th>
                <th className="cell-num col-wrap-head col-tight col-amt">
                  Freight
                  <br />
                  PMT
                </th>
                <th className="cell-num col-wrap-head col-tight col-amt">
                  Freight
                  <br />
                  amount
                </th>
                <th className="cell-num">Received</th>
                <th className="cell-num">Diff</th>
                <th className="cell-center col-wrap-head col-tight">
                  Purchase
                  <br />
                  in tally
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dispatches.map((row) => {
                const isExPort = row.dispatchTerms === DispatchTerms.EX_PORT;
                const receivedQty = isExPort
                  ? row.dispatchedQuantity
                  : row.receivingQuantity;
                const diffQty = isExPort ? 0 : row.diffInQuantity;
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
                    <td className={row.vesselName ? "col-tight" : "col-tight cell-center"}>
                      {row.vesselName || "—"}
                    </td>
                    <td className="col-tight">
                      {formatQualityClass(row.qualityClass)}
                    </td>
                    <td className={row.gstState ? undefined : "cell-center"}>
                      {row.gstState ?? "—"}
                    </td>
                    <td className="col-tight">
                      {linkPoNumbers && row.purchaseOrderId ? (
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
                      {linkPoNumbers && row.orderId ? (
                        <Link
                          href={`/orders/${row.orderId}`}
                          className="font-medium"
                        >
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
                        row.customerName
                          ? "col-tight"
                          : "col-tight cell-center"
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
                    <td
                      className={
                        row.transporterName
                          ? "col-tight"
                          : "col-tight cell-center"
                      }
                    >
                      {row.transporterName ?? "—"}
                    </td>
                    <td className="cell-num col-tight col-amt">
                      {formatAmount(row.freight)}
                    </td>
                    <td className="cell-num col-tight col-amt">
                      {formatAmount(row.freightAmount)}
                    </td>
                    <td
                      className={
                        receivedQty != null ? "cell-num" : "cell-center"
                      }
                    >
                      {formatDispatchMt(receivedQty)}
                    </td>
                    <td
                      className={diffQty != null ? "cell-num" : "cell-center"}
                    >
                      {formatDispatchMt(diffQty)}
                    </td>
                    <td className="cell-center col-tight">
                      {row.entryInTally ? "Yes" : "—"}
                    </td>
                    <td>
                      <div className="dispatch-edit-actions">
                        <EditDispatchButton
                          dispatchId={row.id}
                          dispatchDate={new Date(row.dispatchDate)
                            .toISOString()
                            .slice(0, 10)}
                          lorryNumber={row.lorryNumber}
                          dispatchedQuantity={row.dispatchedQuantity.toString()}
                          purchasePoNumber={row.purchasePoNumber}
                          salePoNumber={row.salePoNumber}
                          dispatchTerms={row.dispatchTerms}
                          transporterId={row.transporterId}
                          freight={row.freight?.toString() ?? null}
                          saleInvoiceNumber={row.saleInvoiceNumber}
                          purchaseInvoiceNumber={row.purchaseInvoiceNumber}
                          receivingQuantity={
                            row.receivingQuantity?.toString() ?? null
                          }
                          entryInTally={row.entryInTally}
                          currentSaleCustomerName={row.customerName}
                          currentPurchaseVendorName={row.vendorName}
                          currentVesselName={row.vesselName}
                          orders={balanceOrders}
                          purchaseOrders={balancePurchases}
                          transporters={transporters}
                          customers={customerOpts}
                          vessels={activeVessels}
                          suggestedPo={suggestedPo}
                          suggestedPurchasePo={suggestedPurchasePo}
                          canEdit={row.canEdit}
                        />
                        <EditDispatchPurchaseButton
                          dispatchId={row.id}
                          purchaseInvoiceNumber={row.purchaseInvoiceNumber}
                          entryInTally={row.entryInTally}
                          canEdit={row.canEditPurchase}
                        />
                        <EditDispatchSaleButton
                          dispatchId={row.id}
                          saleInvoiceNumber={row.saleInvoiceNumber}
                          dispatchedQuantity={row.dispatchedQuantity.toString()}
                          receivingQuantity={
                            row.receivingQuantity?.toString() ?? null
                          }
                          dispatchTerms={row.dispatchTerms}
                          canEdit={row.canEditSale}
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
