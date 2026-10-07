import Link from "next/link";
import { listBankAccounts } from "@/lib/actions/bankAccounts";
import { LockedLink } from "@/components/LockedLink";
import { getCurrentAccess } from "@/lib/auth/access";
import { canAccessPath } from "@/lib/auth/pages";

export default async function BankStatementIndexPage() {
  const [access, accounts] = await Promise.all([
    getCurrentAccess(),
    listBankAccounts(),
  ]);
  const keys = access.kind === "none" ? [] : access.pageKeys;
  const sorted = [...accounts].sort((a, b) =>
    a.accountName.localeCompare(b.accountName),
  );

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Bank
            <span aria-hidden="true"> · </span>
            Bank Statement
          </p>
          <h1 className="page-title">Bank Statement</h1>
          <p className="page-subtitle">
            Choose a bank account to open its statement.
          </p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="page-subtitle">
          No bank accounts yet. Add them under Masters → Bank.
        </p>
      ) : (
        <div className="home-report-grid">
          {sorted.map((account) => {
            const href = `/reports/bank-statement/${account.id}`;
            const allowed = canAccessPath(keys, href);
            return (
              <LockedLink
                key={account.id}
                href={href}
                allowed={allowed}
                className="home-report-card"
              >
                <h3 className="home-report-card-title">{account.accountName}</h3>
                <p className="home-report-card-desc">{account.bankName}</p>
                <span className="home-report-card-cta">
                  {allowed ? "Open statement" : "No access"}
                </span>
              </LockedLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
