import { AppNav } from "@/components/AppNav";
import { canVisit, getCurrentAccess, landingPath } from "@/lib/auth/access";
import { listDocumentGroups } from "@/lib/actions/option-lists";
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

  const documentGroups = await listDocumentGroups();

  return (
    <div className="app-shell">
      <AppNav access={access} documentGroups={documentGroups} />
      <main className="app-main">
        <div className="app-main-inner">{children}</div>
      </main>
    </div>
  );
}
