"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CustomerCategory } from "@/generated/prisma";
import type { BankAccountBalanceRow } from "@/lib/actions/bankAccounts";
import { createBankTransfer, deleteBankTransfer, updateBankTransfer } from "@/lib/actions/bankTransfers";
import { createBookExpense, deleteBookExpense, updateBookExpense } from "@/lib/actions/bookExpenses";
import { createPayment, deletePayment, updatePayment } from "@/lib/actions/payments";
import {
  createSavingAccountTxn,
  deleteSavingAccountTxn,
  updateSavingAccountTxn,
} from "@/lib/actions/savingAccountTxns";
import {
  createUnallocatedReceiptTxn,
  deleteUnallocatedReceiptTxn,
  updateUnallocatedReceiptTxn,
} from "@/lib/actions/unallocatedReceiptTxns";
import { SearchableSelect } from "@/components/SearchableSelect";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import {
  capitalizeName,
  formatCustomerCategory,
  formatDateDdMmYyyy,
  formatIndianAmountTyping,
  formatBankAmount,
  parseAmountInput,
  toTitleCase,
} from "@/lib/domain/format";
import {
  parsePartyKey,
  partyKey,
  partyOptionGroup,
  partyOptionLabel,
} from "@/lib/domain/paymentParty";
import { useBankAccountPicker } from "./BankEntryForm";
import type { BankRegisterKind, BankRegisterRow } from "./bankRegisterData";

const PAGE_SIZE = 40;
const EDIT_LOCK_HINT =
  "Staff can edit/delete only entries they created on the same day.";

const KIND_LABEL: Record<BankRegisterKind, string> = {
  others: "Transaction with Coal",
  current: "Transaction with Current A/c",
  saving: "Transaction with Saving A/c",
  unallocated: "Unallocated Receipt A/c",
  expenses: "Expenses",
};

type Party = {
  id: string;
  name: string;
  kind: "customer" | "transporter" | "investment";
  category?: CustomerCategory;
};

type EditState = {
  originalKind: BankRegisterKind;
  kind: BankRegisterKind;
  id: string;
  date: string;
  amount: string;
  direction: string;
  expenseId: string;
  bankAccountId: string;
  paidAccountId: string;
  receivedAccountId: string;
  partyId: string;
  savingName: string;
  receiptName: string;
  particular: string;
};

function editFromRow(row: BankRegisterRow): EditState {
  return {
    originalKind: row.kind,
    kind: row.kind,
    id: row.id,
    date: row.date,
    amount: row.amount,
    direction: row.direction,
    expenseId: row.expenseId,
    bankAccountId: row.bankAccountId,
    paidAccountId: row.paidAccountId,
    receivedAccountId: row.receivedAccountId,
    partyId: row.partyId,
    savingName: row.savingName,
    receiptName: row.receiptName,
    particular: row.particular,
  };
}

function sameAccountName(left: string, right: string) {
  const a = left.trim().toLowerCase();
  const b = right.trim().toLowerCase();
  return a.length > 0 && a === b;
}

function particularText(row: BankRegisterRow) {
  return toTitleCase(row.particular) || "—";
}

function showBalanceCard(account: BankAccountBalanceRow) {
  const name = account.accountName.trim().toLowerCase();
  const bank = account.bankName.trim().toLowerCase();
  return !(name === "other" && bank.includes("icici"));
}

function withCategory(current: EditState, nextKind: BankRegisterKind): EditState {
  if (current.kind === nextKind) return current;
  const direction =
    nextKind === "current"
      ? ""
      : current.direction === "RECEIVED" || current.direction === "SENT"
        ? current.direction
        : "";
  return {
    ...current,
    kind: nextKind,
    direction,
    bankAccountId:
      nextKind === "current" ? "" : current.bankAccountId || current.paidAccountId,
    paidAccountId:
      nextKind === "current" ? current.paidAccountId || current.bankAccountId : "",
    receivedAccountId: nextKind === "current" ? current.receivedAccountId : "",
    partyId: nextKind === "others" ? current.partyId : "",
    savingName: nextKind === "saving" ? current.savingName : "",
    receiptName: nextKind === "unallocated" ? current.receiptName : "",
    expenseId: nextKind === "expenses" ? current.expenseId : "",
    particular: nextKind === "expenses" ? current.particular : "",
  };
}

async function deleteEditedEntry(kind: BankRegisterKind, id: string) {
  if (kind === "others") await deletePayment(id);
  else if (kind === "current") await deleteBankTransfer(id);
  else if (kind === "saving") await deleteSavingAccountTxn(id);
  else if (kind === "unallocated") await deleteUnallocatedReceiptTxn(id);
  else await deleteBookExpense(id);
}

async function createEditedEntry(form: EditState) {
  if (form.kind === "others") {
    const party = parsePartyKey(form.partyId);
    await createPayment({
      date: form.date,
      bankAccountId: form.bankAccountId,
      customerId: party.kind === "customer" ? party.id : null,
      transporterId: party.kind === "transporter" ? party.id : null,
      investmentCompanyId: party.kind === "investment" ? party.id : null,
      direction: form.direction,
      amount: form.amount,
    });
    return;
  }
  if (form.kind === "current") {
    await createBankTransfer({
      date: form.date,
      paidAccountId: form.paidAccountId,
      receivedAccountId: form.receivedAccountId,
      amount: form.amount,
    });
    return;
  }
  if (form.kind === "saving") {
    await createSavingAccountTxn({
      date: form.date,
      bankAccountId: form.bankAccountId,
      direction: form.direction,
      savingAccountName: form.savingName,
      amount: form.amount,
    });
    return;
  }
  if (form.kind === "unallocated") {
    await createUnallocatedReceiptTxn({
      date: form.date,
      bankAccountId: form.bankAccountId,
      direction: form.direction,
      receiptName: form.receiptName,
      amount: form.amount,
    });
    return;
  }
  await createBookExpense({
    date: form.date,
    paidAccountId: form.bankAccountId,
    indirectExpenseId: form.expenseId,
    direction: form.direction,
    amount: form.amount,
    particular: form.particular,
  });
}

export function BankRegisterClient({
  rows,
  kinds,
  accounts,
  parties,
  expenses,
}: {
  rows: BankRegisterRow[];
  kinds: BankRegisterKind[];
  accounts: BankAccountBalanceRow[];
  parties: Party[];
  expenses: { id: string; name: string }[];
}) {
  const router = useRouter();
  const entry = useBankAccountPicker();
  const [view, setView] = useState<BankRegisterKind | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const partyOptions = useMemo(
    () =>
      parties.map((party) => ({
        value: partyKey(party.kind, party.id),
        label: partyOptionLabel({
          kind: party.kind,
          name: party.name,
          categoryLabel: party.category
            ? formatCustomerCategory(party.category)
            : undefined,
        }),
        group: partyOptionGroup(party.kind),
      })),
    [parties],
  );

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (view !== "all" && row.kind !== view) return false;
      if (dateFrom && row.date < dateFrom) return false;
      if (dateTo && row.date > dateTo) return false;
      return true;
    });
  }, [rows, view, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const from = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const counts = useMemo(() => {
    const map = new Map<BankRegisterKind, number>();
    for (const row of rows) map.set(row.kind, (map.get(row.kind) ?? 0) + 1);
    return map;
  }, [rows]);

  const downloadRows = useMemo(() => {
    const ordered = [...filtered].sort((left, right) => {
      if (left.date !== right.date) return left.date < right.date ? -1 : 1;
      const kindOrder = kinds.indexOf(left.kind) - kinds.indexOf(right.kind);
      if (kindOrder !== 0) return kindOrder;
      return left.id < right.id ? -1 : 1;
    });
    return ordered.map((row) => ({
      date: formatDateDdMmYyyy(row.date),
      category: KIND_LABEL[row.kind],
      type: row.typeLabel,
      fundPaid: row.fundPaid,
      fundReceived: row.fundReceived,
      amount: formatBankAmount(row.amount),
      particular: particularText(row),
    }));
  }, [filtered, kinds]);

  const amountDisplay = formatIndianAmountTyping(editing?.amount ?? "");

  function show(nextView: BankRegisterKind | "all") {
    setView(nextView);
    setPage(1);
    setEditing(null);
    setError(null);
  }

  function validate(form: EditState): string | null {
    if (!form.date) return "Date is required";
    if (!form.amount || Number(form.amount) <= 0) {
      return "Amount must be greater than zero";
    }
    if (form.kind === "others") {
      if (form.direction !== "RECEIVED" && form.direction !== "SENT") {
        return "Select Fund Received or Fund Paid";
      }
      if (!form.bankAccountId) return "Select an account";
      if (!form.partyId) {
        return "Customer, transporter, or investment company is required";
      }
    }
    if (form.kind === "current") {
      if (!form.paidAccountId) return "Select a fund paid account";
      if (!form.receivedAccountId) return "Select a fund received account";
      const paid = accounts.find((account) => account.id === form.paidAccountId);
      const received = accounts.find(
        (account) => account.id === form.receivedAccountId,
      );
      if (sameAccountName(paid?.accountName ?? "", received?.accountName ?? "")) {
        return "Fund paid and fund received cannot be the same account";
      }
    }
    if (form.kind === "saving") {
      if (form.direction !== "RECEIVED" && form.direction !== "SENT") {
        return "Select Fund Received or Fund Paid";
      }
      if (!form.bankAccountId) return "Select an account";
      if (!form.savingName.trim()) return "Saving Account Name is required";
    }
    if (form.kind === "unallocated") {
      if (form.direction !== "RECEIVED" && form.direction !== "SENT") {
        return "Select Fund Received or Fund Paid";
      }
      if (!form.bankAccountId) return "Select an account";
      if (!form.receiptName.trim()) return "Receipt name is required";
    }
    if (form.kind === "expenses") {
      if (form.direction !== "RECEIVED" && form.direction !== "SENT") {
        return "Select Fund Received or Fund Paid";
      }
      if (!form.bankAccountId) return "Select a fund paid account";
      if (!form.expenseId) return "Select an indirect expense";
      if (!form.particular.trim()) return "Particular is required";
    }
    return null;
  }

  function saveEdit() {
    if (!editing) return;
    const message = validate(editing);
    if (message) {
      setError(message);
      return;
    }
    const form = editing;
    setError(null);
    startTransition(async () => {
      try {
        if (form.kind !== form.originalKind) {
          await createEditedEntry(form);
          await deleteEditedEntry(form.originalKind, form.id);
        } else if (form.kind === "others") {
          const party = parsePartyKey(form.partyId);
          await updatePayment(form.id, {
            date: form.date,
            bankAccountId: form.bankAccountId,
            customerId: party.kind === "customer" ? party.id : null,
            transporterId: party.kind === "transporter" ? party.id : null,
            investmentCompanyId: party.kind === "investment" ? party.id : null,
            direction: form.direction,
            amount: form.amount,
          });
        } else if (form.kind === "current") {
          await updateBankTransfer(form.id, {
            date: form.date,
            paidAccountId: form.paidAccountId,
            receivedAccountId: form.receivedAccountId,
            amount: form.amount,
          });
        } else if (form.kind === "saving") {
          await updateSavingAccountTxn(form.id, {
            date: form.date,
            bankAccountId: form.bankAccountId,
            direction: form.direction,
            savingAccountName: form.savingName,
            amount: form.amount,
          });
        } else if (form.kind === "unallocated") {
          await updateUnallocatedReceiptTxn(form.id, {
            date: form.date,
            bankAccountId: form.bankAccountId,
            direction: form.direction,
            receiptName: form.receiptName,
            amount: form.amount,
          });
        } else {
          await updateBookExpense(form.id, {
            date: form.date,
            paidAccountId: form.bankAccountId,
            indirectExpenseId: form.expenseId,
            direction: form.direction,
            amount: form.amount,
            particular: form.particular,
          });
        }
        setEditing(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onDelete(row: BankRegisterRow) {
    if (!confirm(`Delete this ${KIND_LABEL[row.kind]} entry of ${formatBankAmount(row.amount)}?`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (row.kind === "others") await deletePayment(row.id);
        else if (row.kind === "current") await deleteBankTransfer(row.id);
        else if (row.kind === "saving") await deleteSavingAccountTxn(row.id);
        else if (row.kind === "unallocated") {
          await deleteUnallocatedReceiptTxn(row.id);
        } else await deleteBookExpense(row.id);
        if (editing?.id === row.id && editing.originalKind === row.kind) setEditing(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  function onAmount(value: string) {
    const raw = parseAmountInput(value).replace(/[^\d.]/g, "");
    if (raw !== "" && !/^\d*\.?\d{0,2}$/.test(raw)) return;
    setEditing((current) => (current ? { ...current, amount: raw } : current));
  }

  function pickAccount(accountId: string) {
    if (!editing) {
      entry.pickAccount(accountId);
      return;
    }
    if (editing.kind !== "current") {
      setEditing({ ...editing, bankAccountId: accountId, paidAccountId: accountId });
      return;
    }
    setEditing((current) => {
      if (!current) return current;
      if (
        current.paidAccountId === accountId ||
        current.receivedAccountId === accountId
      ) {
        return current;
      }
      const clicked = accounts.find((account) => account.id === accountId)?.accountName ?? "";
      const paid = accounts.find((account) => account.id === current.paidAccountId)?.accountName ?? "";
      if (!current.paidAccountId) return { ...current, paidAccountId: accountId };
      if (!current.receivedAccountId && !sameAccountName(clicked, paid)) {
        return { ...current, receivedAccountId: accountId };
      }
      const received =
        accounts.find((account) => account.id === current.receivedAccountId)?.accountName ?? "";
      return {
        ...current,
        paidAccountId: accountId,
        receivedAccountId: sameAccountName(clicked, received) ? "" : current.receivedAccountId,
      };
    });
  }

  function accountPressed(accountId: string) {
    if (editing?.kind === "current") {
      return (
        editing.paidAccountId === accountId || editing.receivedAccountId === accountId
      );
    }
    if (editing) {
      return editing.bankAccountId === accountId;
    }
    return (
      entry.bankAccountId === accountId ||
      entry.paidAccountId === accountId ||
      entry.receivedAccountId === accountId
    );
  }

  return (
    <div className="bank-register">
      <section className="extra-information" aria-label="Extra information">
        <h2 className="extra-information-title">Extra information</h2>
        {accounts.filter(showBalanceCard).length === 0 ? (
          <p>No bank accounts yet. Add one under Masters → Bank → Create Bank Account.</p>
        ) : (
          <div className="detail-stat-row">
            {accounts.filter(showBalanceCard).map((account) => {
              const negative = Number(account.balance) < 0;
              return (
                <button
                  key={account.id}
                  type="button"
                  className="detail-stat"
                  aria-pressed={accountPressed(account.id)}
                  onClick={() => pickAccount(account.id)}
                >
                  <span className="detail-stat-label">{account.accountName}</span>
                  <span className="extra-information-bank">{account.bankName}</span>
                  <span
                    className={
                      negative
                        ? "detail-stat-value fund-type-out"
                        : "detail-stat-value"
                    }
                  >
                    {formatBankAmount(account.balance)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="page-header bank-register-downloads">
        <TableDownloadButtons
          title="Bank transactions"
          filenameBase="bank-transactions"
          columns={[
            { key: "date", header: "Date" },
            { key: "category", header: "Category" },
            { key: "type", header: "Type" },
            { key: "fundPaid", header: "Fund paid" },
            { key: "fundReceived", header: "Fund received" },
            { key: "amount", header: "Amount", align: "right" },
            { key: "particular", header: "Particular" },
          ]}
          rows={downloadRows}
        />
      </div>

      <div className="bank-register-toolbar">
        <div className="bank-register-pills" role="tablist" aria-label="Transaction category">
          <button
            type="button"
            className={view === "all" ? "bank-register-pill is-active" : "bank-register-pill"}
            aria-pressed={view === "all"}
            onClick={() => show("all")}
          >
            All
            <span>{rows.length}</span>
          </button>
          {kinds.map((kind) => (
            <button
              key={kind}
              type="button"
              className={view === kind ? "bank-register-pill is-active" : "bank-register-pill"}
              aria-pressed={view === kind}
              onClick={() => show(kind)}
            >
              {KIND_LABEL[kind]}
              <span>{counts.get(kind) ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="bank-register-dates">
          <label>
            <span>From</span>
            <input
              type="date"
              className="field-input"
              aria-label="From"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            <span>To</span>
            <input
              type="date"
              className="field-input"
              aria-label="To"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
      </div>

      {error ? (
        <div className="error-box" role="alert">
          {error}
        </div>
      ) : null}

      <div className="table-wrap payments-table-wrap">
        <div className="table-h-scroll">
          <table className="data payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Fund paid</th>
                <th>Fund received</th>
                <th className="cell-num">Amount</th>
                <th>Particular</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, index) => {
                const previous = index > 0 ? pageRows[index - 1] : null;
                const dateBreak = !previous || previous.date !== row.date;
                const isEditing =
                  editing?.originalKind === row.kind && editing.id === row.id;
                return (
                  <RegisterRows
                    key={`${row.kind}:${row.id}`}
                    kinds={kinds}
                    row={row}
                    dateBreak={dateBreak}
                    isEditing={isEditing}
                    editing={isEditing ? editing : null}
                    pending={pending}
                    accounts={accounts}
                    expenses={expenses}
                    partyOptions={partyOptions}
                    amountDisplay={isEditing ? amountDisplay : ""}
                    onAmount={onAmount}
                    onEdit={() => {
                      window.setTimeout(() => {
                        setEditing(editFromRow(row));
                        setError(null);
                      }, 0);
                    }}
                    onCancel={() => {
                      setEditing(null);
                      setError(null);
                    }}
                    onSave={saveEdit}
                    onDelete={() => onDelete(row)}
                    onChange={(next) => setEditing(next)}
                  />
                );
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    {rows.length === 0
                      ? "No transactions yet."
                      : "No transactions match these filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="payments-pagination">
          <span>
            {from}–{to} of {filtered.length}
          </span>
          <div className="payments-pagination-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RegisterRows({
  kinds,
  row,
  dateBreak,
  isEditing,
  editing,
  pending,
  accounts,
  expenses,
  partyOptions,
  amountDisplay,
  onAmount,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onChange,
}: {
  kinds: BankRegisterKind[];
  row: BankRegisterRow;
  dateBreak: boolean;
  isEditing: boolean;
  editing: EditState | null;
  pending: boolean;
  accounts: BankAccountBalanceRow[];
  expenses: { id: string; name: string }[];
  partyOptions: { value: string; label: string; group: string }[];
  amountDisplay: string;
  onAmount: (value: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (next: EditState) => void;
}) {
  return (
    <>
      {dateBreak ? (
        <tr className="bank-register-date">
          <td colSpan={6}>{formatDateDdMmYyyy(row.date)}</td>
        </tr>
      ) : null}
      <tr className={isEditing ? "payment-editing-row" : undefined}>
        <td>{formatDateDdMmYyyy(row.date)}</td>
        <td>{row.fundPaid}</td>
        <td>{row.fundReceived}</td>
        <td className="cell-num">{formatBankAmount(row.amount)}</td>
        <td className={particularText(row) === "—" ? "cell-dash" : undefined}>
          {particularText(row)}
        </td>
        <td className="payment-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onEdit}
            disabled={pending || !row.canEdit}
            title={row.canEdit ? undefined : EDIT_LOCK_HINT}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={onDelete}
            disabled={pending || !row.canDelete}
            title={row.canDelete ? undefined : EDIT_LOCK_HINT}
          >
            Delete
          </button>
        </td>
      </tr>
      {isEditing && editing ? (
        <tr className="payment-editing-row">
          <td colSpan={6}>
            <EditFields
              kinds={kinds}
              editing={editing}
              accounts={accounts}
              expenses={expenses}
              partyOptions={partyOptions}
              amountDisplay={amountDisplay}
              pending={pending}
              onAmount={onAmount}
              onCancel={onCancel}
              onSave={onSave}
              onChange={onChange}
            />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function EditFields({
  kinds,
  editing,
  accounts,
  expenses,
  partyOptions,
  amountDisplay,
  pending,
  onAmount,
  onCancel,
  onSave,
  onChange,
}: {
  kinds: BankRegisterKind[];
  editing: EditState;
  accounts: BankAccountBalanceRow[];
  expenses: { id: string; name: string }[];
  partyOptions: { value: string; label: string; group: string }[];
  amountDisplay: string;
  pending: boolean;
  onAmount: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onChange: (next: EditState) => void;
}) {
  const paidName =
    accounts.find((account) => account.id === editing.receivedAccountId)?.accountName ?? "";
  const receivedName =
    accounts.find((account) => account.id === editing.paidAccountId)?.accountName ?? "";
  const paidAccounts =
    editing.kind === "current"
      ? accounts.filter((account) => !sameAccountName(account.accountName, paidName))
      : accounts;
  const receivedAccounts =
    editing.kind === "current"
      ? accounts.filter((account) => !sameAccountName(account.accountName, receivedName))
      : accounts;

  return (
    <form
      className="bank-register-edit"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <label>
        <span>Category</span>
        <select
          className="field-input"
          aria-label="Category"
          value={editing.kind}
          onChange={(event) =>
            onChange(withCategory(editing, event.target.value as BankRegisterKind))
          }
        >
          {kinds.map((kind) => (
            <option key={kind} value={kind}>
              {KIND_LABEL[kind]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Date</span>
        <input
          type="date"
          className="field-input"
          value={editing.date}
          onChange={(event) => onChange({ ...editing, date: event.target.value })}
        />
      </label>
      {editing.kind !== "current" ? (
        <label>
          <span>Type</span>
          <select
            className="field-input"
            value={editing.direction}
            onChange={(event) => onChange({ ...editing, direction: event.target.value })}
          >
            <option value="RECEIVED">Fund Received</option>
            <option value="SENT">Fund Paid</option>
          </select>
        </label>
      ) : null}
      {editing.kind === "current" ? (
        <>
          <label>
            <span>Fund paid account</span>
            <select
              className="field-input"
              value={editing.paidAccountId}
              onChange={(event) =>
                onChange({ ...editing, paidAccountId: event.target.value })
              }
            >
              <option value="">Select account</option>
              {paidAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountName}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Fund received account</span>
            <select
              className="field-input"
              value={editing.receivedAccountId}
              onChange={(event) =>
                onChange({ ...editing, receivedAccountId: event.target.value })
              }
            >
              <option value="">Select account</option>
              {receivedAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountName}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : editing.kind === "expenses" ? (
        <>
          <label>
            <span>Fund paid account</span>
            <select
              className="field-input"
              value={editing.bankAccountId}
              onChange={(event) =>
                onChange({ ...editing, bankAccountId: event.target.value })
              }
            >
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bankName
                    ? `${account.accountName} (${account.bankName})`
                    : account.accountName}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Expenses</span>
            <select
              className="field-input"
              value={editing.expenseId}
              onChange={(event) =>
                onChange({ ...editing, expenseId: event.target.value })
              }
            >
              <option value="">Select expense</option>
              {expenses.map((expense) => (
                <option key={expense.id} value={expense.id}>
                  {expense.name}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : (
        <>
          <label>
            <span>Fund paid account</span>
            {editing.direction === "RECEIVED" &&
            (editing.kind === "saving" || editing.kind === "unallocated") ? (
              <input
                type="text"
                className="field-input"
                value={
                  editing.kind === "saving"
                    ? editing.savingName
                    : editing.receiptName
                }
                onChange={(event) =>
                  onChange(
                    editing.kind === "saving"
                      ? { ...editing, savingName: event.target.value }
                      : { ...editing, receiptName: event.target.value },
                  )
                }
                onBlur={() =>
                  onChange(
                    editing.kind === "saving"
                      ? {
                          ...editing,
                          savingName:
                            capitalizeName(editing.savingName) ??
                            editing.savingName,
                        }
                      : {
                          ...editing,
                          receiptName:
                            capitalizeName(editing.receiptName) ??
                            editing.receiptName,
                        },
                  )
                }
              />
            ) : editing.direction === "RECEIVED" ? (
              <SearchableSelect
                className="field-input"
                ariaLabel="Fund paid account"
                placeholder="Search customer, transporter, or investment"
                value={editing.partyId}
                onChange={(partyId) => onChange({ ...editing, partyId })}
                options={partyOptions}
              />
            ) : (
              <select
                className="field-input"
                value={editing.bankAccountId}
                onChange={(event) =>
                  onChange({ ...editing, bankAccountId: event.target.value })
                }
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.bankName
                      ? `${account.accountName} (${account.bankName})`
                      : account.accountName}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label>
              <span>Fund received account</span>
              {editing.direction === "SENT" &&
              (editing.kind === "saving" || editing.kind === "unallocated") ? (
                <input
                  type="text"
                  className="field-input"
                  value={
                    editing.kind === "saving"
                      ? editing.savingName
                      : editing.receiptName
                  }
                  onChange={(event) =>
                    onChange(
                      editing.kind === "saving"
                        ? { ...editing, savingName: event.target.value }
                        : { ...editing, receiptName: event.target.value },
                    )
                  }
                  onBlur={() =>
                    onChange(
                      editing.kind === "saving"
                        ? {
                            ...editing,
                            savingName:
                              capitalizeName(editing.savingName) ??
                              editing.savingName,
                          }
                        : {
                            ...editing,
                            receiptName:
                              capitalizeName(editing.receiptName) ??
                              editing.receiptName,
                          },
                    )
                  }
                />
              ) : editing.direction === "SENT" ? (
                <SearchableSelect
                  className="field-input"
                  ariaLabel="Fund received account"
                  placeholder="Search customer, transporter, or investment"
                  value={editing.partyId}
                  onChange={(partyId) => onChange({ ...editing, partyId })}
                  options={partyOptions}
                />
              ) : (
                <select
                  className="field-input"
                  value={editing.bankAccountId}
                  onChange={(event) =>
                    onChange({ ...editing, bankAccountId: event.target.value })
                  }
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.bankName
                        ? `${account.accountName} (${account.bankName})`
                        : account.accountName}
                    </option>
                  ))}
                </select>
              )}
            </label>
        </>
      )}
      <label>
        <span>Amount</span>
        <input
          type="text"
          inputMode="decimal"
          className="field-input"
          value={amountDisplay}
          onChange={(event) => onAmount(event.target.value)}
        />
      </label>
      {editing.kind === "expenses" ? (
        <label>
          <span>Particular</span>
          <input
            type="text"
            className="field-input"
            value={editing.particular}
            onChange={(event) => onChange({ ...editing, particular: event.target.value })}
            onBlur={() =>
              onChange({ ...editing, particular: toTitleCase(editing.particular) })
            }
          />
        </label>
      ) : null}
      <div className="bank-register-edit-actions">
        <button type="submit" className="btn btn-sm" disabled={pending}>
          Update
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
