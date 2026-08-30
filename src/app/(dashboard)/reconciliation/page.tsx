import { listReconciliation } from "@/lib/actions/receipts";
import { formatLorryNumber, formatMt } from "@/lib/domain/format";

export default async function ReconciliationPage() {
  const rows = await listReconciliation();

  return (
    <div>
      <h1 className="page-title">Reconciliation</h1>
      <p className="page-subtitle">
        Received dispatches where dispatched quantity ≠ receiving quantity.
      </p>

      <div className="table-wrap">
        <div className="table-h-scroll"><table className="data">
          <thead>
            <tr>
              <th>PO</th>
              <th>Vessel</th>
              <th>Importer</th>
              <th>Dispatch date</th>
              <th>Receipt date</th>
              <th className="num">Dispatched</th>
              <th className="num">Received</th>
              <th className="num">Diff</th>
              <th>Lorry</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.poNumber}</td>
                <td>{row.vessel?.vesselName}</td>
                <td>{row.importer?.name ?? "—"}</td>
                <td>{new Date(row.dispatchDate).toISOString().slice(0, 10)}</td>
                <td>
                  {row.receiptDate
                    ? new Date(row.receiptDate).toISOString().slice(0, 10)
                    : "—"}
                </td>
                <td className="num">{formatMt(row.dispatchedQuantity)}</td>
                <td className="num">{formatMt(row.receivingQuantity)}</td>
                <td className="num font-semibold text-red-700">
                  {formatMt(row.diffInQuantity)}
                </td>
                <td>{formatLorryNumber(row.lorryNumber) ?? "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9}>No quantity differences.</td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
