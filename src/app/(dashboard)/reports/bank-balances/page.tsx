import Link from "next/link";
import { requirePage } from "@/lib/auth/access";
import { listBankAccountBalances } from "@/lib/actions/bankAccounts";
import { BankBalancesClient } from "./BankBalancesClient";

export default async function BankBalancesPage() {
  await requirePage("reports-bank-balances");
  const rows = await listBankAccountBalances();

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Bank
            <span aria-hidden="true"> · </span>
            Bank Balances
          </p>
          <h1 className="page-title">Bank Balances</h1>
          <p className="page-subtitle">
            Current balance for each bank account (opening + received − paid).
          </p>
        </div>
      </div>

      <BankBalancesClient initialRows={rows} />
    </div>
  );
}
