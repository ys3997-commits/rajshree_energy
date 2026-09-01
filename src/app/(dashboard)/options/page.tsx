import { getCurrentAccess, landingPath } from "@/lib/auth/access";
import { canAccessPath, MASTER_OPTIONS_SUB_PAGES } from "@/lib/auth/pages";
import { redirect } from "next/navigation";
import { OPTION_CATEGORIES } from "./optionsCategories";

export default async function OptionsPage() {
  const access = await getCurrentAccess();
  if (access.kind === "staff") {
    const firstAllowed = MASTER_OPTIONS_SUB_PAGES.find((page) =>
      canAccessPath(access.pageKeys, page.href),
    );
    if (firstAllowed) redirect(firstAllowed.href);
    redirect(landingPath(access));
  }

  redirect(`/options/${OPTION_CATEGORIES[0].slug}`);
}
