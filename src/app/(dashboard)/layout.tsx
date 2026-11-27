import { AppNav } from "@/components/AppNav";
import { listBankAccountsForNav } from "@/lib/actions/bankAccounts";
import { countPendingCorrections } from "@/lib/actions/corrections";
import { canVisit, getCurrentAccess, landingPath } from "@/lib/auth/access";
import { canAccessPath } from "@/lib/auth/pages";
import { hasFullPower } from "@/lib/auth/fullPower";
import { listDocumentGroups } from "@/lib/actions/option-lists";
import { memoize } from "@/lib/memoryCache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") || "/";
  const access = await getCurrentAccess();
  if (access.kind === "none") redirect("/login");
  if (!canVisit(access, pathname)) {
    redirect(landingPath(access));
  }

  const pageKeys = hasFullPower(access) ? "all" : access.pageKeys;
  const canOpenCorrections = canAccessPath(pageKeys, "/corrections");

  const [documentGroups, bankAccounts, pendingCorrections] = await Promise.all([
    memoize("nav:document-groups", 20_000, () => listDocumentGroups()),
    listBankAccountsForNav(),
    canOpenCorrections
      ? memoize("nav:pending-corrections", 15_000, () =>
          countPendingCorrections(),
        )
      : Promise.resolve(0),
  ]);

  return (
    <div className="app-shell">
      <AppNav
        access={access}
        documentGroups={documentGroups}
        bankAccounts={bankAccounts}
        pendingCorrections={pendingCorrections}
      />
      <main className="app-main">
        <div className="app-main-inner">{children}</div>
      </main>
    </div>
  );
}
