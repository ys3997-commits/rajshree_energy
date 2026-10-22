import { listBankAccounts } from "@/lib/actions/bankAccounts";
import { listBankAccountTypes } from "@/lib/actions/bankAccountTypes";
import { BankAccountsClient } from "./BankAccountsClient";

export default async function BankAccountsPage() {
  const [rows, accountTypes] = await Promise.all([
    listBankAccounts(),
    listBankAccountTypes(),
  ]);
  return <BankAccountsClient initial={rows} accountTypes={accountTypes} />;
}
