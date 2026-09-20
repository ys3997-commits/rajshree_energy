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
  formatDateDdMmYyyy,
  formatIndianNumber,
  toSentenceCase,
} from "@/lib/domain/format";

type PaymentBasis = VegListRow["paymentBasis"];
type SortKey =
  | "name"
  | "mobile"
  | "role"
  | "customer"
  | "amount"
  | "beginDate"
  | "stopDate"
  | "status";
type SortDir = "asc" | "desc";

const PER_MT: PaymentBasis = "PER_MT";
const PER_LORRY: PaymentBasis = "PER_LORRY";

type PersonForm = {
  name: string;
  mobile: string;
  role: string;
};

type FactoryForm = {
  key: string;
  id?: string;
  customerId: string;
  paymentBasis: PaymentBasis;
  amount: string;
  beginDate: string;
  stopDate: string;
};

function factoryFromRow(row: VegListRow): FactoryForm {
  return {
    key: `edit-${row.id}`,
    id: row.id,
    customerId: row.customerId,
    paymentBasis: row.paymentBasis,
    amount: String(Math.round(Number(row.amount)) || 0),
    beginDate: row.beginDate,
    stopDate: row.stopDate ?? "",
  };
}

let factorySeq = 1;

function emptyFactory(): FactoryForm {
  factorySeq += 1;
  return {
    key: `factory-${factorySeq}`,
    customerId: "",
    paymentBasis: PER_MT,
    amount: "",
    beginDate: "",
    stopDate: "",
  };
}

function emptyPerson(): PersonForm {
  return { name: "", mobile: "", role: "" };
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

function personKey(name: string): string {
  return (capitalizeName(name) ?? name.trim()).toLowerCase();
}

function sortIndicator(active: boolean, dir: SortDir): string {
  if (!active) return "";
  return dir === "asc" ? " ↑" : " ↓";
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function compareSortValue(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  const as = String(a);
  const bs = String(b);
  if (!as && !bs) return 0;
  if (!as) return 1;
  if (!bs) return -1;
  return compareText(as, bs);
}

function rowSortValue(row: VegListRow, key: SortKey): string | number {
  switch (key) {
    case "customer":
      return row.customerName;
    case "name":
      return row.name;
    case "mobile":
      return row.mobile ?? "";
    case "role":
      return row.role ?? "";
    case "amount":
      return Number(row.amount);
    case "beginDate":
      return row.beginDate;
    case "stopDate":
      return row.stopDate ?? "";
    case "status":
      return row.active ? "Active" : "Inactive";
  }
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
    <div className="segment-control" role="radiogroup" aria-label="Payment Basis">
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
  lockedInactive,
  onChange,
  onError,
}: {
  vegId: string;
  active: boolean;
  lockedInactive?: boolean;
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
    if (next && lockedInactive) return;
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
        disabled={pending || lockedInactive}
        title={lockedInactive ? "Clear stop date before setting Active" : undefined}
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

function SortHeader({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
  className,
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  return (
    <th className={className}>
      <button type="button" className="th-sort" onClick={() => onSort(column)}>
        {label}
        {sortIndicator(sortKey === column, sortDir)}
      </button>
    </th>
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

  const [personForm, setPersonForm] = useState<PersonForm>(() => emptyPerson());
  const [factories, setFactories] = useState<FactoryForm[]>(() => [
    emptyFactory(),
  ]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [customerFilter, setCustomerFilter] = useState("");
  const [vegNameFilter, setVegNameFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
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

  const visibleGroups = useMemo(() => {
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

    const groups = new Map<
      string,
      { key: string; name: string; mobile: string | null; role: string | null; factories: VegListRow[] }
    >();
    const order: string[] = [];
    for (const row of filtered) {
      const key = personKey(row.name);
      let group = groups.get(key);
      if (!group) {
        group = {
          key,
          name: row.name,
          mobile: row.mobile,
          role: row.role,
          factories: [],
        };
        groups.set(key, group);
        order.push(key);
      }
      group.factories.push(row);
    }

    const dir = sortDir === "asc" ? 1 : -1;
    const factorySortKey: SortKey =
      sortKey === "name" || sortKey === "mobile" || sortKey === "role"
        ? "customer"
        : sortKey;

    const grouped = order.map((key) => {
      const group = groups.get(key)!;
      group.factories = [...group.factories].sort((a, b) => {
        const primary = compareSortValue(
          rowSortValue(a, factorySortKey),
          rowSortValue(b, factorySortKey),
        );
        if (primary) return primary * dir;
        return compareText(a.customerName, b.customerName);
      });
      return group;
    });

    return grouped.sort((a, b) => {
      const aRow = a.factories[0];
      const bRow = b.factories[0];
      const primary = compareSortValue(
        sortKey === "name"
          ? a.name
          : sortKey === "mobile"
            ? (a.mobile ?? "")
            : sortKey === "role"
              ? (a.role ?? "")
              : rowSortValue(aRow, sortKey),
        sortKey === "name"
          ? b.name
          : sortKey === "mobile"
            ? (b.mobile ?? "")
            : sortKey === "role"
              ? (b.role ?? "")
              : rowSortValue(bRow, sortKey),
      );
      if (primary) return primary * dir;
      return compareText(a.name, b.name);
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

  function resetForm() {
    setEditingKey(null);
    setPersonForm(emptyPerson());
    setFactories([emptyFactory()]);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!personForm.name.trim()) {
      setError("Veg name is required");
      return;
    }
    const missingBegin = factories.findIndex((factory) => !factory.beginDate.trim());
    if (missingBegin >= 0) {
      setError(
        factories.length > 1
          ? `Begin date is required for Factory ${missingBegin + 1}`
          : "Begin date is required",
      );
      return;
    }
    const customerIds = factories.map((factory) => factory.customerId);
    if (customerIds.some((id) => !id)) {
      setError("Customer is required for every factory");
      return;
    }
    if (new Set(customerIds).size !== customerIds.length) {
      setError("Each factory can be added only once");
      return;
    }
    const formIds = new Set(
      factories.map((factory) => factory.id).filter((id): id is string => Boolean(id)),
    );
    const nameKey = personKey(personForm.name);
    const clash = factories.find((factory) =>
      rows.some(
        (row) =>
          !formIds.has(row.id) &&
          row.customerId === factory.customerId &&
          personKey(row.name) === nameKey,
      ),
    );
    if (clash) {
      setError(
        `${formatNameField(personForm.name)} is already assigned to this factory. Pick another factory, or edit that row.`,
      );
      return;
    }
    if (editingKey) {
      startTransition(async () => {
        try {
          await updateVeg({
            name: personForm.name,
            mobile: personForm.mobile,
            role: personForm.role,
            factories: factories.map((factory) => ({
              id: factory.id,
              customerId: factory.customerId,
              paymentBasis: factory.paymentBasis,
              amount: factory.amount,
              beginDate: factory.beginDate,
              stopDate: factory.stopDate,
            })),
          });
          resetForm();
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Save failed");
        }
      });
      return;
    }
    startTransition(async () => {
      try {
        await createVeg({
          name: personForm.name,
          mobile: personForm.mobile,
          role: personForm.role,
          factories: factories.map((factory) => ({
            customerId: factory.customerId,
            paymentBasis: factory.paymentBasis,
            amount: factory.amount,
            beginDate: factory.beginDate,
            stopDate: factory.stopDate,
          })),
        });
        resetForm();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function startEdit(row: VegListRow) {
    const key = personKey(row.name);
    const personRows = rows
      .filter((item) => personKey(item.name) === key)
      .sort((a, b) => compareText(a.customerName, b.customerName));
    const first = personRows[0] ?? row;
    setEditingKey(key);
    setPersonForm({
      name: first.name,
      mobile: first.mobile ?? "",
      role: first.role ?? "",
    });
    setFactories(personRows.map(factoryFromRow));
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    resetForm();
    setError(null);
  }

  function onDelete(id: string) {
    if (!confirm("Delete this veg from this factory?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteVeg(id);
        const deleted = rows.find((row) => row.id === id);
        setRows((prev) => prev.filter((r) => r.id !== id));
        if (deleted && editingKey && personKey(deleted.name) === editingKey) {
          const remaining = factories.filter((factory) => factory.id !== id);
          if (remaining.length === 0) {
            cancelEdit();
          } else {
            setFactories(remaining);
          }
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  function patchPerson(patch: Partial<PersonForm>) {
    setPersonForm((prev) => ({ ...prev, ...patch }));
  }

  function patchFactory(key: string, patch: Partial<FactoryForm>) {
    setFactories((prev) =>
      prev.map((factory) =>
        factory.key === key ? { ...factory, ...patch } : factory,
      ),
    );
  }

  function addFactory() {
    setFactories((prev) => [...prev, emptyFactory()]);
  }

  function removeFactory(key: string) {
    const target = factories.find((factory) => factory.key === key);
    if (target?.id) return;
    setFactories((prev) =>
      prev.length <= 1 ? prev : prev.filter((factory) => factory.key !== key),
    );
  }

  const assignedFactoryIds = useMemo(() => {
    if (!personForm.name.trim()) return new Set<string>();
    const key = personKey(personForm.name);
    const formIds = new Set(
      factories.map((factory) => factory.id).filter((id): id is string => Boolean(id)),
    );
    return new Set(
      rows
        .filter(
          (row) => personKey(row.name) === key && !formIds.has(row.id),
        )
        .map((row) => row.customerId),
    );
  }, [rows, personForm.name, factories]);

  const canAddMoreFactories = customerOptions.some(
    (option) =>
      !assignedFactoryIds.has(option.value) &&
      !factories.some((factory) => factory.customerId === option.value),
  );

  const canAdd =
    Boolean(personForm.name.trim()) &&
    factories.every(
      (factory) =>
        factory.customerId &&
        factory.amount.trim() &&
        factory.beginDate.trim(),
    ) &&
    new Set(factories.map((factory) => factory.customerId)).size ===
      factories.length &&
    !pending;

  const savedFactoryCount = factories.filter((factory) => factory.id).length;
  const tableSummary = (() => {
    const people = visibleGroups.length;
    const factoryCount = visibleGroups.reduce(
      (count, group) => count + group.factories.length,
      0,
    );
    if (!people) return "";
    const factoryLabel = factoryCount === 1 ? "factory" : "factories";
    return `${people} veg · ${factoryCount} ${factoryLabel}`;
  })();

  return (
    <div>
      <h1 className="page-title">Veg</h1>
      {error && <div className="error-box">{error}</div>}

      <form
        onSubmit={onSubmit}
        className={`veg-add-form${editingKey ? " veg-add-form-editing" : ""}`}
      >
        <div className="veg-form-head">
          <h2 className="veg-form-title">
            {editingKey ? "Edit veg" : "Add veg"}
          </h2>
          {editingKey ? (
            <p className="veg-form-note">
              {savedFactoryCount > 1
                ? `All ${savedFactoryCount} factories for this veg are shown below. You can add more.`
                : "You can add more factories for this veg."}
            </p>
          ) : null}
        </div>
        <div className="veg-person-row">
          <label>
            Veg name
            <input
              required
              className="field-input"
              placeholder="Veg name"
              value={personForm.name}
              onChange={(e) => patchPerson({ name: e.target.value })}
              onBlur={() => {
                if (personForm.name.trim()) {
                  patchPerson({ name: formatNameField(personForm.name) });
                }
              }}
            />
          </label>
          <label>
            Mobile no
            <input
              className="field-input"
              placeholder="Mobile no"
              inputMode="numeric"
              value={personForm.mobile}
              onChange={(e) =>
                patchPerson({ mobile: digitsOnly(e.target.value) })
              }
            />
          </label>
          <label>
            Role
            <input
              className="field-input"
              placeholder="Role"
              value={personForm.role}
              onChange={(e) => patchPerson({ role: e.target.value })}
              onBlur={() => {
                if (personForm.role.trim()) {
                  patchPerson({ role: formatRoleField(personForm.role) });
                }
              }}
            />
          </label>
        </div>

        {factories.map((factory, index) => {
          const taken = new Set(
            factories
              .filter((item) => item.key !== factory.key)
              .map((item) => item.customerId)
              .filter(Boolean),
          );
          const alreadyAssigned = assignedFactoryIds;
          const factoryCustomerOptions = customerOptions.filter(
            (option) =>
              option.value === factory.customerId ||
              (!taken.has(option.value) && !alreadyAssigned.has(option.value)),
          );
          const selectedCustomer = customerOptions.find(
            (option) => option.value === factory.customerId,
          )?.label;
          const factoryLabel =
            factories.length > 1
              ? selectedCustomer
                ? `Factory ${index + 1} · ${selectedCustomer}`
                : `Factory ${index + 1}`
              : "Factory";
          return (
            <section key={factory.key} className="veg-factory-block">
              <div className="veg-factory-head">
                <span className="veg-factory-title">{factoryLabel}</span>
                {!factory.id && factories.length > 1 ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => removeFactory(factory.key)}
                    disabled={pending}
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="veg-factory-fields">
                <label className="veg-factory-customer">
                  Customer
                  <SearchableSelect
                    required
                    ariaLabel={`${factoryLabel} customer`}
                    placeholder="Select industry customer"
                    value={factory.customerId}
                    onChange={(customerId) =>
                      patchFactory(factory.key, { customerId })
                    }
                    options={factoryCustomerOptions}
                  />
                </label>

                <label>
                  Rate
                  <input
                    required
                    className="field-input"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="0"
                    aria-label={`${factoryLabel} rate`}
                    value={factory.amount}
                    onChange={(e) =>
                      patchFactory(factory.key, { amount: e.target.value })
                    }
                  />
                </label>

                <div className="veg-factory-field">
                  <span>Payment Basis</span>
                  <PaymentBasisSwitch
                    value={factory.paymentBasis}
                    onChange={(paymentBasis) =>
                      patchFactory(factory.key, { paymentBasis })
                    }
                    disabled={pending}
                  />
                </div>

                <label>
                  Begin date
                  <input
                    required
                    className="field-input"
                    type="date"
                    aria-label={`${factoryLabel} begin date`}
                    value={factory.beginDate}
                    onChange={(e) =>
                      patchFactory(factory.key, { beginDate: e.target.value })
                    }
                  />
                </label>

                <label>
                  Stop date
                  <input
                    className="field-input"
                    type="date"
                    aria-label={`${factoryLabel} stop date`}
                    min={factory.beginDate || undefined}
                    value={factory.stopDate}
                    onChange={(e) =>
                      patchFactory(factory.key, { stopDate: e.target.value })
                    }
                  />
                </label>
              </div>
            </section>
          );
        })}

        <div className="veg-add-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addFactory}
            disabled={pending || !canAddMoreFactories}
          >
            Add more factories
          </button>
          <div className="flex gap-2">
            <button type="submit" className="btn" disabled={!canAdd}>
              {editingKey ? "Update" : "Add veg"}
            </button>
            {editingKey ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelEdit}
                disabled={pending}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </form>

      <div className="customers-table-toolbar">
        {tableSummary ? (
          <div className="veg-table-summary">{tableSummary}</div>
        ) : null}
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
          <table className="data veg-table">
            <thead>
              <tr>
                <SortHeader
                  label="Veg name"
                  column="name"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <SortHeader
                  label="Mobile no"
                  column="mobile"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <SortHeader
                  label="Role"
                  column="role"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <SortHeader
                  label="Customer"
                  column="customer"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <SortHeader
                  label="Rate"
                  column="amount"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <SortHeader
                  label="Begin date"
                  column="beginDate"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <SortHeader
                  label="Stop date"
                  column="stopDate"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <SortHeader
                  label="Status"
                  column="status"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleGroups.flatMap((group) => {
                const span = group.factories.length;
                const isEditingGroup = editingKey === group.key;
                return group.factories.map((row, index) => {
                  const isFirst = index === 0;
                  const statusActive = !row.stopDate && row.active;
                  return (
                    <tr
                      key={row.id}
                      className={
                        [
                          isFirst ? "veg-group-start" : "veg-group-cont",
                          isEditingGroup ? "payment-editing-row" : "",
                          !statusActive ? "veg-row-inactive" : "",
                        ]
                          .filter(Boolean)
                          .join(" ") || undefined
                      }
                    >
                      {isFirst ? (
                        <>
                          <td className="veg-person-cell" rowSpan={span}>
                            <div className="veg-person-name">
                              {capitalizeName(group.name) ?? group.name}
                            </div>
                            {span > 1 ? (
                              <div className="veg-factory-count">
                                {span} factories
                              </div>
                            ) : null}
                          </td>
                          <td className="veg-person-cell" rowSpan={span}>
                            {group.mobile ?? "—"}
                          </td>
                          <td className="veg-person-cell" rowSpan={span}>
                            {toSentenceCase(group.role) ?? "—"}
                          </td>
                        </>
                      ) : null}
                      <td>
                        {capitalizeName(row.customerName) ?? row.customerName}
                      </td>
                      <td>
                        {formatIndianNumber(row.amount)}{" "}
                        <span className="veg-rate-basis">
                          {paymentBasisLabel(row.paymentBasis)}
                        </span>
                      </td>
                      <td>{formatDateDdMmYyyy(row.beginDate)}</td>
                      <td>{formatDateDdMmYyyy(row.stopDate)}</td>
                      <td>
                        <VegStatusToggle
                          vegId={row.id}
                          active={statusActive}
                          lockedInactive={Boolean(row.stopDate)}
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
                          className="btn btn-secondary"
                          onClick={() => startEdit(row)}
                          disabled={pending}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => onDelete(row.id)}
                          disabled={pending}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                });
              })}
              {visibleGroups.length === 0 && (
                <tr>
                  <td colSpan={9}>
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
