"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerCategory } from "@/generated/prisma";
import { FormEvent, Fragment, useEffect, useRef, useState, useTransition } from "react";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
  type CustomerListResult,
  type CustomerListRow,
} from "@/lib/actions/customers";
import {
  capitalizeName,
  formatCreditPeriod,
  formatCustomerCategory,
  formatRs,
} from "@/lib/domain/format";
import { FormStatusToggle } from "@/components/FormStatusToggle";
import { Modal } from "@/components/Modal";
import { OptionSelect } from "@/components/OptionSelect";

const COLLECTION_OFFICER = "Collection Officer";

const CATEGORY_FILTERS: CustomerCategory[] = [
  CustomerCategory.INDUSTRY,
  CustomerCategory.TRADER,
  CustomerCategory.SUPPLIER,
];

type Row = CustomerListRow;
type CustomerOpt = {
  id: string;
  name: string;
  category: CustomerCategory;
};

type CityOpt = {
  name: string;
  state: string;
};

function stateForCity(cityOptions: CityOpt[], city: string): string {
  if (!city) return "";
  return cityOptions.find((c) => c.name === city)?.state ?? "";
}

type FormState = {
  name: string;
  category: CustomerCategory | "";
  active: boolean;
  ownerName: string;
  ownerContact: string;
  purchaserName: string;
  purchaserContact: string;
  purchaserRole: string;
  paymentInChargeName: string;
  paymentInChargeContact: string;
  paymentInChargeRole: string;
  accountantName: string;
  accountantContact: string;
  factoryContactName: string;
  factoryContactContact: string;
  factoryContactRole: string;
  email: string;
  city: string;
  state: string;
  creditDays: string;
  sector: string;
  saleExecutive: string;
  approachForFunds: string;
  openingDue: string;
  dealingCompany: string;
};

function customersHref(
  page: number,
  customerId: string,
  category: string,
): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (customerId) params.set("customerId", customerId);
  if (category) params.set("category", category);
  const qs = params.toString();
  return qs ? `/customers?${qs}` : "/customers";
}

function emptyForm(): FormState {
  return {
    name: "",
    category: "",
    active: true,
    ownerName: "",
    ownerContact: "",
    purchaserName: "",
    purchaserContact: "",
    purchaserRole: "",
    paymentInChargeName: "",
    paymentInChargeContact: "",
    paymentInChargeRole: "",
    accountantName: "",
    accountantContact: "",
    factoryContactName: "",
    factoryContactContact: "",
    factoryContactRole: "",
    email: "",
    city: "",
    state: "",
    creditDays: "",
    sector: "",
    saleExecutive: "",
    approachForFunds: "",
    openingDue: "0",
    dealingCompany: "",
  };
}

function formFromRow(row: Row): FormState {
  return {
    name: row.name,
    category: row.category,
    active: row.active,
    ownerName: row.ownerName ?? "",
    ownerContact: row.ownerContact ?? "",
    purchaserName: row.purchaserName ?? "",
    purchaserContact: row.purchaserContact ?? "",
    purchaserRole: row.purchaserRole ?? "",
    paymentInChargeName: row.paymentInChargeName ?? "",
    paymentInChargeContact: row.paymentInChargeContact ?? "",
    paymentInChargeRole: row.paymentInChargeRole ?? "",
    accountantName: row.accountantName ?? "",
    accountantContact: row.accountantContact ?? "",
    factoryContactName: row.factoryContactName ?? "",
    factoryContactContact: row.factoryContactContact ?? "",
    factoryContactRole: row.factoryContactRole ?? "",
    email: row.email ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    creditDays: row.creditDays != null ? String(row.creditDays) : "",
    sector: row.sector ?? "",
    saleExecutive: row.saleExecutive ?? "",
    approachForFunds: row.approachForFunds ?? "",
    openingDue: row.openingDue,
    dealingCompany: row.dealingCompany ?? "",
  };
}

function parseCreditDays(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

function parseOpeningDueInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "0";
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    throw new Error("Opening due must be a valid amount");
  }
  return trimmed;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function formatNameField(value: string): string {
  return capitalizeName(value) ?? value;
}

function formatContact(name: string | null, contact: string | null): string {
  const formattedName = name ? (capitalizeName(name) ?? name) : null;
  if (!formattedName) return "—";
  return `${formattedName}${contact ? ` · ${contact}` : ""}`;
}

export function CustomersClient({
  initial,
  customerOptions,
  cityOptions,
  sectors,
  saleExecutives,
  dealingCompanies,
  owners,
}: {
  initial: CustomerListResult;
  customerOptions: CustomerOpt[];
  cityOptions: CityOpt[];
  sectors: string[];
  saleExecutives: string[];
  dealingCompanies: string[];
  owners: string[];
}) {
  const router = useRouter();
  const {
    rows,
    total,
    page,
    pageSize,
    totalPages,
    customerId,
    category,
  } = initial;
  const [addForm, setAddForm] = useState<FormState>(() => emptyForm());
  const [editForm, setEditForm] = useState<FormState>(() => emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const stayOnRowRef = useRef<{ id: string; scrollY: number } | null>(null);

  useEffect(() => {
    const stay = stayOnRowRef.current;
    if (!stay) return;

    let cancelled = false;
    const restore = () => {
      if (cancelled || !stayOnRowRef.current) return;
      window.scrollTo(0, stay.scrollY);
      document
        .querySelector<HTMLElement>(
          `[data-customer-id="${CSS.escape(stay.id)}"]`,
        )
        ?.scrollIntoView({ block: "nearest", inline: "nearest" });
    };

    restore();
    const frameId = window.requestAnimationFrame(restore);
    const t1 = window.setTimeout(restore, 50);
    const t2 = window.setTimeout(restore, 150);
    const t3 = window.setTimeout(() => {
      restore();
      stayOnRowRef.current = null;
    }, 300);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [editingId, pending, rows]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const approachOptions = [
    COLLECTION_OFFICER,
    ...saleExecutives.filter((name) => name !== COLLECTION_OFFICER),
  ];
  const cityNames = cityOptions.map((c) => c.name);

  function onCityChange(
    city: string,
    apply: (patch: Partial<FormState>) => void,
  ) {
    apply({ city, state: stateForCity(cityOptions, city) });
  }

  function applyFilters(nextCustomerId: string, nextCategory: string) {
    router.push(customersHref(1, nextCustomerId, nextCategory));
  }

  function payloadFrom(form: FormState, includeActive: boolean) {
    if (!form.category) {
      throw new Error("Category is required");
    }
    return {
      name: form.name,
      category: form.category,
      active: includeActive ? form.active : undefined,
      ownerName: form.ownerName || null,
      ownerContact: form.ownerContact || null,
      purchaserName: form.purchaserName || null,
      purchaserContact: form.purchaserContact || null,
      purchaserRole: form.purchaserRole || null,
      paymentInChargeName: form.paymentInChargeName || null,
      paymentInChargeContact: form.paymentInChargeContact || null,
      paymentInChargeRole: form.paymentInChargeRole || null,
      accountantName: form.accountantName || null,
      accountantContact: form.accountantContact || null,
      factoryContactName: form.factoryContactName || null,
      factoryContactContact: form.factoryContactContact || null,
      factoryContactRole: form.factoryContactRole || null,
      email: form.email || null,
      city: form.city || null,
      state: form.state || null,
      creditDays: parseCreditDays(form.creditDays),
      sector: form.sector || null,
      saleExecutive: form.saleExecutive || null,
      approachForFunds: form.approachForFunds || null,
      openingDue: parseOpeningDueInput(form.openingDue),
      dealingCompany: form.dealingCompany || null,
    };
  }

  function onAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!addForm.category) {
      setError("Category is required");
      return;
    }
    startTransition(async () => {
      try {
        await createCustomer(payloadFrom(addForm, false));
        setAddForm(emptyForm());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function startEdit(row: Row) {
    // Defer so the Edit click is not delivered to Update/Cancel, which
    // appear in the same place and would close edit mode immediately.
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
    if (!editForm.category) {
      setError("Category is required");
      return;
    }
    const id = editingId;
    const scrollY = window.scrollY;
    const payload = payloadFrom(editForm, true);
    startTransition(async () => {
      try {
        await updateCustomer(id, payload);
        stayOnRowRef.current = { id, scrollY };
        cancelEdit();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onUpdate(e: FormEvent) {
    e.preventDefault();
    saveEdit();
  }

  function onDelete(id: string) {
    if (!confirm("Delete this customer?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteCustomer(id);
        if (editingId === id) cancelEdit();
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

  function setAddNameField(key: keyof FormState, value: string) {
    patchAdd({ [key]: value });
  }

  function blurAddNameField(key: keyof FormState) {
    const value = addForm[key];
    if (typeof value === "string" && value.trim()) {
      patchAdd({ [key]: formatNameField(value) });
    }
  }

  function setAddPhoneField(key: keyof FormState, value: string) {
    patchAdd({ [key]: digitsOnly(value) });
  }

  function setEditNameField(key: keyof FormState, value: string) {
    patchEdit({ [key]: value });
  }

  function blurEditNameField(key: keyof FormState) {
    const value = editForm[key];
    if (typeof value === "string" && value.trim()) {
      patchEdit({ [key]: formatNameField(value) });
    }
  }

  function setEditPhoneField(key: keyof FormState, value: string) {
    patchEdit({ [key]: digitsOnly(value) });
  }

  function onCategoryChange(
    next: CustomerCategory | "",
    apply: (patch: Partial<FormState>) => void,
  ) {
    const clearFactory = next !== CustomerCategory.INDUSTRY;
    apply({
      category: next,
      ...(clearFactory
        ? {
            factoryContactName: "",
            factoryContactContact: "",
            factoryContactRole: "",
          }
        : {}),
    });
  }

  const addFactoryEditable = addForm.category === CustomerCategory.INDUSTRY;
  const editFactoryEditable =
    editForm.category === CustomerCategory.INDUSTRY;

  return (
    <div>
      <h1 className="page-title">Customers</h1>
      <Modal open={error !== null} title="Message" onClose={() => setError(null)}>
        <p className="mb-4">{error}</p>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={() => setError(null)}>
            OK
          </button>
        </div>
      </Modal>

      <form onSubmit={onAdd} className="mb-6 form-grid form-grid-wide">
        <label>Company name</label>
        <input
          required
          value={addForm.name}
          onChange={(e) => setAddNameField("name", e.target.value)}
          onBlur={() => blurAddNameField("name")}
        />

        <label>Category</label>
        <select
          required
          value={addForm.category}
          onChange={(e) =>
            onCategoryChange(
              e.target.value as CustomerCategory | "",
              patchAdd,
            )
          }
        >
          <option value="" disabled>
            Select
          </option>
          <option value={CustomerCategory.INDUSTRY}>Industry</option>
          <option value={CustomerCategory.TRADER}>Trader</option>
          <option value={CustomerCategory.SUPPLIER}>Vendor</option>
        </select>

        <label>Owner</label>
        <div className="role-fields">
          <OptionSelect
            emptyLabel="Name"
            value={addForm.ownerName}
            onChange={(ownerName) => patchAdd({ ownerName })}
            options={owners}
          />
          <input
            placeholder="Phone"
            inputMode="numeric"
            pattern="[0-9]*"
            value={addForm.ownerContact}
            onChange={(e) => setAddPhoneField("ownerContact", e.target.value)}
          />
        </div>

        <label>Purchaser</label>
        <div className="role-fields role-fields-3">
          <input
            placeholder="Name"
            value={addForm.purchaserName}
            onChange={(e) => setAddNameField("purchaserName", e.target.value)}
            onBlur={() => blurAddNameField("purchaserName")}
          />
          <input
            placeholder="Phone"
            inputMode="numeric"
            pattern="[0-9]*"
            value={addForm.purchaserContact}
            onChange={(e) =>
              setAddPhoneField("purchaserContact", e.target.value)
            }
          />
          <input
            placeholder="Role"
            value={addForm.purchaserRole}
            onChange={(e) => patchAdd({ purchaserRole: e.target.value })}
          />
        </div>

        <label>Payment in-charge</label>
        <div className="role-fields role-fields-3">
          <input
            placeholder="Name"
            value={addForm.paymentInChargeName}
            onChange={(e) =>
              setAddNameField("paymentInChargeName", e.target.value)
            }
            onBlur={() => blurAddNameField("paymentInChargeName")}
          />
          <input
            placeholder="Phone"
            inputMode="numeric"
            pattern="[0-9]*"
            value={addForm.paymentInChargeContact}
            onChange={(e) =>
              setAddPhoneField("paymentInChargeContact", e.target.value)
            }
          />
          <input
            placeholder="Role"
            value={addForm.paymentInChargeRole}
            onChange={(e) =>
              patchAdd({ paymentInChargeRole: e.target.value })
            }
          />
        </div>

        <label>Accountant</label>
        <div className="role-fields">
          <input
            placeholder="Name"
            value={addForm.accountantName}
            onChange={(e) => setAddNameField("accountantName", e.target.value)}
            onBlur={() => blurAddNameField("accountantName")}
          />
          <input
            placeholder="Phone"
            inputMode="numeric"
            pattern="[0-9]*"
            value={addForm.accountantContact}
            onChange={(e) =>
              setAddPhoneField("accountantContact", e.target.value)
            }
          />
        </div>

        <label
          className={addFactoryEditable ? undefined : "field-label-muted"}
        >
          Factory contact
        </label>
        <div
          className={`role-fields role-fields-3${
            addFactoryEditable ? "" : " role-fields-disabled"
          }`}
        >
          <input
            placeholder="Name"
            disabled={!addFactoryEditable}
            value={addForm.factoryContactName}
            onChange={(e) =>
              setAddNameField("factoryContactName", e.target.value)
            }
            onBlur={() => blurAddNameField("factoryContactName")}
          />
          <input
            placeholder="Phone"
            inputMode="numeric"
            pattern="[0-9]*"
            disabled={!addFactoryEditable}
            value={addForm.factoryContactContact}
            onChange={(e) =>
              setAddPhoneField("factoryContactContact", e.target.value)
            }
          />
          <input
            placeholder="Role"
            disabled={!addFactoryEditable}
            value={addForm.factoryContactRole}
            onChange={(e) =>
              patchAdd({ factoryContactRole: e.target.value })
            }
          />
        </div>

        <label>Email</label>
        <input
          type="email"
          value={addForm.email}
          onChange={(e) => patchAdd({ email: e.target.value })}
        />

        <label>City</label>
        <OptionSelect
          value={addForm.city}
          onChange={(city) => onCityChange(city, patchAdd)}
          options={cityNames}
        />

        <label>State</label>
        <input
          readOnly
          className="field-input"
          value={addForm.state}
          placeholder={addForm.city ? "—" : "Select city first"}
        />

        <label>Credit period</label>
        <div className="field-with-unit">
          <input
            type="number"
            min={0}
            step={1}
            placeholder="0"
            value={addForm.creditDays}
            onChange={(e) => patchAdd({ creditDays: e.target.value })}
          />
          <span className="field-unit">days</span>
        </div>

        <label>Sales executive</label>
        <OptionSelect
          value={addForm.saleExecutive}
          onChange={(saleExecutive) => patchAdd({ saleExecutive })}
          options={saleExecutives}
        />

        <label>Approach for funds</label>
        <OptionSelect
          value={addForm.approachForFunds}
          onChange={(approachForFunds) => patchAdd({ approachForFunds })}
          options={approachOptions}
        />

        <label>Sector</label>
        <OptionSelect
          value={addForm.sector}
          onChange={(sector) => patchAdd({ sector })}
          options={sectors}
        />

        <label>Opening due</label>
        <div className="field-with-unit">
          <input
            type="number"
            step="0.01"
            placeholder="0"
            value={addForm.openingDue}
            onChange={(e) => patchAdd({ openingDue: e.target.value })}
          />
          <span className="field-unit">Rs</span>
        </div>

        <label>Dealing company</label>
        <OptionSelect
          value={addForm.dealingCompany}
          onChange={(dealingCompany) => patchAdd({ dealingCompany })}
          options={dealingCompanies}
        />

        <div />
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn"
            disabled={pending || editingId != null}
          >
            Add customer
          </button>
        </div>
      </form>

      <div className="customers-table-toolbar">
        <label className="customers-filter-field">
          Customer
          <select
            className="field-input"
            aria-label="Customer"
            value={customerId}
            onChange={(e) => applyFilters(e.target.value, category)}
          >
            <option value="">All</option>
            {customerOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {capitalizeName(c.name) ?? c.name} —{" "}
                {formatCustomerCategory(c.category)}
              </option>
            ))}
          </select>
        </label>
        <label className="customers-filter-field">
          Category
          <select
            className="field-input"
            aria-label="Category"
            value={category}
            onChange={(e) => applyFilters(customerId, e.target.value)}
          >
            <option value="">All</option>
            {CATEGORY_FILTERS.map((value) => (
              <option key={value} value={value}>
                {formatCustomerCategory(value)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <div className="table-h-scroll"><table className="data customers-table">
          <thead>
            <tr>
              <th className="customer-col-company">Company</th>
              <th className="customer-col-category">Category</th>
              <th>City</th>
              <th>Owner</th>
              <th>Purchaser</th>
              <th>Payment</th>
              <th>Accountant</th>
              <th className="num customer-col-credit">Credit period</th>
              <th className="num customer-col-opening">Opening due</th>
              <th className="customer-col-sector">Sector</th>
              <th className="customer-col-sales-exec">Sales Executive</th>
              <th>Approach for funds</th>
              <th>Dealing company</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isEditing = editingId === row.id;
              return (
                <Fragment key={row.id}>
                  <tr
                    data-customer-id={row.id}
                    className={[
                      isEditing ? "payment-editing-row" : "",
                      !row.active && !isEditing ? "customer-row-inactive" : "",
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined}
                  >
                    {isEditing ? (
                      <>
                        <td className="customer-col-company">
                          <div className="customer-inline-stack">
                            <input
                              form="customer-edit-form"
                              required
                              className="field-input"
                              aria-label="Company name"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditNameField("name", e.target.value)
                              }
                              onBlur={() => blurEditNameField("name")}
                            />
                            <FormStatusToggle
                              active={editForm.active}
                              onChange={(active) => patchEdit({ active })}
                              disabled={pending}
                              label="Customer status"
                            />
                          </div>
                        </td>
                        <td className="customer-col-category">
                          <select
                            form="customer-edit-form"
                            required
                            aria-label="Category"
                            value={editForm.category}
                            onChange={(e) =>
                              onCategoryChange(
                                e.target.value as CustomerCategory | "",
                                patchEdit,
                              )
                            }
                          >
                            <option value={CustomerCategory.INDUSTRY}>
                              Industry
                            </option>
                            <option value={CustomerCategory.TRADER}>
                              Trader
                            </option>
                            <option value={CustomerCategory.SUPPLIER}>
                              Vendor
                            </option>
                          </select>
                        </td>
                        <td>
                          <div className="customer-inline-stack">
                            <OptionSelect
                              value={editForm.city}
                              onChange={(city) => onCityChange(city, patchEdit)}
                              options={cityNames}
                              emptyLabel="City"
                            />
                            <input
                              readOnly
                              className="field-input"
                              aria-label="State"
                              value={editForm.state}
                              placeholder={editForm.city ? "—" : "Select city"}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="customer-inline-stack">
                            <OptionSelect
                              emptyLabel="Name"
                              value={editForm.ownerName}
                              onChange={(ownerName) =>
                                patchEdit({ ownerName })
                              }
                              options={owners}
                            />
                            <input
                              className="field-input"
                              placeholder="Phone"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              aria-label="Owner phone"
                              value={editForm.ownerContact}
                              onChange={(e) =>
                                setEditPhoneField(
                                  "ownerContact",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </td>
                        <td>
                          <div className="customer-inline-stack">
                            <input
                              className="field-input"
                              placeholder="Name"
                              aria-label="Purchaser name"
                              value={editForm.purchaserName}
                              onChange={(e) =>
                                setEditNameField(
                                  "purchaserName",
                                  e.target.value,
                                )
                              }
                              onBlur={() =>
                                blurEditNameField("purchaserName")
                              }
                            />
                            <input
                              className="field-input"
                              placeholder="Phone"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              aria-label="Purchaser phone"
                              value={editForm.purchaserContact}
                              onChange={(e) =>
                                setEditPhoneField(
                                  "purchaserContact",
                                  e.target.value,
                                )
                              }
                            />
                            <input
                              className="field-input"
                              placeholder="Role"
                              aria-label="Purchaser role"
                              value={editForm.purchaserRole}
                              onChange={(e) =>
                                patchEdit({ purchaserRole: e.target.value })
                              }
                            />
                          </div>
                        </td>
                        <td>
                          <div className="customer-inline-stack">
                            <input
                              className="field-input"
                              placeholder="Name"
                              aria-label="Payment in-charge name"
                              value={editForm.paymentInChargeName}
                              onChange={(e) =>
                                setEditNameField(
                                  "paymentInChargeName",
                                  e.target.value,
                                )
                              }
                              onBlur={() =>
                                blurEditNameField("paymentInChargeName")
                              }
                            />
                            <input
                              className="field-input"
                              placeholder="Phone"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              aria-label="Payment in-charge phone"
                              value={editForm.paymentInChargeContact}
                              onChange={(e) =>
                                setEditPhoneField(
                                  "paymentInChargeContact",
                                  e.target.value,
                                )
                              }
                            />
                            <input
                              className="field-input"
                              placeholder="Role"
                              aria-label="Payment in-charge role"
                              value={editForm.paymentInChargeRole}
                              onChange={(e) =>
                                patchEdit({
                                  paymentInChargeRole: e.target.value,
                                })
                              }
                            />
                          </div>
                        </td>
                        <td>
                          <div className="customer-inline-stack">
                            <input
                              className="field-input"
                              placeholder="Name"
                              aria-label="Accountant name"
                              value={editForm.accountantName}
                              onChange={(e) =>
                                setEditNameField(
                                  "accountantName",
                                  e.target.value,
                                )
                              }
                              onBlur={() =>
                                blurEditNameField("accountantName")
                              }
                            />
                            <input
                              className="field-input"
                              placeholder="Phone"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              aria-label="Accountant phone"
                              value={editForm.accountantContact}
                              onChange={(e) =>
                                setEditPhoneField(
                                  "accountantContact",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </td>
                        <td className="num customer-col-credit">
                          <div className="field-with-unit">
                            <input
                              form="customer-edit-form"
                              type="number"
                              min={0}
                              step={1}
                              placeholder="0"
                              aria-label="Credit period"
                              value={editForm.creditDays}
                              onChange={(e) =>
                                patchEdit({ creditDays: e.target.value })
                              }
                            />
                            <span className="field-unit">days</span>
                          </div>
                        </td>
                        <td className="num customer-col-opening">
                          <div className="field-with-unit">
                            <input
                              form="customer-edit-form"
                              type="number"
                              step="0.01"
                              placeholder="0"
                              aria-label="Opening due"
                              value={editForm.openingDue}
                              onChange={(e) =>
                                patchEdit({ openingDue: e.target.value })
                              }
                            />
                            <span className="field-unit">Rs</span>
                          </div>
                        </td>
                        <td className="customer-col-sector">
                          <OptionSelect
                            value={editForm.sector}
                            onChange={(sector) => patchEdit({ sector })}
                            options={sectors}
                          />
                        </td>
                        <td className="customer-col-sales-exec">
                          <OptionSelect
                            value={editForm.saleExecutive}
                            onChange={(saleExecutive) =>
                              patchEdit({ saleExecutive })
                            }
                            options={saleExecutives}
                          />
                        </td>
                        <td>
                          <OptionSelect
                            value={editForm.approachForFunds}
                            onChange={(approachForFunds) =>
                              patchEdit({ approachForFunds })
                            }
                            options={approachOptions}
                          />
                        </td>
                        <td>
                          <OptionSelect
                            value={editForm.dealingCompany}
                            onChange={(dealingCompany) =>
                              patchEdit({ dealingCompany })
                            }
                            options={dealingCompanies}
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
                        <td className="customer-col-company">
                          {capitalizeName(row.name) ?? row.name}
                          {!row.active && (
                            <span className="customer-inactive-label">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="customer-col-category">{formatCustomerCategory(row.category)}</td>
                        <td>
                          {[row.city, row.state].filter(Boolean).join(", ") ||
                            "—"}
                        </td>
                        <td>
                          {formatContact(row.ownerName, row.ownerContact)}
                        </td>
                        <td>
                          {formatContact(
                            row.purchaserName,
                            row.purchaserContact,
                          )}
                        </td>
                        <td>
                          {formatContact(
                            row.paymentInChargeName,
                            row.paymentInChargeContact,
                          )}
                        </td>
                        <td>
                          {formatContact(
                            row.accountantName,
                            row.accountantContact,
                          )}
                        </td>
                        <td className="num customer-col-credit">
                          {formatCreditPeriod(row.creditDays)}
                        </td>
                        <td className="num customer-col-opening">
                          {formatRs(row.openingDue)}
                        </td>
                        <td className="customer-col-sector">{row.sector ?? "—"}</td>
                        <td className="customer-col-sales-exec">{row.saleExecutive ?? "—"}</td>
                        <td>{row.approachForFunds ?? "—"}</td>
                        <td>{row.dealingCompany ?? "—"}</td>
                        <td className="space-x-2 whitespace-nowrap">
                          <Link
                            href={`/reports/customer-analysis/${row.id}`}
                            className="btn btn-secondary btn-sm"
                          >
                            Analysis
                          </Link>
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
                  {isEditing && (
                    <tr className="payment-editing-row customer-edit-extra-row">
                      <td colSpan={14}>
                        <div className="customer-edit-extra form-grid form-grid-wide">
                          <label
                            className={
                              editFactoryEditable
                                ? undefined
                                : "field-label-muted"
                            }
                          >
                            Factory contact
                          </label>
                          <div
                            className={`role-fields role-fields-3${
                              editFactoryEditable
                                ? ""
                                : " role-fields-disabled"
                            }`}
                          >
                            <input
                              className="field-input"
                              placeholder="Name"
                              disabled={!editFactoryEditable}
                              value={editForm.factoryContactName}
                              onChange={(e) =>
                                setEditNameField(
                                  "factoryContactName",
                                  e.target.value,
                                )
                              }
                              onBlur={() =>
                                blurEditNameField("factoryContactName")
                              }
                            />
                            <input
                              className="field-input"
                              placeholder="Phone"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              disabled={!editFactoryEditable}
                              value={editForm.factoryContactContact}
                              onChange={(e) =>
                                setEditPhoneField(
                                  "factoryContactContact",
                                  e.target.value,
                                )
                              }
                            />
                            <input
                              className="field-input"
                              placeholder="Role"
                              disabled={!editFactoryEditable}
                              value={editForm.factoryContactRole}
                              onChange={(e) =>
                                patchEdit({
                                  factoryContactRole: e.target.value,
                                })
                              }
                            />
                          </div>

                          <label>Email</label>
                          <input
                            className="field-input"
                            type="email"
                            value={editForm.email}
                            onChange={(e) =>
                              patchEdit({ email: e.target.value })
                            }
                          />

                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={14}>
                  {customerId || category
                    ? "No customers match these filters."
                    : "No customers yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>

      {totalPages > 1 && (
        <div className="payments-pagination">
          <span>
            {from}–{to} of {total}
          </span>
          <div className="payments-pagination-actions">
            {page > 1 && (
              <Link
                href={customersHref(page - 1, customerId, category)}
                className="btn btn-secondary btn-sm"
                prefetch={false}
              >
                Previous
              </Link>
            )}
            <span>
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={customersHref(page + 1, customerId, category)}
                className="btn btn-secondary btn-sm"
                prefetch={false}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}

      <form id="customer-edit-form" onSubmit={onUpdate} hidden />
    </div>
  );
}
