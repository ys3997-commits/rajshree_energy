import { listBankAccounts } from "@/lib/actions/bankAccounts";
import { BankAccountsClient } from "./BankAccountsClient";

export default async function BankAccountsPage() {
  const rows = await listBankAccounts();
  return <BankAccountsClient initial={rows} />;
}
