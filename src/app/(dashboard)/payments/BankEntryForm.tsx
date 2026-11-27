"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  FormEvent,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { CustomerCategory } from "@/generated/prisma";
import type { BankAccountBalanceRow } from "@/lib/actions/bankAccounts";
import { createBankTransfer } from "@/lib/actions/bankTransfers";
import { createBookExpense } from "@/lib/actions/bookExpenses";
import { createPayment } from "@/lib/actions/payments";
import { createSavingAccountTxn } from "@/lib/actions/savingAccountTxns";
import { createTaxExpense } from "@/lib/actions/taxExpenses";
import { createUnallocatedReceiptTxn } from "@/lib/actions/unallocatedReceiptTxns";
import { SearchableSelect } from "@/components/SearchableSelect";
import { canAccessPath } from "@/lib/auth/pages";
import {
  categoryUsesCurrentOrCcAccounts,
  filterCurrentOrCcAccounts,
  filterSavingAccounts,
  filterSavingTransferAccounts,
  isCurrentOrCcAccountType,
  isSavingAccountType,
} from "@/lib/domain/bankAccountType";
import {
  capitalizeName,
  formatCustomerCategory,
  formatIndianAmountTyping,
  parseAmountInput,
  toTitleCase,
} from "@/lib/domain/format";
import { resolveSavingTransfer } from "@/lib/domain/savingTransfer";
import {
  parsePartyKey,
  partyKey,
  partyOptionGroup,
  partyOptionLabel,
} from "@/lib/domain/paymentParty";

export type BankCategory =
  | "others"
  | "current"
  | "saving"
  | "unallocated"
  | "expenses"
  | "taxes";

export type BankEntryParty = {
  id: string;
  name: string;
  kind: "customer" | "transporter" | "investment";
  category?: CustomerCategory;
};

export type BankEntryExpense = { id: string; name: string };

const CATEGORIES: { id: BankCategory; href: string; label: string }[] = [
  { id: "others", href: "/payments", label: "Transaction with Coal" },
  {
    id: "current",
    href: "/payments/transaction",
    label: "Transaction with Current A/c",
  },
  {
    id: "saving",
    href: "/payments/txn-saving",
    label: "Transaction with Saving A/c",
  },
  {
    id: "unallocated",
    href: "/payments/unallocated-receipt",
    label: "Unallocated Receipt A/c",
  },
  { id: "expenses", href: "/payments/book-expenses", label: "Expenses" },
  { id: "taxes", href: "/payments/taxes", label: "Taxes" },
];

type SlotKind = "bank" | "party" | "saving" | "unallocated" | "wait" | "none";

type FormState = {
  date: string;
  type: string;
  expenseId: string;
  bankAccountId: string;
  partyId: string;
  savingName: string;
  receiptName: string;
  paidAccountId: string;
  receivedAccountId: string;
  amount: string;
  particular: string;
};

type BankEntryContextValue = {
  form: FormState;
  pickAccount: (accountId: string) => void;
};

const BankEntryContext = createContext<BankEntryContextValue | null>(null);

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptyForm(): FormState {
  return {
    date: todayLocal(),
    type: "",
    expenseId: "",
    bankAccountId: "",
    partyId: "",
    savingName: "",
    receiptName: "",
    paidAccountId: "",
    receivedAccountId: "",
    amount: "",
    particular: "",
  };
}

function categoryFromPath(pathname: string): BankCategory {
  if (pathname.startsWith("/payments/transaction")) return "current";
  if (pathname.startsWith("/payments/txn-saving")) return "saving";
  if (pathname.startsWith("/payments/unallocated-receipt")) return "unallocated";
  if (pathname.startsWith("/payments/book-expenses")) return "expenses";
  if (pathname.startsWith("/payments/taxes")) return "taxes";
  return "others";
}

function accountLabel(accountName: string, bankName?: string | null): string {
  return bankName ? `${accountName} (${bankName})` : accountName;
}

function accountNameOf(accounts: BankAccountBalanceRow[], id: string): string {
  return accounts.find((account) => account.id === id)?.accountName ?? "";
}

function sameAccountName(left: string, right: string): boolean {
  const a = left.trim().toLowerCase();
  const b = right.trim().toLowerCase();
  return a.length > 0 && a === b;
}

function optionsExceptName(
  accounts: BankAccountBalanceRow[],
  blockedName: string,
) {
  if (!blockedName.trim()) return accounts;
  return accounts.filter(
    (account) => !sameAccountName(account.accountName, blockedName),
  );
}

function slotsFor(category: BankCategory, type: string): {
  paid: SlotKind;
  received: SlotKind;
} {
  if (category === "current" || category === "saving") {
    return { paid: "bank", received: "bank" };
  }
  if (category === "expenses" || category === "taxes") {
    return { paid: "bank", received: "none" };
  }
  if (type !== "RECEIVED" && type !== "SENT") {
    return { paid: "wait", received: "wait" };
  }
  const other: SlotKind =
    category === "unallocated" ? "unallocated" : "party";
  if (type === "SENT") return { paid: "bank", received: other };
  return { paid: other, received: "bank" };
}

const EMPTY_PICKER = {
  bankAccountId: "",
  paidAccountId: "",
  receivedAccountId: "",
  pickAccount: () => {},
};

export function useBankAccountPicker() {
  const ctx = useContext(BankEntryContext);
  if (!ctx) return EMPTY_PICKER;
  return {
    bankAccountId: ctx.form.bankAccountId,
    paidAccountId: ctx.form.paidAccountId,
    receivedAccountId: ctx.form.receivedAccountId,
    pickAccount: ctx.pickAccount,
  };
}

export function BankEntryProvider({
  pageKeys,
  accounts,
  parties,
  expenses,
  taxes,
  children,
}: {
  pageKeys: string[] | "all";
  accounts: BankAccountBalanceRow[];
  parties: BankEntryParty[];
  expenses: BankEntryExpense[];
  taxes: BankEntryExpense[];
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const pathCategory = categoryFromPath(pathname);
  const [trackedCategory, setTrackedCategory] = useState(pathCategory);
  const [selectedCategory, setSelectedCategory] = useState(pathCategory);
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const category = selectedCategory;

  if (trackedCategory !== pathCategory) {
    setTrackedCategory(pathCategory);
    setSelectedCategory(pathCategory);
    setForm((current) => ({ ...emptyForm(), date: current.date }));
    setError(null);
  }

  function pickAccount(accountId: string) {
    setForm((current) => {
      if (category !== "current" && category !== "saving") {
        return { ...current, bankAccountId: accountId };
      }
      if (
        current.paidAccountId === accountId ||
        current.receivedAccountId === accountId
      ) {
        return current;
      }
      const clicked = accounts.find((account) => account.id === accountId);
      if (!clicked) return current;
      if (category === "saving") {
        const eligible = filterSavingTransferAccounts([clicked]).length > 0;
        if (!eligible) return current;
      }
      const clickedName = clicked.accountName;
      const paidName = accountNameOf(accounts, current.paidAccountId);
      if (!current.paidAccountId) {
        return { ...current, paidAccountId: accountId };
      }
      if (
        !current.receivedAccountId &&
        !sameAccountName(clickedName, paidName)
      ) {
        if (category === "saving") {
          const paid = accounts.find(
            (account) => account.id === current.paidAccountId,
          );
          if (!paid) return { ...current, paidAccountId: accountId };
          const paidSaving = isSavingAccountType(paid.accountTypeName);
          const clickedSaving = isSavingAccountType(clicked.accountTypeName);
          const clickedCurrent = isCurrentOrCcAccountType(
            clicked.accountTypeName,
          );
          const ok =
            (paidSaving && clickedCurrent) ||
            (isCurrentOrCcAccountType(paid.accountTypeName) && clickedSaving);
          if (!ok) return { ...current, paidAccountId: accountId };
        }
        return { ...current, receivedAccountId: accountId };
      }
      const nextReceived =
        category === "saving"
          ? typeof resolveSavingTransfer(
              accounts,
              accountId,
              current.receivedAccountId,
            ) === "string"
            ? ""
            : current.receivedAccountId
          : sameAccountName(
                clickedName,
                accountNameOf(accounts, current.receivedAccountId),
              )
            ? ""
            : current.receivedAccountId;
      return {
        ...current,
        paidAccountId: accountId,
        receivedAccountId: nextReceived,
      };
    });
  }

  function validate(current: FormState): string | null {
    if (!current.date) return "Date is required";
    if (!current.amount || Number(current.amount) <= 0) {
      return "Amount must be greater than zero";
    }
    if (category === "others") {
      if (current.type !== "RECEIVED" && current.type !== "SENT") {
        return "Select Fund Received or Fund Paid";
      }
      if (!current.bankAccountId) return "Select an account";
      if (!current.partyId) {
        return "Customer, transporter, or investment company is required";
      }
    }
    if (category === "current") {
      if (!current.paidAccountId) return "Select a fund paid account";
      if (!current.receivedAccountId) return "Select a fund received account";
      if (
        sameAccountName(
          accountNameOf(accounts, current.paidAccountId),
          accountNameOf(accounts, current.receivedAccountId),
        )
      ) {
        return "Fund paid and fund received cannot be the same account";
      }
    }
    if (category === "saving") {
      if (!current.paidAccountId) return "Select a fund paid account";
      if (!current.receivedAccountId) return "Select a fund received account";
      const resolved = resolveSavingTransfer(
        accounts,
        current.paidAccountId,
        current.receivedAccountId,
      );
      if (typeof resolved === "string") return resolved;
    }
    if (category === "unallocated") {
      if (current.type !== "RECEIVED" && current.type !== "SENT") {
        return "Select Fund Received or Fund Paid";
      }
      if (!current.bankAccountId) return "Select an account";
      if (!current.receiptName.trim()) return "Receipt name is required";
    }
    if (category === "expenses" || category === "taxes") {
      if (current.type !== "RECEIVED" && current.type !== "SENT") {
        return "Select Fund Received or Fund Paid";
      }
      if (!current.bankAccountId) {
        return current.type === "RECEIVED"
          ? "Select a fund received account"
          : "Select a fund paid account";
      }
      if (!current.expenseId) {
        return category === "taxes"
          ? "Select a government tax"
          : "Select an indirect expense";
      }
      if (!current.particular.trim()) return "Particular is required";
    }
    return null;
  }

  function keptAfterSave(current: FormState): FormState {
    const next = { ...emptyForm(), date: current.date };
    if (category === "others" || category === "unallocated") {
      next.type = current.type;
      next.bankAccountId = current.bankAccountId;
    }
    if (category === "expenses" || category === "taxes") {
      next.type = current.type;
      next.expenseId = current.expenseId;
      next.bankAccountId = current.bankAccountId;
    }
    return next;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const message = validate(form);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    const snapshot = form;
    startTransition(async () => {
      try {
        if (category === "others") {
          const party = parsePartyKey(snapshot.partyId);
          await createPayment({
            date: snapshot.date,
            bankAccountId: snapshot.bankAccountId,
            customerId: party.kind === "customer" ? party.id : null,
            transporterId: party.kind === "transporter" ? party.id : null,
            investmentCompanyId: party.kind === "investment" ? party.id : null,
            direction: snapshot.type,
            amount: snapshot.amount,
          });
        } else if (category === "current") {
          await createBankTransfer({
            date: snapshot.date,
            paidAccountId: snapshot.paidAccountId,
            receivedAccountId: snapshot.receivedAccountId,
            amount: snapshot.amount,
          });
        } else if (category === "saving") {
          const resolved = resolveSavingTransfer(
            accounts,
            snapshot.paidAccountId,
            snapshot.receivedAccountId,
          );
          if (typeof resolved === "string") throw new Error(resolved);
          await createSavingAccountTxn({
            date: snapshot.date,
            bankAccountId: resolved.bankAccountId,
            direction: resolved.direction,
            savingAccountName: resolved.savingName,
            amount: snapshot.amount,
          });
        } else if (category === "unallocated") {
          await createUnallocatedReceiptTxn({
            date: snapshot.date,
            bankAccountId: snapshot.bankAccountId,
            direction: snapshot.type,
            receiptName: snapshot.receiptName,
            amount: snapshot.amount,
          });
        } else if (category === "taxes") {
          await createTaxExpense({
            date: snapshot.date,
            paidAccountId: snapshot.bankAccountId,
            governmentTaxId: snapshot.expenseId,
            direction: snapshot.type,
            amount: snapshot.amount,
            particular: snapshot.particular,
          });
        } else {
          await createBookExpense({
            date: snapshot.date,
            paidAccountId: snapshot.bankAccountId,
            indirectExpenseId: snapshot.expenseId,
            direction: snapshot.type,
            amount: snapshot.amount,
            particular: snapshot.particular,
          });
        }
        setForm(keptAfterSave(snapshot));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  const value = { form, pickAccount };

  return (
    <BankEntryContext.Provider value={value}>
      <BankEntryBar
        category={category}
        pageKeys={pageKeys}
        accounts={accounts}
        parties={parties}
        expenses={expenses}
        taxes={taxes}
        form={form}
        setForm={setForm}
        error={error}
        pending={pending}
        onSubmit={onSubmit}
        onCategory={(next) => {
          const match = CATEGORIES.find((item) => item.id === next);
          if (!match || match.id === category) return;
          setSelectedCategory(match.id);
          setForm((current) => ({ ...emptyForm(), date: current.date }));
          setError(null);
        }}
      />
      {children}
    </BankEntryContext.Provider>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className ? `bank-entry-field ${className}` : "bank-entry-field"}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function BankEntryBar({
  category,
  pageKeys,
  accounts,
  parties,
  expenses,
  taxes,
  form,
  setForm,
  error,
  pending,
  onSubmit,
  onCategory,
}: {
  category: BankCategory;
  pageKeys: string[] | "all";
  accounts: BankAccountBalanceRow[];
  parties: BankEntryParty[];
  expenses: BankEntryExpense[];
  taxes: BankEntryExpense[];
  form: FormState;
  setForm: (next: FormState | ((prev: FormState) => FormState)) => void;
  error: string | null;
  pending: boolean;
  onSubmit: (event: FormEvent) => void;
  onCategory: (next: BankCategory) => void;
}) {
  const amountDisplay = useMemo(
    () => formatIndianAmountTyping(form.amount),
    [form.amount],
  );
  const categories = CATEGORIES.filter((item) =>
    canAccessPath(pageKeys, item.href),
  );
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
  const slots = slotsFor(category, form.type);
  const showType = category !== "current" && category !== "saving";
  const showParticular = category === "expenses" || category === "taxes";
  const dualBankCategory = category === "current" || category === "saving";

  function onAmount(value: string) {
    const raw = parseAmountInput(value).replace(/[^\d.]/g, "");
    if (raw === "") {
      setForm((current) => ({ ...current, amount: "" }));
      return;
    }
    if (!/^\d*\.?\d{0,2}$/.test(raw)) return;
    setForm((current) => ({ ...current, amount: raw }));
  }

  function receivedCompatibleWithPaid(
    paidAccountId: string,
    receivedAccountId: string,
  ): boolean {
    if (!paidAccountId || !receivedAccountId) return true;
    if (category !== "saving") {
      return !sameAccountName(
        accountNameOf(accounts, paidAccountId),
        accountNameOf(accounts, receivedAccountId),
      );
    }
    return typeof resolveSavingTransfer(
      accounts,
      paidAccountId,
      receivedAccountId,
    ) !== "string";
  }

  function setPaidBank(accountId: string) {
    setForm((current) => {
      if (!dualBankCategory) {
        return { ...current, bankAccountId: accountId };
      }
      const keepReceived = receivedCompatibleWithPaid(
        accountId,
        current.receivedAccountId,
      );
      return {
        ...current,
        paidAccountId: accountId,
        receivedAccountId: keepReceived ? current.receivedAccountId : "",
      };
    });
  }

  function setReceivedBank(accountId: string) {
    setForm((current) => {
      const keepPaid = receivedCompatibleWithPaid(
        current.paidAccountId,
        accountId,
      );
      return {
        ...current,
        receivedAccountId: accountId,
        paidAccountId: keepPaid ? current.paidAccountId : "",
      };
    });
  }

  const selectableAccounts = categoryUsesCurrentOrCcAccounts(category)
    ? filterCurrentOrCcAccounts(accounts)
    : accounts;
  const savingPaidAccounts = filterSavingTransferAccounts(accounts);
  const savingAccounts = filterSavingAccounts(accounts);
  const currentOrCcAccounts = filterCurrentOrCcAccounts(accounts);

  function bankChoices(side: "paid" | "received") {
    if (category === "saving") {
      if (side === "paid") return savingPaidAccounts;
      const paid = accounts.find((account) => account.id === form.paidAccountId);
      if (!paid) return [];
      if (isSavingAccountType(paid.accountTypeName)) return currentOrCcAccounts;
      if (isCurrentOrCcAccountType(paid.accountTypeName)) return savingAccounts;
      return [];
    }
    if (category !== "current") return selectableAccounts;
    const blockedId =
      side === "paid" ? form.receivedAccountId : form.paidAccountId;
    return optionsExceptName(
      selectableAccounts,
      accountNameOf(accounts, blockedId),
    );
  }

  function renderSlot(side: "paid" | "received", kind: SlotKind) {
    if (kind === "none") return null;
    const expenseOrTaxBank =
      (category === "expenses" || category === "taxes") &&
      form.type === "RECEIVED";
    const label =
      side === "paid"
        ? expenseOrTaxBank
          ? "Fund received account"
          : "Fund paid account"
        : "Fund received account";
    if (kind === "wait") {
      return (
        <Field label={label}>
          <select className="field-input" aria-label={label} disabled value="">
            <option value="">Select type first</option>
          </select>
        </Field>
      );
    }
    if (kind === "party") {
      return (
        <Field label={label}>
          <SearchableSelect
            className="field-input"
            ariaLabel={label}
            placeholder="Search customer, transporter, or investment"
            value={form.partyId}
            onChange={(partyId) => setForm((current) => ({ ...current, partyId }))}
            options={partyOptions}
          />
        </Field>
      );
    }
    if (kind === "unallocated") {
      return (
        <Field label={label}>
          <input
            type="text"
            className="field-input"
            aria-label={label}
            placeholder="Unallocated receipt name"
            value={form.receiptName}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                receiptName: e.target.value,
              }))
            }
            onBlur={() =>
              setForm((current) => ({
                ...current,
                receiptName:
                  capitalizeName(current.receiptName) ?? current.receiptName,
              }))
            }
          />
        </Field>
      );
    }
    const value = dualBankCategory
      ? side === "paid"
        ? form.paidAccountId
        : form.receivedAccountId
      : form.bankAccountId;
    const onChange = (accountId: string) => {
      if (dualBankCategory) {
        if (side === "paid") setPaidBank(accountId);
        else setReceivedBank(accountId);
        return;
      }
      setForm((current) => ({ ...current, bankAccountId: accountId }));
    };
    const choices = bankChoices(side);
    const emptyLabel =
      category === "saving" && side === "received" && !form.paidAccountId
        ? "Select fund paid first"
        : "Select account";
    return (
      <Field label={label}>
        <select
          className="field-input"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={
            category === "saving" && side === "received" && !form.paidAccountId
          }
        >
          <option value="">{emptyLabel}</option>
          {choices.map((account) => (
            <option key={account.id} value={account.id}>
              {accountLabel(account.accountName, account.bankName)}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  const addDisabled =
    pending ||
    (category === "current" && selectableAccounts.length < 2) ||
    (category === "expenses" &&
      (selectableAccounts.length < 1 || expenses.length < 1)) ||
    (category === "taxes" &&
      (selectableAccounts.length < 1 || taxes.length < 1)) ||
    ((category === "others" || category === "unallocated") &&
      selectableAccounts.length < 1) ||
    (category === "saving" &&
      (savingAccounts.length < 1 || currentOrCcAccounts.length < 1));

  const showExpenseTaxField =
    category === "expenses" || category === "taxes";
  const expenseTaxFieldBeforeBank =
    showExpenseTaxField && form.type === "RECEIVED";
  const expenseTaxLabel =
    category === "taxes" ? "Government Taxes" : "Expenses";
  const expenseTaxField = showExpenseTaxField ? (
    <Field label={expenseTaxLabel}>
      <select
        className="field-input"
        aria-label={expenseTaxLabel}
        value={form.expenseId}
        onChange={(e) =>
          setForm((current) => ({ ...current, expenseId: e.target.value }))
        }
      >
        <option value="">
          {category === "taxes" ? "Select tax" : "Select expense"}
        </option>
        {(category === "taxes" ? taxes : expenses).map((expense) => (
          <option key={expense.id} value={expense.id}>
            {expense.name}
          </option>
        ))}
      </select>
    </Field>
  ) : null;

  return (
    <form className="bank-entry" onSubmit={onSubmit} noValidate>
      <div className="bank-entry-row">
        <Field label="Category" className="bank-entry-field-category">
          <select
            className="field-input"
            aria-label="Category"
            value={category}
            onChange={(e) => onCategory(e.target.value as BankCategory)}
          >
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date" className="bank-entry-field-date">
          <input
            type="date"
            className="field-input"
            aria-label="Date"
            value={form.date}
            onChange={(e) =>
              setForm((current) => ({ ...current, date: e.target.value }))
            }
          />
        </Field>
        {showType ? (
          <Field label="Type">
            <select
              className="field-input"
              aria-label="Type"
              value={form.type}
              onChange={(e) =>
                setForm((current) => ({ ...current, type: e.target.value }))
              }
            >
              <option value="">Select</option>
              <option value="RECEIVED">Fund Received</option>
              <option value="SENT">Fund Paid</option>
            </select>
          </Field>
        ) : null}
        {expenseTaxFieldBeforeBank ? expenseTaxField : null}
        {renderSlot("paid", slots.paid)}
        {renderSlot("received", slots.received)}
        {!expenseTaxFieldBeforeBank ? expenseTaxField : null}
        <Field label="Amount" className="bank-entry-field-amount">
          <input
            type="text"
            inputMode="decimal"
            className="field-input"
            placeholder="0.00"
            aria-label="Amount"
            value={amountDisplay}
            onChange={(e) => onAmount(e.target.value)}
          />
        </Field>
        {showParticular ? (
          <Field label="Particular" className="bank-entry-field-particular">
            <input
              type="text"
              className="field-input"
              aria-label="Particular"
              placeholder="Transaction details"
              value={form.particular}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  particular: e.target.value,
                }))
              }
              onBlur={() =>
                setForm((current) => ({
                  ...current,
                  particular: toTitleCase(current.particular),
                }))
              }
            />
          </Field>
        ) : null}
        <div className="bank-entry-actions">
          <button type="submit" className="btn" disabled={addDisabled}>
            Add
          </button>
        </div>
      </div>
      {error ? (
        <div className="error-box" role="alert">
          {error}
        </div>
      ) : null}
    </form>
  );
}
