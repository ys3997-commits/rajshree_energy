import { notFound } from "next/navigation";
import { getBankStatement } from "@/lib/actions/bankStatement";
import { requirePage } from "@/lib/auth/access";
import { BankStatementClient } from "./BankStatementClient";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function BankStatementAccountPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requirePage("reports-bank-statement");
  const { id } = await params;
  const sp = await searchParams;
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";

  const statement = await getBankStatement(id, { dateFrom, dateTo });
  if (!statement) notFound();

  return (
    <BankStatementClient
      accountId={statement.account.id}
      accountName={statement.account.accountName}
      bankName={statement.account.bankName}
      dateFrom={dateFrom}
      dateTo={dateTo}
      openingBalance={statement.openingBalance}
      closingBalance={statement.closingBalance}
      totalDebit={statement.totalDebit}
      totalCredit={statement.totalCredit}
      rows={statement.rows}
    />
  );
}
