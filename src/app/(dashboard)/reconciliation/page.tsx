import { listReconciliation } from "@/lib/actions/receipts";

export default async function ReconciliationPage() {
  const rows = await listReconciliation();

  return (
    <div>
      <h1 className="page-title">Reconciliation</h1>
      <p className="page-subtitle">
        Received dispatches where dispatched quantity ≠ receiving quantity.
      </p>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>PO</th>
              <th>Vessel</th>
              <th>Importer</th>
              <th>Dispatch date</th>
              <th>Receipt date</th>
              <th>Dispatched (MT)</th>
              <th>Received (MT)</th>
              <th>Diff (MT)</th>
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
                <td>{row.dispatchedQuantity.toString()}</td>
                <td>
                  {row.receivingQuantity != null
                    ? row.receivingQuantity.toString()
                    : "—"}
                </td>
                <td className="font-semibold text-red-700">
                  {row.diffInQuantity != null
                    ? row.diffInQuantity.toString()
                    : "—"}
                </td>
                <td>{row.lorryNumber ?? "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9}>No quantity differences.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
