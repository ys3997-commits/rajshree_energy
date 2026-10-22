import { listBankAccountBalances } from "@/lib/actions/bankAccounts";
import { listBookExpenses } from "@/lib/actions/bookExpenses";
import { listIndirectExpenseOptions } from "@/lib/actions/option-lists";
import { BookExpensesClient } from "./BookExpensesClient";

export default async function BookExpensesPage() {
  const [accounts, expenses, rows] = await Promise.all([
    listBankAccountBalances(),
    listIndirectExpenseOptions(),
    listBookExpenses(),
  ]);

  return (
    <BookExpensesClient
      accounts={accounts}
      expenses={expenses.map((row) => ({ id: row.id, name: row.name }))}
      initial={rows}
    />
  );
}
