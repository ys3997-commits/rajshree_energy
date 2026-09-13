"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createVeg,
  deleteVeg,
  updateVeg,
  updateVegActive,
  type VegIndustryCustomer,
  type VegListRow,
} from "@/lib/actions/veg";
import { SearchableSelect } from "@/components/SearchableSelect";
import {
  capitalizeName,
  formatIndianNumber,
  toSentenceCase,
} from "@/lib/domain/format";

type PaymentBasis = VegListRow["paymentBasis"];
type SortKey = "customer" | "name" | "role";
type SortDir = "asc" | "desc";

const PER_MT: PaymentBasis = "PER_MT";
const PER_LORRY: PaymentBasis = "PER_LORRY";

type FormState = {
  customerId: string;
  name: string;
  mobile: string;
  role: string;
  paymentBasis: PaymentBasis;
  amount: string;
};

function emptyForm(): FormState {
  return {
    customerId: "",
    name: "",
    mobile: "",
    role: "",
    paymentBasis: PER_MT,
    amount: "",
  };
}

function formFromRow(row: VegListRow): FormState {
  return {
    customerId: row.customerId,
    name: row.name,
    mobile: row.mobile ?? "",
    role: row.role ?? "",
    paymentBasis: row.paymentBasis,
    amount: String(Math.round(Number(row.amount)) || 0),
  };
}

function formatNameField(value: string): string {
  return capitalizeName(value) ?? value;
}

function formatRoleField(value: string): string {
  return toSentenceCase(value) ?? value;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function paymentBasisLabel(basis: PaymentBasis): string {
  return basis === PER_LORRY ? "Per Lorry" : "Per MT";
}

function sortIndicator(active: boolean, dir: SortDir): string {
  if (!active) return "";
  return dir === "asc" ? " ↑" : " ↓";
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function PaymentBasisSwitch({
  value,
  onChange,
  disabled,
}: {
  value: PaymentBasis;
  onChange: (value: PaymentBasis) => void;
  disabled?: boolean;
}) {
  return (
    <div className="segment-control" role="radiogroup" aria-label="Payment">
      <button
        type="button"
        role="radio"
        disabled={disabled}
        aria-checked={value === PER_MT}
        className={`segment-option${value === PER_MT ? " segment-option-selected" : ""}`}
        onClick={() => onChange(PER_MT)}
      >
        Per MT
      </button>
      <button
        type="button"
        role="radio"
        disabled={disabled}
        aria-checked={value === PER_LORRY}
        className={`segment-option${value === PER_LORRY ? " segment-option-selected" : ""}`}
        onClick={() => onChange(PER_LORRY)}
      >
        Per Lorry
      </button>
    </div>
  );
}

function VegStatusToggle({
  vegId,
  active: initialActive,
  onChange,
  onError,
}: {
  vegId: string;
  active: boolean;
  onChange?: (active: boolean) => void;
  onError?: (message: string) => void;
}) {
  const [active, setActive] = useState(initialActive);
  const [prevInitialActive, setPrevInitialActive] = useState(initialActive);
  const [pending, startTransition] = useTransition();

  if (initialActive !== prevInitialActive) {
    setPrevInitialActive(initialActive);
    setActive(initialActive);
  }

  function setStatus(next: boolean) {
    if (next === active || pending) return;
    const prev = active;
    setActive(next);
    startTransition(async () => {
      try {
        await updateVegActive(vegId, next);
        onChange?.(next);
      } catch (err) {
        setActive(prev);
        onError?.(
          err instanceof Error ? err.message : "Could not update status",
        );
      }
    });
  }

  return (
    <div
      className={`status-toggle${pending ? " status-toggle-pending" : ""}`}
      role="radiogroup"
      aria-label="Status"
    >
      <button
        type="button"
        role="radio"
        aria-checked={active}
        disabled={pending}
        className={`status-toggle-option status-toggle-option-active${active ? " status-toggle-option-selected" : ""}`}
        onClick={() => setStatus(true)}
      >
        Active
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={!active}
        disabled={pending}
        className={`status-toggle-option status-toggle-option-inactive${!active ? " status-toggle-option-selected" : ""}`}
        onClick={() => setStatus(false)}
      >
        Inactive
      </button>
    </div>
  );
}

export function VegClient({
  initial,
  customers,
}: {
  initial: VegListRow[];
  customers: VegIndustryCustomer[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setRows(initial);
  }

  const [addForm, setAddForm] = useState<FormState>(() => emptyForm());
  const [editForm, setEditForm] = useState<FormState>(() => emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [customerFilter, setCustomerFilter] = useState("");
  const [vegNameFilter, setVegNameFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("customer");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        value: customer.id,
        label: capitalizeName(customer.name) ?? customer.name,
      })),
    [customers],
  );

  const vegNameOptions = useMemo(() => {
    const names = new Set<string>();
    for (const row of rows) {
      const name = capitalizeName(row.name) ?? row.name;
      if (name) names.add(name);
    }
    return [...names].sort((a, b) => compareText(a, b));
  }, [rows]);

  const visibleRows = useMemo(() => {
    const nameQuery = vegNameFilter.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (customerFilter && row.customerId !== customerFilter) return false;
      if (nameQuery) {
        const name = (capitalizeName(row.name) ?? row.name).toLowerCase();
        if (name !== nameQuery && row.name.toLowerCase() !== nameQuery) {
          return false;
        }
      }
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const customerCmp = compareText(a.customerName, b.customerName);
      const nameCmp = compareText(a.name, b.name);
      const roleCmp = compareText(a.role ?? "", b.role ?? "");
      if (sortKey === "customer") {
        return customerCmp * dir || nameCmp || roleCmp;
      }
      if (sortKey === "name") {
        return nameCmp * dir || customerCmp || roleCmp;
      }
      return roleCmp * dir || customerCmp || nameCmp;
    });
  }, [rows, customerFilter, vegNameFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  function payloadFrom(form: FormState) {
    return {
      customerId: form.customerId,
      name: form.name,
      mobile: form.mobile,
      role: form.role,
      paymentBasis: form.paymentBasis,
      amount: form.amount,
    };
  }

  function onAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createVeg(payloadFrom(addForm));
        setAddForm(emptyForm());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function startEdit(row: VegListRow) {
    window.setTimeout(() => {
      setEditingId(row.id);
      setEditForm(formFromRow(row));
      setError(null);
    }, 0);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm());
  }

  function saveEdit() {
    if (!editingId) return;
    setError(null);
    const id = editingId;
    startTransition(async () => {
      try {
        await updateVeg(id, payloadFrom(editForm));
        cancelEdit();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm("Delete this veg?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteVeg(id);
        if (editingId === id) cancelEdit();
        setRows((prev) => prev.filter((r) => r.id !== id));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  function patchAdd(patch: Partial<FormState>) {
    setAddForm((prev) => ({ ...prev, ...patch }));
  }

  function patchEdit(patch: Partial<FormState>) {
    setEditForm((prev) => ({ ...prev, ...patch }));
  }

  return (
    <div>
      <h1 className="page-title">Veg</h1>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onAdd} className="mb-6 form-grid form-grid-wide">
        <label>Customer</label>
        <SearchableSelect
          required
          ariaLabel="Customer"
          placeholder="Select industry customer"
          value={addForm.customerId}
          onChange={(customerId) => patchAdd({ customerId })}
          options={customerOptions}
        />

        <label>Veg</label>
        <div className="role-fields role-fields-3">
          <input
            required
            placeholder="Veg name"
            value={addForm.name}
            onChange={(e) => patchAdd({ name: e.target.value })}
            onBlur={() => {
              if (addForm.name.trim()) {
                patchAdd({ name: formatNameField(addForm.name) });
              }
            }}
          />
          <input
            placeholder="Mobile no"
            inputMode="numeric"
            value={addForm.mobile}
            onChange={(e) => patchAdd({ mobile: digitsOnly(e.target.value) })}
          />
          <input
            placeholder="Role"
            value={addForm.role}
            onChange={(e) => patchAdd({ role: e.target.value })}
            onBlur={() => {
              if (addForm.role.trim()) {
                patchAdd({ role: formatRoleField(addForm.role) });
              }
            }}
          />
        </div>

        <label>Rate</label>
        <input
          required
          type="number"
          step="1"
          min="0"
          placeholder="0"
          aria-label="Rate"
          value={addForm.amount}
          onChange={(e) => patchAdd({ amount: e.target.value })}
        />

        <label>Payment</label>
        <PaymentBasisSwitch
          value={addForm.paymentBasis}
          onChange={(paymentBasis) => patchAdd({ paymentBasis })}
          disabled={pending || editingId != null}
        />

        <div />
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn"
            disabled={pending || editingId != null}
          >
            Add veg
          </button>
        </div>
      </form>

      <div className="customers-table-toolbar">
        <label className="customers-filter-field">
          Customer
          <select
            className="field-input"
            aria-label="Filter customer"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          >
            <option value="">All</option>
            {customerOptions.map((customer) => (
              <option key={customer.value} value={customer.value}>
                {customer.label}
              </option>
            ))}
          </select>
        </label>
        <label className="customers-filter-field">
          Veg name
          <select
            className="field-input"
            aria-label="Filter veg name"
            value={vegNameFilter}
            onChange={(e) => setVegNameFilter(e.target.value)}
          >
            <option value="">All</option>
            {vegNameOptions.map((name) => (
              <option key={name} value={name.toLowerCase()}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <div className="table-h-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("customer")}
                  >
                    Customer
                    {sortIndicator(sortKey === "customer", sortDir)}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("name")}
                  >
                    Veg name
                    {sortIndicator(sortKey === "name", sortDir)}
                  </button>
                </th>
                <th>Mobile no</th>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("role")}
                  >
                    Role
                    {sortIndicator(sortKey === "role", sortDir)}
                  </button>
                </th>
                <th className="num">Rate</th>
                <th>Payment</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const isEditing = editingId === row.id;
                return (
                  <tr
                    key={row.id}
                    className={
                      [
                        isEditing ? "payment-editing-row" : "",
                        !row.active && !isEditing ? "veg-row-inactive" : "",
                      ]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                  >
                    {isEditing ? (
                      <>
                        <td>
                          <SearchableSelect
                            required
                            ariaLabel="Customer"
                            placeholder="Select industry customer"
                            value={editForm.customerId}
                            onChange={(customerId) =>
                              patchEdit({ customerId })
                            }
                            options={customerOptions}
                          />
                        </td>
                        <td>
                          <input
                            required
                            className="field-input"
                            aria-label="Veg name"
                            value={editForm.name}
                            onChange={(e) =>
                              patchEdit({ name: e.target.value })
                            }
                            onBlur={() => {
                              if (editForm.name.trim()) {
                                patchEdit({
                                  name: formatNameField(editForm.name),
                                });
                              }
                            }}
                          />
                        </td>
                        <td>
                          <input
                            className="field-input"
                            inputMode="numeric"
                            aria-label="Mobile no"
                            value={editForm.mobile}
                            onChange={(e) =>
                              patchEdit({ mobile: digitsOnly(e.target.value) })
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="field-input"
                            aria-label="Role"
                            value={editForm.role}
                            onChange={(e) =>
                              patchEdit({ role: e.target.value })
                            }
                            onBlur={() => {
                              if (editForm.role.trim()) {
                                patchEdit({
                                  role: formatRoleField(editForm.role),
                                });
                              }
                            }}
                          />
                        </td>
                        <td className="num">
                          <input
                            required
                            className="field-input"
                            type="number"
                            step="1"
                            min="0"
                            aria-label="Rate"
                            value={editForm.amount}
                            onChange={(e) =>
                              patchEdit({ amount: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <PaymentBasisSwitch
                            value={editForm.paymentBasis}
                            onChange={(paymentBasis) =>
                              patchEdit({ paymentBasis })
                            }
                            disabled={pending}
                          />
                        </td>
                        <td>
                          <VegStatusToggle
                            vegId={row.id}
                            active={row.active}
                            onChange={(active) => {
                              setRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id ? { ...r, active } : r,
                                ),
                              );
                            }}
                            onError={setError}
                          />
                        </td>
                        <td className="space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={saveEdit}
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
                        <td>
                          {capitalizeName(row.customerName) ?? row.customerName}
                        </td>
                        <td>{capitalizeName(row.name) ?? row.name}</td>
                        <td>{row.mobile ?? "—"}</td>
                        <td>{toSentenceCase(row.role) ?? "—"}</td>
                        <td className="num">
                          {formatIndianNumber(row.amount)}
                        </td>
                        <td>{paymentBasisLabel(row.paymentBasis)}</td>
                        <td>
                          <VegStatusToggle
                            vegId={row.id}
                            active={row.active}
                            onChange={(active) => {
                              setRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id ? { ...r, active } : r,
                                ),
                              );
                            }}
                            onError={setError}
                          />
                        </td>
                        <td className="space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => startEdit(row)}
                            disabled={pending}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => onDelete(row.id)}
                            disabled={pending}
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    {rows.length === 0
                      ? "No veg records yet."
                      : "No matching veg records."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
