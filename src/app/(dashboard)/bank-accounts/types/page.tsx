import { listBankAccountTypes } from "@/lib/actions/bankAccountTypes";
import { BankAccountTypesClient } from "./BankAccountTypesClient";

export default async function BankAccountTypesPage() {
  const rows = await listBankAccountTypes();
  return <BankAccountTypesClient initial={rows} />;
}
