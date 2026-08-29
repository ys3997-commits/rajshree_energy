"use client";

import { FormEvent, useState } from "react";
import { confirmReceipt } from "@/lib/actions/dispatch";
import { formatLorryNumber, formatMt } from "@/lib/domain/format";

type Row = {
  id: string;
  poNumber: string;
  dispatchDate: string;
  dispatchedQuantity: string;
  lorryNumber: string | null;
  vessel: { vesselName: string } | null;
  importer: { name: string } | null;
};

export function PendingReceiptsClient({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [receivingQty, setReceivingQty] = useState("");

  async function onConfirm(e: FormEvent, id: string) {
    e.preventDefault();
    setError(null);
    try {
      await confirmReceipt(id, receivingQty);
      setRows((prev) => prev.filter((r) => r.id !== id));
      setActiveId(null);
      setReceivingQty("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirm failed");
    }
  }

  return (
    <div>
      <h1 className="page-title">Pending receipts</h1>
      <p className="page-subtitle">
        Confirm receiving quantity. Order and vessel balances stay unchanged.
      </p>
      {error && <div className="error-box">{error}</div>}

      <div className="table-wrap">
        <div className="table-h-scroll"><table className="data">
          <thead>
            <tr>
              <th>Dispatch date</th>
              <th>PO</th>
              <th>Vessel</th>
              <th>Importer</th>
              <th className="num">Dispatched (MT)</th>
              <th>Lorry</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{new Date(row.dispatchDate).toISOString().slice(0, 10)}</td>
                <td>{row.poNumber}</td>
                <td>{row.vessel?.vesselName}</td>
                <td>{row.importer?.name ?? "—"}</td>
                <td className="num">{formatMt(row.dispatchedQuantity)}</td>
                <td>{formatLorryNumber(row.lorryNumber) ?? "—"}</td>
                <td>
                  {activeId === row.id ? (
                    <form
                      onSubmit={(e) => onConfirm(e, row.id)}
                      className="flex items-center gap-2"
                    >
                      <div className="field-with-unit">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={receivingQty}
                          onChange={(e) => setReceivingQty(e.target.value)}
                          className="w-28"
                        />
                        <span className="field-unit">MT</span>
                      </div>
                      <button type="submit" className="btn">
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setActiveId(null);
                          setReceivingQty("");
                        }}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setActiveId(row.id);
                        setReceivingQty(row.dispatchedQuantity);
                      }}
                    >
                      Confirm receipt
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7}>No pending receipts.</td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
