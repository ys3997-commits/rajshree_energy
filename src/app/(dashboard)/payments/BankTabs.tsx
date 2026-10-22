"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BANK_SUB_PAGES, canAccessPath } from "@/lib/auth/pages";

export function BankTabs({
  pageKeys,
}: {
  pageKeys: string[] | "all";
}) {
  const pathname = usePathname();
  const tabs = BANK_SUB_PAGES.filter((page) =>
    canAccessPath(pageKeys, page.href),
  );

  if (tabs.length === 0) return null;

  function isActive(href: string) {
    if (href === "/payments") return pathname === "/payments";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="ca-tabs" role="tablist" aria-label="Bank">
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.key}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={active ? "ca-tab ca-tab-active" : "ca-tab"}
            prefetch={false}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
