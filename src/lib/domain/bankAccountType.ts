/** True for Current A/c / CC A/c type names (and common variants). */
export function isCurrentOrCcAccountType(
  typeName: string | null | undefined,
): boolean {
  const key = (typeName ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!key) return false;
  if (key === "cc" || key.startsWith("cc")) return true;
  if (key.startsWith("current")) return true;
  return false;
}

/** True for Saving A/c type names (and common variants). */
export function isSavingAccountType(
  typeName: string | null | undefined,
): boolean {
  const key = (typeName ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!key) return false;
  return key.startsWith("saving");
}

export function filterCurrentOrCcAccounts<
  T extends { accountTypeName: string | null },
>(accounts: T[]): T[] {
  return accounts.filter((account) =>
    isCurrentOrCcAccountType(account.accountTypeName),
  );
}

export function filterSavingAccounts<
  T extends { accountTypeName: string | null },
>(accounts: T[]): T[] {
  return accounts.filter((account) =>
    isSavingAccountType(account.accountTypeName),
  );
}

export function filterSavingTransferAccounts<
  T extends { accountTypeName: string | null },
>(accounts: T[]): T[] {
  return accounts.filter(
    (account) =>
      isSavingAccountType(account.accountTypeName) ||
      isCurrentOrCcAccountType(account.accountTypeName),
  );
}

/** Bank categories whose account pickers are limited to Current A/c and CC A/c. */
export function categoryUsesCurrentOrCcAccounts(category: string): boolean {
  return (
    category === "others" ||
    category === "current" ||
    category === "unallocated" ||
    category === "expenses" ||
    category === "taxes"
  );
}
