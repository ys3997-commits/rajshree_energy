import { listBankAccountBalances } from "@/lib/actions/bankAccounts";
import { listIndirectExpenseOptions } from "@/lib/actions/option-lists";
import { BankRegisterClient } from "./BankRegisterClient";
import { loadBankRegister } from "./bankRegisterData";
import { loadFundFlowParties } from "./fundFlowParties";

export async function BankRegister() {
  const [register, accounts, parties, expenses] = await Promise.all([
    loadBankRegister(),
    listBankAccountBalances(),
    loadFundFlowParties(),
    listIndirectExpenseOptions(),
  ]);

  return (
    <BankRegisterClient
      rows={register.rows}
      kinds={register.kinds}
      accounts={accounts}
      parties={parties}
      expenses={expenses.map((row) => ({ id: row.id, name: row.name }))}
    />
  );
}
