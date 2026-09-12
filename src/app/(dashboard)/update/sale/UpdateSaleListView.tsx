import { DispatchTerms } from "@/generated/prisma";
import { EditDispatchSaleButton } from "@/components/EditDispatchSaleButton";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { TableRefreshButton } from "@/components/TableRefreshButton";
import {
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatDispatchTerms,
  formatLorryNumber,
  formatAmount,
} from "@/lib/domain/format";
import { displayDispatchNumber } from "@/lib/domain/dispatchNumbers";
import { isUpdateSaleReceivingOverdue } from "@/lib/domain/updateSale";
import {
  buildUpdateSaleExportRows,
  dispatchExportColumnsUpdateSale,
  formatSaleGstAmount,
  formatSaleTcsAmount,
  formatSaleTotalAmount,
  type DispatchListData,
} from "../../dispatches/dispatchListShared";
import { UpdateTableInteraction } from "@/components/UpdateTableInteraction";

const COLUMN_COUNT = 15;

export function UpdateSaleListView({ data }: { data: DispatchListData }) {
  const { filters, dispatches, customers, ports } = data;
  const exportRows = buildUpdateSaleExportRows(dispatches);

  return (
    <>
      <form className="filters" method="get" action="/update/sale">
        <label>
          Received Qty
          <select
            name="receivedQtyStatus"
            defaultValue={filters.receivedQtyStatus}
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
        <label>
          Domestic / Imported
          <select name="coalOrigin" defaultValue={filters.coalOrigin}>
            <option value="">All</option>
            <option value="domestic">Domestic</option>
            <option value="imported">Imported</option>
          </select>
        </label>
        <label>
          Port
          <select name="portId" defaultValue={filters.portId}>
            <option value="">All</option>
            {ports.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Delivery Terms
          <select name="dispatchTerms" defaultValue={filters.dispatchTerms}>
            <option value="">All</option>
            <option value={DispatchTerms.FOR}>FOR</option>
            <option value={DispatchTerms.EX_PORT}>Ex-Port</option>
          </select>
        </label>
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
        <TableRefreshButton />
        <TableDownloadButtons
          title="Update — Sales"
          filenameBase="update-sale"
          columns={dispatchExportColumnsUpdateSale}
          rows={exportRows}
        />
      </form>

      <div className="table-wrap table-wrap-scroll update-sale-table-wrap">
        <div className="table-h-scroll">
          <UpdateTableInteraction className="data update-sale-table">
            <colgroup>
              <col className="update-sale-col-dispatch" />
              <col className="update-sale-col-date" />
              <col className="update-sale-col-invoice" />
              <col className="update-sale-col-lorry" />
              <col className="update-sale-col-weight" />
              <col className="update-sale-col-amt" />
              <col className="update-sale-col-amt" />
              <col className="update-sale-col-amt" />
              <col className="update-sale-col-amt" />
              <col className="update-sale-col-customer" />
              <col className="update-sale-col-terms" />
              <col className="update-sale-col-transporter" />
              <col className="update-sale-col-qty" />
              <col className="update-sale-col-qty" />
              <col className="update-sale-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th className="update-sale-dispatch-col">Dispatch No</th>
                <th className="update-sale-date-col">Date</th>
                <th className="update-sale-invoice-col">Sale Invoice</th>
                <th className="update-sale-lorry-col">Lorry No</th>
                <th className="cell-num update-sale-weight-col">Loading Qty</th>
                <th className="cell-num">Basic Price</th>
                <th className="cell-num">GST</th>
                <th className="cell-num">TCS</th>
                <th className="cell-num">Total Amount</th>
                <th>Customer</th>
                <th>Delivery Terms</th>
                <th>Transporter Name</th>
                <th className="cell-num">Received Qty</th>
                <th className="cell-num">Diff Qty</th>
                <th className="update-sale-actions-col"></th>
              </tr>
            </thead>
            <tbody>
              {dispatches.map((row) => {
                const isExPort = row.dispatchTerms === DispatchTerms.EX_PORT;
                const receivedQty = isExPort
                  ? row.dispatchedQuantity
                  : row.receivingQuantity;
                const diffQty = isExPort ? 0 : row.diffInQuantity;
                const gstAmount = formatSaleGstAmount(
                  row.dispatchedQuantity,
                  row.saleBasicRate,
                );
                const tcsAmount = formatSaleTcsAmount(
                  row.dispatchedQuantity,
                  row.saleBasicRate,
                  row.customerCategory,
                );
                const totalAmount = formatSaleTotalAmount(
                  row.dispatchedQuantity,
                  row.saleBasicRate,
                  row.customerCategory,
                );
                const overdue = isUpdateSaleReceivingOverdue(row);

                return (
                  <tr
                    key={row.id}
                    data-dispatch-id={row.id}
                    className={overdue ? "collection-row-due-call" : undefined}
                  >
                    <td className="update-sale-dispatch-col">
                      {displayDispatchNumber(row.dispatchNumber)}
                    </td>
                    <td className="update-sale-date-col">
                      {formatDateDdMmYyyy(
                        new Date(row.dispatchDate).toISOString().slice(0, 10),
                      )}
                    </td>
                    <td
                      className={`update-sale-invoice-col${
                        row.saleInvoiceNumber ? "" : " cell-center"
                      }`}
                    >
                      {row.saleInvoiceNumber ?? "—"}
                    </td>
                    <td
                      className={`update-sale-lorry-col${
                        row.lorryNumber ? "" : " cell-center"
                      }`}
                    >
                      {formatLorryNumber(row.lorryNumber) ?? "—"}
                    </td>
                    <td className="cell-num update-sale-weight-col">
                      {formatDispatchMt(row.dispatchedQuantity)}
                    </td>
                    <td className="cell-num">
                      {formatAmount(row.saleBasicRate)}
                    </td>
                    <td className="cell-num">{gstAmount}</td>
                    <td className="cell-num">{tcsAmount}</td>
                    <td className="cell-num">{totalAmount}</td>
                    <td
                      className={`update-sale-customer-cell${
                        row.customerName ? "" : " cell-center"
                      }`}
                      title={row.customerName ?? undefined}
                    >
                      {row.customerName ?? "—"}
                    </td>
                    <td>{formatDispatchTerms(row.dispatchTerms)}</td>
                    <td
                      className={`update-sale-transporter-cell${
                        row.transporterName ? "" : " cell-center"
                      }`}
                      title={row.transporterName ?? undefined}
                    >
                      {row.transporterName ?? "—"}
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
                    <td className="update-sale-actions-col">
                      <div className="dispatch-edit-actions">
                        <EditDispatchSaleButton
                          dispatchId={row.id}
                          saleInvoiceNumber={row.saleInvoiceNumber}
                          dispatchedQuantity={row.dispatchedQuantity.toString()}
                          receivingQuantity={
                            row.receivingQuantity?.toString() ?? null
                          }
                          dispatchTerms={row.dispatchTerms}
                          canEdit={row.canEditSale}
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
                            basicPrice: formatAmount(row.saleBasicRate),
                            gst: gstAmount,
                            tcs: tcsAmount,
                            totalAmount,
                            customer: row.customerName ?? "—",
                            deliveryTerms: formatDispatchTerms(
                              row.dispatchTerms,
                            ),
                            transporter: row.transporterName ?? "—",
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
          </UpdateTableInteraction>
        </div>
      </div>
    </>
  );
}
