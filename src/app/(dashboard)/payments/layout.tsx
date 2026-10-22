import { getCurrentAccess } from "@/lib/auth/access";
import { BankTabs } from "./BankTabs";

export default async function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getCurrentAccess();
  if (access.kind === "none") return children;

  return (
    <>
      <BankTabs pageKeys={access.pageKeys} />
      {children}
    </>
  );
}
