import { listBankAccountBalances } from "@/lib/actions/bankAccounts";
import { listBankTransfers } from "@/lib/actions/bankTransfers";
import { TransactionClient } from "./TransactionClient";

export default async function BankTransactionPage() {
  const [accounts, rows] = await Promise.all([
    listBankAccountBalances(),
    listBankTransfers(),
  ]);

  return <TransactionClient accounts={accounts} initial={rows} />;
}
