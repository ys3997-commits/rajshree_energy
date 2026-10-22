import { listBankAccountBalances } from "@/lib/actions/bankAccounts";
import { listSavingAccountTxns } from "@/lib/actions/savingAccountTxns";
import { parseFundFlowType } from "../paymentsHref";
import { TxnSavingClient } from "./TxnSavingClient";

type SearchParams = Promise<{
  page?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  account?: string;
}>;

export default async function TxnSavingAccountPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";
  const type = parseFundFlowType(sp.type);
  const account = sp.account?.trim() || "";
  const listFilter = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    type: type || undefined,
    account: account || undefined,
  };

  const [accounts, payments, exportPayments] = await Promise.all([
    listBankAccountBalances(),
    listSavingAccountTxns({ page, ...listFilter }),
    listSavingAccountTxns({ all: true, ...listFilter }),
  ]);

  return (
    <TxnSavingClient
      initial={payments}
      exportRows={exportPayments.rows}
      accounts={accounts}
      dateFrom={dateFrom}
      dateTo={dateTo}
      type={type}
      account={account}
    />
  );
}
