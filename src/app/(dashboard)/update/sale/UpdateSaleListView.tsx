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
import {
  buildUpdateSaleExportRows,
  dispatchExportColumnsUpdateSale,
  type DispatchListData,
} from "../../dispatches/dispatchListShared";

const COLUMN_COUNT = 13;

export function UpdateSaleListView({ data }: { data: DispatchListData }) {
  const { filters, dispatches, customers } = data;
  const exportRows = buildUpdateSaleExportRows(dispatches);

  return (
    <>
      <form className="filters" method="get" action="/update/sale">
        <label>
          Sale status
          <select name="saleUpdateStatus" defaultValue={filters.saleUpdateStatus}>
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
          <table className="data update-sale-table">
            <colgroup>
              <col className="update-sale-col-dispatch" />
              <col className="update-sale-col-date" />
              <col className="update-sale-col-invoice" />
              <col className="update-sale-col-lorry" />
              <col className="update-sale-col-qty" />
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
                <th>Sale Invoice</th>
                <th>Lorry No</th>
                <th className="cell-num">Weight</th>
                <th className="cell-num">Basic Price</th>
                <th className="cell-num">Total Price</th>
                <th>Customer</th>
                <th>Delivery Terms</th>
                <th>Transporter Name</th>
                <th className="cell-num">Received</th>
                <th className="cell-num">Diff</th>
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

                return (
                  <tr key={row.id}>
                    <td className="update-sale-dispatch-col">
                      {displayDispatchNumber(row.dispatchNumber)}
                    </td>
                    <td className="update-sale-date-col">
                      {formatDateDdMmYyyy(
                        new Date(row.dispatchDate).toISOString().slice(0, 10),
                      )}
                    </td>
                    <td
                      className={
                        row.saleInvoiceNumber ? undefined : "cell-center"
                      }
                    >
                      {row.saleInvoiceNumber ?? "—"}
                    </td>
                    <td className={row.lorryNumber ? undefined : "cell-center"}>
                      {formatLorryNumber(row.lorryNumber) ?? "—"}
                    </td>
                    <td className="cell-num">
                      {formatDispatchMt(row.dispatchedQuantity)}
                    </td>
                    <td className="cell-num">
                      {formatAmount(row.saleBasicRate)}
                    </td>
                    <td className="cell-num">
                      {formatAmount(row.saleTotalRate)}
                    </td>
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
                            totalPrice: formatAmount(row.saleTotalRate),
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
          </table>
        </div>
      </div>
    </>
  );
}
