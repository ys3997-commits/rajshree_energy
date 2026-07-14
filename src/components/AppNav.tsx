"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

const links = [
  { href: "/", label: "Home" },
  { href: "/orders", label: "Sale orders" },
  { href: "/purchase-orders", label: "Purchase orders" },
  { href: "/dispatches", label: "Dispatches" },
  // { href: "/receipts/pending", label: "Receipts" },
  // { href: "/reconciliation", label: "Reconciliation" },
  { href: "/vessels", label: "Vessels" },
  { href: "/customers", label: "Customers" },
  { href: "/transporters", label: "Transporters" },
  { href: "/staff", label: "People" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="flex min-w-0 flex-1 items-center gap-8">
          {/* <Link href="/orders" className="brand-logo" aria-label="Rajshree home">
            <Image
              src="/logo.png"
              alt="Rajshree"
              width={160}
              height={40}
              priority
              className="brand-logo-img"
            />
          </Link> */}
          <nav className="app-nav">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={active ? "active" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
