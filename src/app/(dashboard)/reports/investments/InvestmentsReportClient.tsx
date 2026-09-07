"use client";

import { FormEvent, Fragment, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import {
  createInvestmentPeriod,
  deleteInvestmentPeriod,
  deleteInvestmentPeriodValuesForCompany,
  moveInvestmentPeriod,
  saveInvestmentPeriodValues,
  updateInvestmentPeriod,
  type InvestmentPeriodColumn,
  type InvestmentReportRow,
} from "@/lib/actions/investmentReport";
import {
  capitalizeName,
  formatDateDdMmYyyy,
  formatIndianAmountTyping,
  formatRs,
  parseAmountInput,
} from "@/lib/domain/format";
import { investmentPeriodPercent } from "@/lib/domain/investmentPeriodReturn";

type PeriodForm = {
  name: string;
  startDate: string;
  endDate: string;
};

type AmountMap = Record<string, string>;

function emptyPeriodForm(): PeriodForm {
  return {
    name: "",
    startDate: "",
    endDate: "",
  };
}

function emptyAmounts(periods: InvestmentPeriodColumn[]): AmountMap {
  const map: AmountMap = {};
  for (const period of periods) map[period.id] = "";
  return map;
}

function changeAmountValue(value: string): string | null {
  let raw = parseAmountInput(value).replace(/[^\d.-]/g, "");
  const negative = raw.startsWith("-");
  raw = raw.replace(/-/g, "");
  if (negative) raw = `-${raw}`;
  if (raw === "" || raw === "-") return raw;
  if (!/^-?\d*\.?\d{0,2}$/.test(raw)) return null;
  return raw;
}

function amountDisplay(value: string): string {
  if (value === "-" || value.startsWith("-")) {
    return `-${formatIndianAmountTyping(value.replace(/^-/, ""))}`;
  }
  return formatIndianAmountTyping(value);
}

export function InvestmentsReportClient({
  initialRows,
  initialPeriods,
}: {
  initialRows: InvestmentReportRow[];
  initialPeriods: InvestmentPeriodColumn[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [periods, setPeriods] = useState(initialPeriods);
  const [prevRows, setPrevRows] = useState(initialRows);
  const [prevPeriods, setPrevPeriods] = useState(initialPeriods);
  const [periodForm, setPeriodForm] = useState<PeriodForm>(() => emptyPeriodForm());
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [addCompanyId, setAddCompanyId] = useState("");
  const [addPeriodId, setAddPeriodId] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editAmounts, setEditAmounts] = useState<AmountMap>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (initialRows !== prevRows) {
    setPrevRows(initialRows);
    setRows(initialRows);
  }
  if (initialPeriods !== prevPeriods) {
    setPrevPeriods(initialPeriods);
    setPeriods(initialPeriods);
  }

  const companyOptions = useMemo(
    () =>
      rows.map((row) => ({
        id: row.id,
        name: capitalizeName(row.name) ?? row.name,
      })),
    [rows],
  );

  const blankPeriodsForCompany = useMemo(() => {
    if (!addCompanyId) return [];
    const row = rows.find((r) => r.id === addCompanyId);
    if (!row) return periods;
    return periods.filter((period) => row.amounts[period.id] == null);
  }, [addCompanyId, rows, periods]);

  const addAmountDisplay = useMemo(
    () => amountDisplay(addAmount),
    [addAmount],
  );

  const downloadColumns = useMemo(
    () => [
      { key: "company", header: "Investment company" },
      {
        key: "currentDue",
        header: "Current investment",
        align: "right" as const,
      },
      ...periods.flatMap((period) => [
        {
          key: `${period.id}_amount`,
          header: `${period.name} Profit / Loss`,
          align: "right" as const,
        },
        {
          key: `${period.id}_pct`,
          header: `${period.name} %`,
          align: "right" as const,
        },
      ]),
    ],
    [periods],
  );

  const downloadRows = useMemo(
    () =>
      rows.map((row) => {
        const out: Record<string, string> = {
          company: capitalizeName(row.name) ?? row.name,
          currentDue: formatRs(row.currentDue),
        };
        for (const period of periods) {
          const amount = row.amounts[period.id];
          out[`${period.id}_amount`] =
            amount != null ? formatRs(amount) : "—";
          out[`${period.id}_pct`] = investmentPeriodPercent(
            amount,
            row.investedByPeriod[period.id],
          );
        }
        return out;
      }),
    [rows, periods],
  );

  function onCreatePeriod(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (editingPeriodId) {
          await updateInvestmentPeriod(editingPeriodId, periodForm);
          setEditingPeriodId(null);
        } else {
          await createInvestmentPeriod(periodForm);
        }
        setPeriodForm(emptyPeriodForm());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function startEditPeriod(period: InvestmentPeriodColumn) {
    setEditingPeriodId(period.id);
    setPeriodForm({
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
    });
    setError(null);
    window.setTimeout(() => {
      document
        .getElementById("investment-period-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function cancelEditPeriod() {
    setEditingPeriodId(null);
    setPeriodForm(emptyPeriodForm());
  }

  function onDeletePeriod() {
    if (!editingPeriodId) return;
    const period = periods.find((p) => p.id === editingPeriodId);
    const label = period?.name ?? "this period";
    if (
      !confirm(
        `Delete period ${label}? This also clears its profit / loss amounts.`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await deleteInvestmentPeriod(editingPeriodId);
        cancelEditPeriod();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  function onMovePeriod(periodId: string, direction: "left" | "right") {
    setError(null);
    startTransition(async () => {
      try {
        await moveInvestmentPeriod(periodId, direction);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Move failed");
      }
    });
  }

  function onAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (!addPeriodId) throw new Error("Period is required");
        await saveInvestmentPeriodValues({
          companyId: addCompanyId,
          amounts: { [addPeriodId]: addAmount },
        });
        setAddCompanyId("");
        setAddPeriodId("");
        setAddAmount("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function startEdit(row: InvestmentReportRow) {
    window.setTimeout(() => {
      setEditingCompanyId(row.id);
      const map = emptyAmounts(periods);
      for (const period of periods) {
        map[period.id] = row.amounts[period.id] ?? "";
      }
      setEditAmounts(map);
      setError(null);
    }, 0);
  }

  function cancelEdit() {
    setEditingCompanyId(null);
    setEditAmounts({});
  }

  function saveEdit() {
    if (!editingCompanyId) return;
    setError(null);
    const companyId = editingCompanyId;
    startTransition(async () => {
      try {
        await saveInvestmentPeriodValues({
          companyId,
          amounts: editAmounts,
        });
        cancelEdit();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onClearCompany(companyId: string, name: string) {
    if (!confirm(`Clear all period amounts for ${name}?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteInvestmentPeriodValuesForCompany(companyId);
        if (editingCompanyId === companyId) cancelEdit();
        setRows((prev) =>
          prev.map((row) =>
            row.id === companyId ? { ...row, amounts: {} } : row,
          ),
        );
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  function patchAddAmount(value: string) {
    const next = changeAmountValue(value);
    if (next == null) return;
    setAddAmount(next);
  }

  function patchEditAmount(periodId: string, value: string) {
    const next = changeAmountValue(value);
    if (next == null) return;
    setEditAmounts((prev) => ({ ...prev, [periodId]: next }));
  }

  function onCompanyChange(companyId: string) {
    setAddCompanyId(companyId);
    setAddPeriodId("");
  }

  return (
    <div className="investment-report">
      {error && <div className="error-box">{error}</div>}

      <section className="investment-panel">
        <div className="investment-panel-head">
          <div>
            <h2 className="investment-panel-title">Period</h2>
          </div>
        </div>

        <form
          id="investment-period-form"
          onSubmit={onCreatePeriod}
          className="investment-inline-form"
        >
          <label className="investment-field">
            <span>Duration</span>
            <input
              required
              className="field-input"
              value={periodForm.name}
              onChange={(e) =>
                setPeriodForm({ ...periodForm, name: e.target.value })
              }
              placeholder="2025-2026"
            />
          </label>
          <label className="investment-field">
            <span>Start date</span>
            <input
              type="date"
              required
              className="field-input"
              value={periodForm.startDate}
              onChange={(e) =>
                setPeriodForm({ ...periodForm, startDate: e.target.value })
              }
            />
          </label>
          <label className="investment-field">
            <span>End date</span>
            <input
              type="date"
              required
              className="field-input"
              value={periodForm.endDate}
              onChange={(e) =>
                setPeriodForm({ ...periodForm, endDate: e.target.value })
              }
            />
          </label>
          <div className="investment-inline-actions">
            <button type="submit" className="btn" disabled={pending}>
              {editingPeriodId ? "Update" : "Add period"}
            </button>
            {editingPeriodId && (
              <>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={onDeletePeriod}
                  disabled={pending}
                >
                  Delete
                </button>
                {(() => {
                  const index = periods.findIndex(
                    (period) => period.id === editingPeriodId,
                  );
                  return (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          onMovePeriod(editingPeriodId, "left")
                        }
                        disabled={pending || index <= 0}
                      >
                        Move left
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          onMovePeriod(editingPeriodId, "right")
                        }
                        disabled={
                          pending ||
                          index < 0 ||
                          index >= periods.length - 1
                        }
                      >
                        Move right
                      </button>
                    </>
                  );
                })()}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelEditPeriod}
                  disabled={pending}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>

        {periods.length > 0 && (
          <ul className="investment-period-list">
            {periods.map((period) => (
              <li key={period.id} className="investment-period-chip">
                <div className="investment-period-chip-main">
                  <strong>{period.name}</strong>
                  <span>
                    {formatDateDdMmYyyy(period.startDate)} –{" "}
                    {formatDateDdMmYyyy(period.endDate)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="investment-panel">
        <div className="investment-panel-head">
          <div>
            <h2 className="investment-panel-title">Add entry</h2>
            <p className="investment-panel-desc">
              Choose a company and period, then enter the profit / loss amount.
            </p>
          </div>
        </div>

        {periods.length === 0 ? (
          <p className="investment-empty-hint">
            Add a period above before entering amounts.
          </p>
        ) : (
          <form onSubmit={onAdd} className="investment-inline-form">
            <label className="investment-field investment-field-company">
              <span>Investment company</span>
              <select
                required
                className="field-input"
                value={addCompanyId}
                onChange={(e) => onCompanyChange(e.target.value)}
              >
                <option value="">Select company</option>
                {companyOptions.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="investment-field investment-field-company">
              <span>Duration</span>
              <select
                required
                className="field-input"
                value={addPeriodId}
                onChange={(e) => setAddPeriodId(e.target.value)}
                disabled={!addCompanyId || blankPeriodsForCompany.length === 0}
              >
                <option value="">
                  {!addCompanyId
                    ? "Select company first"
                    : blankPeriodsForCompany.length === 0
                      ? "No blank periods left"
                      : "Select period"}
                </option>
                {blankPeriodsForCompany.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="investment-field investment-field-amount">
              <span>Profit / Loss amount</span>
              <div className="field-with-unit">
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  className="field-input"
                  placeholder="0.00"
                  value={addAmountDisplay}
                  onChange={(e) => patchAddAmount(e.target.value)}
                  disabled={!addCompanyId || !addPeriodId}
                />
                <span className="field-unit">Rs</span>
              </div>
            </label>
            <div className="investment-inline-actions">
              <button
                type="submit"
                className="btn"
                disabled={
                  pending ||
                  editingCompanyId != null ||
                  !addCompanyId ||
                  !addPeriodId ||
                  blankPeriodsForCompany.length === 0
                }
              >
                Add
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="investment-panel investment-panel-table">
        <div className="investment-panel-head">
          <div>
            <h2 className="investment-panel-title">Summary</h2>
            <p className="investment-panel-desc">
              Current investment and period-wise amounts. % uses fund invested
              for days within the period only.
            </p>
          </div>
          <TableDownloadButtons
            title="Investments report"
            filenameBase="investments-report"
            columns={downloadColumns}
            rows={downloadRows}
          />
        </div>

        <form
          id="investment-edit-form"
          onSubmit={(e) => {
            e.preventDefault();
            saveEdit();
          }}
          hidden
        />

        <div className="table-wrap">
          <div className="table-h-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th rowSpan={2}>Investment company</th>
                  <th rowSpan={2} className="num">
                    Current investment
                  </th>
                  {periods.map((period, index) => (
                    <th
                      key={period.id}
                      colSpan={2}
                      className="num investment-period-group"
                    >
                      <div className="investment-period-header">
                        <span>{period.name}</span>
                        <div className="investment-period-header-actions">
                          <button
                            type="button"
                            className="btn-link"
                            onClick={() => onMovePeriod(period.id, "left")}
                            disabled={pending || index === 0}
                            aria-label={`Move ${period.name} left`}
                            title="Move left"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            className="btn-link"
                            onClick={() => onMovePeriod(period.id, "right")}
                            disabled={pending || index === periods.length - 1}
                            aria-label={`Move ${period.name} right`}
                            title="Move right"
                          >
                            →
                          </button>
                          <button
                            type="button"
                            className="btn-link"
                            onClick={() => startEditPeriod(period)}
                            disabled={pending}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                  <th rowSpan={2} />
                </tr>
                <tr>
                  {periods.map((period) => (
                    <Fragment key={period.id}>
                      <th className="num investment-period-sub">
                        Profit / Loss
                      </th>
                      <th className="num investment-period-sub">%</th>
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isEditing = editingCompanyId === row.id;
                  const hasAnyAmount = periods.some(
                    (period) => row.amounts[period.id] != null,
                  );
                  return (
                    <tr
                      key={row.id}
                      className={isEditing ? "payment-editing-row" : undefined}
                    >
                      {isEditing ? (
                        <>
                          <td>{capitalizeName(row.name) ?? row.name}</td>
                          <td className="num">{formatRs(row.currentDue)}</td>
                          {periods.map((period) => {
                            const editValue = editAmounts[period.id] ?? "";
                            return (
                              <Fragment key={period.id}>
                                <td className="num">
                                  <div className="field-with-unit">
                                    <input
                                      form="investment-edit-form"
                                      type="text"
                                      inputMode="decimal"
                                      className="field-input"
                                      placeholder="0.00"
                                      aria-label={`${period.name} profit / loss`}
                                      value={amountDisplay(editValue)}
                                      onChange={(e) =>
                                        patchEditAmount(
                                          period.id,
                                          e.target.value,
                                        )
                                      }
                                    />
                                    <span className="field-unit">Rs</span>
                                  </div>
                                </td>
                                <td className="num">
                                  {investmentPeriodPercent(
                                    editValue === "" ? null : editValue,
                                    row.investedByPeriod[period.id],
                                  )}
                                </td>
                              </Fragment>
                            );
                          })}
                          <td className="space-x-2 whitespace-nowrap">
                            <button
                              form="investment-edit-form"
                              type="submit"
                              className="btn btn-sm"
                              disabled={pending}
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={cancelEdit}
                              disabled={pending}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{capitalizeName(row.name) ?? row.name}</td>
                          <td className="num">{formatRs(row.currentDue)}</td>
                          {periods.map((period) => {
                            const amount = row.amounts[period.id];
                            return (
                              <Fragment key={period.id}>
                                <td className="num">
                                  {amount != null ? formatRs(amount) : "—"}
                                </td>
                                <td className="num">
                                  {investmentPeriodPercent(
                                    amount,
                                    row.investedByPeriod[period.id],
                                  )}
                                </td>
                              </Fragment>
                            );
                          })}
                          <td className="space-x-2 whitespace-nowrap">
                            {periods.length > 0 && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => startEdit(row)}
                                disabled={pending}
                              >
                                Edit
                              </button>
                            )}
                            {hasAnyAmount && (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  onClearCompany(
                                    row.id,
                                    capitalizeName(row.name) ?? row.name,
                                  )
                                }
                                disabled={pending}
                              >
                                Clear
                              </button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3 + periods.length * 2}>
                      No investment companies yet. Add them under Masters →
                      Investment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
