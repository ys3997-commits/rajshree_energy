import { listBankTransfers } from "@/lib/actions/bankTransfers";
import { listBookExpenses } from "@/lib/actions/bookExpenses";
import { listPayments } from "@/lib/actions/payments";
import { listSavingAccountTxns } from "@/lib/actions/savingAccountTxns";
import { listUnallocatedReceiptTxns } from "@/lib/actions/unallocatedReceiptTxns";
import { getCurrentAccess } from "@/lib/auth/access";
import { canAccessPath } from "@/lib/auth/pages";
import { partyKey } from "@/lib/domain/paymentParty";

export type BankRegisterKind =
  | "others"
  | "current"
  | "saving"
  | "unallocated"
  | "expenses";

export type BankRegisterRow = {
  kind: BankRegisterKind;
  id: string;
  date: string;
  amount: string;
  canEdit: boolean;
  canDelete: boolean;
  typeLabel: string;
  fundPaid: string;
  fundReceived: string;
  particular: string;
  direction: string;
  expenseId: string;
  bankAccountId: string;
  paidAccountId: string;
  receivedAccountId: string;
  partyId: string;
  savingName: string;
  receiptName: string;
};

const KIND_ORDER: BankRegisterKind[] = [
  "others",
  "current",
  "saving",
  "unallocated",
  "expenses",
];

const KIND_PATH: Record<BankRegisterKind, string> = {
  others: "/payments",
  current: "/payments/transaction",
  saving: "/payments/txn-saving",
  unallocated: "/payments/unallocated-receipt",
  expenses: "/payments/book-expenses",
};

function accountText(name: string | null | undefined, bank?: string | null) {
  if (!name) return "—";
  return bank ? `${name} (${bank})` : name;
}

function partyText(
  name: string,
  transporterId: string | null,
  investmentCompanyId: string | null,
) {
  if (!name) return "—";
  if (transporterId) return `${name} — Transporter`;
  if (investmentCompanyId) return `${name} — Investment`;
  return name;
}

function partyIdOf(row: {
  customerId: string | null;
  transporterId: string | null;
  investmentCompanyId: string | null;
}) {
  if (row.transporterId) return partyKey("transporter", row.transporterId);
  if (row.investmentCompanyId) {
    return partyKey("investment", row.investmentCompanyId);
  }
  if (row.customerId) return partyKey("customer", row.customerId);
  return "";
}

function compareRows(left: BankRegisterRow, right: BankRegisterRow) {
  if (left.date !== right.date) return left.date < right.date ? 1 : -1;
  const order =
    KIND_ORDER.indexOf(left.kind) - KIND_ORDER.indexOf(right.kind);
  if (order !== 0) return order;
  return left.id < right.id ? 1 : -1;
}

export async function loadBankRegister(): Promise<{
  rows: BankRegisterRow[];
  kinds: BankRegisterKind[];
}> {
  const access = await getCurrentAccess();
  if (access.kind === "none") return { rows: [], kinds: [] };

  const kinds = KIND_ORDER.filter((kind) =>
    canAccessPath(access.pageKeys, KIND_PATH[kind]),
  );
  const groups = await Promise.all(
    kinds.map(async (kind): Promise<BankRegisterRow[]> => {
      if (kind === "others") {
        const list = await listPayments({ all: true });
        return list.rows.map((row) => {
          const party = partyText(
            row.customerName,
            row.transporterId,
            row.investmentCompanyId,
          );
          const account = accountText(row.accountName, row.bankName);
          const received = row.direction === "RECEIVED";
          return {
            kind,
            id: row.id,
            date: row.date,
            amount: row.amount,
            canEdit: row.canEdit,
            canDelete: row.canDelete,
            typeLabel: received ? "Fund Received" : "Fund Paid",
            fundPaid: received ? party : account,
            fundReceived: received ? account : party,
            particular: "",
            direction: row.direction,
            expenseId: "",
            bankAccountId: row.bankAccountId ?? "",
            paidAccountId: "",
            receivedAccountId: "",
            partyId: partyIdOf(row),
            savingName: "",
            receiptName: "",
          };
        });
      }
      if (kind === "current") {
        const rows = await listBankTransfers();
        return rows.map((row) => ({
          kind,
          id: row.id,
          date: row.date,
          amount: row.amount,
          canEdit: row.canEdit,
          canDelete: row.canDelete,
          typeLabel: "Transfer",
          fundPaid: row.paidAccountName,
          fundReceived: row.receivedAccountName,
          particular: "",
          direction: "",
          expenseId: "",
          bankAccountId: "",
          paidAccountId: row.paidAccountId,
          receivedAccountId: row.receivedAccountId,
          partyId: "",
          savingName: "",
          receiptName: "",
        }));
      }
      if (kind === "saving") {
        const list = await listSavingAccountTxns({ all: true });
        return list.rows.map((row) => {
          const account = accountText(row.accountName, row.bankName);
          const received = row.direction === "RECEIVED";
          return {
            kind,
            id: row.id,
            date: row.date,
            amount: row.amount,
            canEdit: row.canEdit,
            canDelete: row.canDelete,
            typeLabel: received ? "Fund Received" : "Fund Paid",
            fundPaid: received ? row.savingAccountName : account,
            fundReceived: received ? account : row.savingAccountName,
            particular: "",
            direction: row.direction,
            expenseId: "",
            bankAccountId: row.bankAccountId ?? "",
            paidAccountId: "",
            receivedAccountId: "",
            partyId: "",
            savingName: row.savingAccountName,
            receiptName: "",
          };
        });
      }
      if (kind === "unallocated") {
        const list = await listUnallocatedReceiptTxns({ all: true });
        return list.rows.map((row) => {
          const account = accountText(row.accountName, row.bankName);
          const received = row.direction === "RECEIVED";
          return {
            kind,
            id: row.id,
            date: row.date,
            amount: row.amount,
            canEdit: row.canEdit,
            canDelete: row.canDelete,
            typeLabel: received ? "Fund Received" : "Fund Paid",
            fundPaid: received ? row.receiptName : account,
            fundReceived: received ? account : row.receiptName,
            particular: "",
            direction: row.direction,
            expenseId: "",
            bankAccountId: row.bankAccountId ?? "",
            paidAccountId: "",
            receivedAccountId: "",
            partyId: "",
            savingName: "",
            receiptName: row.receiptName,
          };
        });
      }
      const rows = await listBookExpenses();
      return rows.map((row) => {
        const received = row.direction === "RECEIVED";
        const account = row.paidAccountName;
        const expense = row.indirectExpenseName;
        return {
          kind,
          id: row.id,
          date: row.date,
          amount: row.amount,
          canEdit: row.canEdit,
          canDelete: row.canDelete,
          typeLabel: received ? "Fund Received" : "Fund Paid",
          fundPaid: received ? expense : account,
          fundReceived: received ? account : expense,
          particular: row.particular,
          direction: row.direction,
          expenseId: row.indirectExpenseId,
          bankAccountId: row.paidAccountId,
          paidAccountId: row.paidAccountId,
          receivedAccountId: "",
          partyId: "",
          savingName: "",
          receiptName: "",
        };
      });
    }),
  );

  return {
    rows: groups.flat().sort(compareRows),
    kinds,
  };
}
