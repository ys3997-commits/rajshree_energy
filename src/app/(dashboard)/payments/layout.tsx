import { listBankAccountBalances } from "@/lib/actions/bankAccounts";
import {
  listGovernmentTaxOptions,
  listIndirectExpenseOptions,
} from "@/lib/actions/option-lists";
import { getCurrentAccess } from "@/lib/auth/access";
import { BankEntryProvider } from "./BankEntryForm";
import { loadFundFlowParties } from "./fundFlowParties";

export default async function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getCurrentAccess();
  if (access.kind === "none") return children;

  const [accounts, parties, expenses, taxes] = await Promise.all([
    listBankAccountBalances(),
    loadFundFlowParties(),
    listIndirectExpenseOptions(),
    listGovernmentTaxOptions(),
  ]);

  return (
    <BankEntryProvider
      pageKeys={access.pageKeys}
      accounts={accounts}
      parties={parties}
      expenses={expenses.map((row) => ({ id: row.id, name: row.name }))}
      taxes={taxes.map((row) => ({ id: row.id, name: row.name }))}
    >
      {children}
    </BankEntryProvider>
  );
}
