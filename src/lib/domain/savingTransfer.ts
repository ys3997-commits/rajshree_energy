import {
  isCurrentOrCcAccountType,
  isSavingAccountType,
} from "@/lib/domain/bankAccountType";
import { formatBankAccountLabel } from "@/lib/domain/format";

type AccountLike = {
  id: string;
  accountName: string;
  bankName: string;
  accountTypeName: string | null;
};

export type ResolvedSavingTransfer = {
  bankAccountId: string;
  direction: "RECEIVED" | "SENT";
  savingName: string;
};

/** Map dual-account picks to the stored Saving A/c txn shape. */
export function resolveSavingTransfer(
  accounts: AccountLike[],
  paidAccountId: string,
  receivedAccountId: string,
): ResolvedSavingTransfer | string {
  const paid = accounts.find((account) => account.id === paidAccountId);
  const received = accounts.find((account) => account.id === receivedAccountId);
  if (!paid || !received) return "Select fund paid and fund received accounts";

  const paidSaving = isSavingAccountType(paid.accountTypeName);
  const paidCurrent = isCurrentOrCcAccountType(paid.accountTypeName);
  const receivedSaving = isSavingAccountType(received.accountTypeName);
  const receivedCurrent = isCurrentOrCcAccountType(received.accountTypeName);

  if (paidSaving && receivedCurrent) {
    return {
      bankAccountId: received.id,
      direction: "RECEIVED",
      savingName: formatBankAccountLabel(paid.accountName, paid.bankName),
    };
  }
  if (paidCurrent && receivedSaving) {
    return {
      bankAccountId: paid.id,
      direction: "SENT",
      savingName: formatBankAccountLabel(
        received.accountName,
        received.bankName,
      ),
    };
  }
  return "Select one Saving A/c and one Current A/c or CC A/c";
}

/** Match a stored saving name / label back to a bank account id. */
export function findAccountIdByLabel(
  accounts: AccountLike[],
  label: string,
): string {
  const trimmed = label.trim().toLowerCase();
  if (!trimmed) return "";
  const byLabel = accounts.find(
    (account) =>
      formatBankAccountLabel(account.accountName, account.bankName)
        .toLowerCase() === trimmed,
  );
  if (byLabel) return byLabel.id;
  const byName = accounts.find(
    (account) => account.accountName.trim().toLowerCase() === trimmed,
  );
  return byName?.id ?? "";
}
