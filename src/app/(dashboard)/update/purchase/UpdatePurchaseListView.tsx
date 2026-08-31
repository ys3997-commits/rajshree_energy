import { EditDispatchPurchaseButton } from "@/components/EditDispatchPurchaseButton";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { TableRefreshButton } from "@/components/TableRefreshButton";
import {
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatLorryNumber,
  formatAmount,
} from "@/lib/domain/format";
import { displayDispatchNumber } from "@/lib/domain/dispatchNumbers";
import {
  buildUpdatePurchaseExportRows,
  dispatchExportColumnsPurchaseInvoiceAfterDate,
  formatPurchaseBasicAmount,
  formatPurchaseGstAmount,
  formatPurchaseTcsAmount,
  formatPurchaseTotalAmount,
  type DispatchListData,
} from "../../dispatches/dispatchListShared";

const COLUMN_COUNT = 14;

export function UpdatePurchaseListView({ data }: { data: DispatchListData }) {
  const { filters, dispatches, customers, vessels } = data;
  const exportRows = buildUpdatePurchaseExportRows(dispatches);

  return (
    <>
      <form className="filters" method="get" action="/update/purchase">
        <label>
          Purchase status
          <select
            name="purchaseUpdateStatus"
            defaultValue={filters.purchaseUpdateStatus}
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="RECEIVED">Received</option>
          </select>
        </label>
        <label>
          Date start
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
          Date end
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
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
        <TableRefreshButton />
        <TableDownloadButtons
          title="Update — Purchases"
          filenameBase="update-purchase"
          columns={dispatchExportColumnsPurchaseInvoiceAfterDate}
          rows={exportRows}
        />
      </form>

      <div className="table-wrap table-wrap-scroll update-purchase-table-wrap">
        <div className="table-h-scroll">
          <table className="data update-purchase-table">
            <colgroup>
              <col className="update-purchase-col-dispatch" />
              <col className="update-purchase-col-date" />
              <col className="update-purchase-col-invoice" />
              <col className="update-purchase-col-lorry" />
              <col className="update-purchase-col-qty" />
              <col className="update-purchase-col-amt" />
              <col className="update-purchase-col-amt" />
              <col className="update-purchase-col-amt" />
              <col className="update-purchase-col-amt" />
              <col className="update-purchase-col-amt" />
              <col className="update-purchase-col-vendor" />
              <col className="update-purchase-col-gst-state" />
              <col className="update-purchase-col-tally" />
              <col className="update-purchase-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th>Dispatch No</th>
                <th>Date</th>
                <th>Purchase Invoice</th>
                <th>Lorry No</th>
                <th className="cell-num">Weight</th>
                <th className="cell-num">Basic Price</th>
                <th className="cell-num">Basic Amount</th>
                <th className="cell-num">GST</th>
                <th className="cell-num">TCS</th>
                <th className="cell-num">Total Amount</th>
                <th>Vendor</th>
                <th>GST State</th>
                <th className="cell-center">Purchase in Tally</th>
                <th className="update-purchase-actions-col"></th>
              </tr>
            </thead>
            <tbody>
              {dispatches.map((row) => (
                <tr key={row.id}>
                  <td>{displayDispatchNumber(row.dispatchNumber)}</td>
                  <td>
                    {formatDateDdMmYyyy(
                      new Date(row.dispatchDate).toISOString().slice(0, 10),
                    )}
                  </td>
                  <td
                    className={
                      row.purchaseInvoiceNumber ? undefined : "cell-center"
                    }
                  >
                    {row.purchaseInvoiceNumber ?? "—"}
                  </td>
                  <td className={row.lorryNumber ? undefined : "cell-center"}>
                    {formatLorryNumber(row.lorryNumber) ?? "—"}
                  </td>
                  <td className="cell-num">
                    {formatDispatchMt(row.dispatchedQuantity)}
                  </td>
                  <td className="cell-num">
                    {formatAmount(row.purchaseBasicRate)}
                  </td>
                  <td className="cell-num">
                    {formatPurchaseBasicAmount(
                      row.dispatchedQuantity,
                      row.purchaseBasicRate,
                    )}
                  </td>
                  <td className="cell-num">
                    {formatPurchaseGstAmount(
                      row.dispatchedQuantity,
                      row.purchaseBasicRate,
                    )}
                  </td>
                  <td className="cell-num">
                    {formatPurchaseTcsAmount(
                      row.dispatchedQuantity,
                      row.purchaseBasicRate,
                    )}
                  </td>
                  <td className="cell-num">
                    {formatPurchaseTotalAmount(
                      row.dispatchedQuantity,
                      row.purchaseBasicRate,
                    )}
                  </td>
                  <td
                    className={`update-purchase-vendor-cell${
                      row.vendorName ? "" : " cell-center"
                    }`}
                    title={row.vendorName ?? undefined}
                  >
                    {row.vendorName ?? "—"}
                  </td>
                  <td className={row.gstState ? undefined : "cell-center"}>
                    {row.gstState ?? "—"}
                  </td>
                  <td className="cell-center">
                    {row.entryInTally ? "Yes" : "—"}
                  </td>
                  <td className="update-purchase-actions-col">
                    <div className="dispatch-edit-actions">
                      <EditDispatchPurchaseButton
                        dispatchId={row.id}
                        purchaseInvoiceNumber={row.purchaseInvoiceNumber}
                        entryInTally={row.entryInTally}
                        canEdit={row.canEditPurchase}
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
                          basicPrice: formatAmount(row.purchaseBasicRate),
                          basicAmount: formatPurchaseBasicAmount(
                            row.dispatchedQuantity,
                            row.purchaseBasicRate,
                          ),
                          gst: formatPurchaseGstAmount(
                            row.dispatchedQuantity,
                            row.purchaseBasicRate,
                          ),
                          tcs: formatPurchaseTcsAmount(
                            row.dispatchedQuantity,
                            row.purchaseBasicRate,
                          ),
                          totalAmount: formatPurchaseTotalAmount(
                            row.dispatchedQuantity,
                            row.purchaseBasicRate,
                          ),
                          vendor: row.vendorName ?? "—",
                          gstState: row.gstState ?? "—",
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {dispatches.length === 0 && (
                <tr>
                  <td colSpan={COLUMN_COUNT}>No dispatches match filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
