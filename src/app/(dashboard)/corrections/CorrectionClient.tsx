"use client";

import { useMemo, useState, useTransition } from "react";
import { Modal } from "@/components/Modal";
import { SearchableSelect } from "@/components/SearchableSelect";
import {
  createCorrection,
  deleteCorrection,
  updateCorrection,
  updateCorrectionStatus,
  type CorrectionDispatchOption,
  type CorrectionRow,
} from "@/lib/actions/corrections";
import {
  CORRECTION_STATUS_LABEL,
  MAX_CORRECTION_MESSAGE_CHARS,
  type CorrectionStatus,
} from "@/lib/domain/corrections";

function sortCorrectionRows(rows: CorrectionRow[]): CorrectionRow[] {
  return [...rows].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "PENDING" ? -1 : 1;
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function CorrectionClient({
  dispatchOptions,
  initialRows,
}: {
  dispatchOptions: CorrectionDispatchOption[];
  initialRows: CorrectionRow[];
}) {
  const [dispatchId, setDispatchId] = useState("");
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState(() => sortCorrectionRows(initialRows));
  const [error, setError] = useState("");
  const [saving, startSave] = useTransition();
  const [statusPendingId, setStatusPendingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<CorrectionRow | null>(null);
  const [editDispatchId, setEditDispatchId] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editError, setEditError] = useState("");

  const selectOptions = useMemo(
    () =>
      dispatchOptions.map((option) => ({
        value: option.id,
        label: option.label,
      })),
    [dispatchOptions],
  );

  const pendingCount = rows.filter((row) => row.status === "PENDING").length;

  function setSortedRows(
    updater: CorrectionRow[] | ((prev: CorrectionRow[]) => CorrectionRow[]),
  ) {
    setRows((prev) =>
      sortCorrectionRows(
        typeof updater === "function" ? updater(prev) : updater,
      ),
    );
  }

  function openEdit(row: CorrectionRow) {
    setEditing(row);
    setEditDispatchId(row.dispatchId);
    setEditMessage(row.message);
    setEditError("");
  }

  function closeEdit() {
    if (saving) return;
    setEditing(null);
    setEditError("");
  }

  function onAdd() {
    setError("");
    if (!dispatchId) {
      setError("Select a dispatch number");
      return;
    }
    if (!message.trim()) {
      setError("Write what needs to be corrected");
      return;
    }
    startSave(async () => {
      try {
        const created = await createCorrection({
          dispatchId,
          message,
        });
        setSortedRows((prev) => [created, ...prev]);
        setMessage("");
        setDispatchId("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not add correction",
        );
      }
    });
  }

  function onSaveEdit() {
    if (!editing) return;
    setEditError("");
    if (!editDispatchId) {
      setEditError("Select a dispatch number");
      return;
    }
    if (!editMessage.trim()) {
      setEditError("Write what needs to be corrected");
      return;
    }
    const id = editing.id;
    startSave(async () => {
      try {
        const updated = await updateCorrection({
          id,
          dispatchId: editDispatchId,
          message: editMessage,
        });
        setSortedRows((prev) =>
          prev.map((item) => (item.id === id ? updated : item)),
        );
        setEditing(null);
      } catch (err) {
        setEditError(
          err instanceof Error ? err.message : "Could not save changes",
        );
      }
    });
  }

  function onToggleStatus(row: CorrectionRow) {
    const nextStatus: CorrectionStatus =
      row.status === "PENDING" ? "DONE" : "PENDING";
    setError("");
    setStatusPendingId(row.id);
    startSave(async () => {
      try {
        const updated = await updateCorrectionStatus({
          id: row.id,
          status: nextStatus,
        });
        setSortedRows((prev) =>
          prev.map((item) => (item.id === row.id ? updated : item)),
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not update status",
        );
      } finally {
        setStatusPendingId(null);
      }
    });
  }

  function onDelete(row: CorrectionRow) {
    if (
      !window.confirm(
        `Delete correction for ${row.dispatchLabel}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setError("");
    startSave(async () => {
      try {
        await deleteCorrection({ id: row.id });
        setSortedRows((prev) => prev.filter((item) => item.id !== row.id));
        if (editing?.id === row.id) setEditing(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not delete correction",
        );
      }
    });
  }

  return (
    <div className="correction-page">
      <div className="page-header">
        <h1 className="page-title">Correction</h1>
        {pendingCount > 0 ? (
          <span className="correction-pending-count">
            {pendingCount} pending
          </span>
        ) : null}
      </div>

      <section className="correction-compose">
        <div className="correction-compose-grid">
          <label className="correction-dispatch-label">
            Dispatch no
            <SearchableSelect
              value={dispatchId}
              onChange={(value) => {
                setDispatchId(value);
                setError("");
              }}
              options={selectOptions}
              placeholder="Search dispatch no"
              ariaLabel="Dispatch number"
              className="field-input correction-dispatch-input"
            />
          </label>

          <label className="correction-message-label">
            Correction message
            <textarea
              className="field-input correction-message"
              rows={3}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="What needs to be corrected?"
              maxLength={MAX_CORRECTION_MESSAGE_CHARS}
              disabled={saving}
            />
          </label>

          <div className="correction-compose-actions">
            <button
              type="button"
              className="btn"
              onClick={onAdd}
              disabled={saving || !dispatchId || !message.trim()}
            >
              {saving && !statusPendingId && !editing ? "Adding…" : "Add"}
            </button>
          </div>
        </div>

        {error ? <div className="error-box">{error}</div> : null}
      </section>

      <section className="correction-list">
        <div className="table-wrap">
          <table className="data correction-table">
            <colgroup>
              <col className="correction-col-dispatch" />
              <col className="correction-col-message" />
              <col className="correction-col-status" />
              <col className="correction-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th>Dispatch No</th>
                <th>Correction Message</th>
                <th className="cell-center">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="cell-center">
                    No corrections yet. Add one above.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const pending = row.status === "PENDING";
                  const busy = saving && statusPendingId === row.id;
                  return (
                    <tr key={row.id}>
                      <td className="font-medium correction-dispatch-cell">
                        {row.dispatchLabel}
                      </td>
                      <td>
                        <p
                          className="correction-message-cell"
                          title={row.message}
                        >
                          {row.message}
                        </p>
                      </td>
                      <td className="cell-center">
                        <button
                          type="button"
                          className={
                            pending
                              ? "btn btn-sm btn-checklist-pending"
                              : "btn btn-sm btn-checklist-complete"
                          }
                          onClick={() => onToggleStatus(row)}
                          disabled={busy}
                          title={
                            pending
                              ? "Click to mark done"
                              : "Click to reopen"
                          }
                        >
                          {busy
                            ? "…"
                            : CORRECTION_STATUS_LABEL[row.status]}
                        </button>
                      </td>
                      <td className="cell-center">
                        <div className="correction-row-actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEdit(row)}
                            disabled={saving}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => onDelete(row)}
                            disabled={saving}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={editing != null}
        title="Edit correction"
        onClose={closeEdit}
      >
        {editing ? (
          <div className="correction-edit-form">
            <label className="correction-dispatch-label">
              Dispatch no
              <SearchableSelect
                value={editDispatchId}
                onChange={(value) => {
                  setEditDispatchId(value);
                  setEditError("");
                }}
                options={selectOptions}
                placeholder="Search dispatch no"
                ariaLabel="Dispatch number"
              />
            </label>

            <label className="correction-message-label">
              Correction message
              <textarea
                className="field-input correction-message"
                rows={4}
                value={editMessage}
                onChange={(event) => setEditMessage(event.target.value)}
                placeholder="What needs to be corrected?"
                maxLength={MAX_CORRECTION_MESSAGE_CHARS}
                disabled={saving}
              />
            </label>

            {editError ? <div className="error-box">{editError}</div> : null}

            <div className="correction-edit-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeEdit}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                onClick={onSaveEdit}
                disabled={
                  saving || !editDispatchId || !editMessage.trim()
                }
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
