"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

const links = [
  { href: "/", label: "Home" },
  { href: "/orders", label: "Sale orders" },
  { href: "/purchase-orders", label: "Purchase orders" },
  { href: "/dispatches", label: "Dispatches" },
  { href: "/payments", label: "Payments" },
  // { href: "/receipts/pending", label: "Receipts" },
  // { href: "/reconciliation", label: "Reconciliation" },
  { href: "/vessels", label: "Vessels" },
  { href: "/qualities", label: "Qualities" },
  { href: "/customers", label: "Customers" },
  { href: "/transporters", label: "Transporters" },
  { href: "/options", label: "Options" },
];

type ReportLeaf = { href: string; label: string };
type ReportGroup = { label: string; children: ReportLeaf[] };
type ReportItem = ReportLeaf | ReportGroup;

function isReportGroup(item: ReportItem): item is ReportGroup {
  return "children" in item;
}

/** Sorted alphabetically by label. */
const reportLinks: ReportItem[] = [
  {
    label: "Collection",
    children: [
      { href: "/reports/collection", label: "Collection" },
      { href: "/reports/collection/vendor", label: "Vendor Collection" },
    ],
  },
  {
    label: "Analysis",
    children: [
      { href: "/reports/ageing-report", label: "Ageing Report" },
      { href: "/reports/customer-analysis", label: "Customer Analysis" },
      { href: "/reports/profit-analysis", label: "Profit Analysis" },
      { href: "/reports/analysis", label: "Sale Analysis" },
      { href: "/reports/vendor-analysis", label: "Vendor Analysis" },
    ],
  },
  {
    label: "Customer",
    children: [
      { href: "/reports/ledger", label: "Ledger" },
    ],
  },
  { href: "/reports/master-dispatch", label: "Dispatch" },
  {
    label: "Product",
    children: [
      { href: "/reports/product", label: "Quality Report" },
    ],
  },
  { href: "/reports/purchase", label: "Purchase" },
  {
    label: "Sales",
    children: [{ href: "/reports/sales", label: "Sales Engine Report" }],
  },
  {
    label: "Transport",
    children: [
      { href: "/reports/transport", label: "Transport Engine Report" },
      { href: "/reports/transport/due", label: "Transport Due" },
    ],
  },
  {
    label: "Vessel",
    children: [
      { href: "/reports/vessel", label: "Vessel Report" },
      { href: "/reports/vessel/supplied", label: "Vessel Supplied" },
    ],
  },
].sort((a, b) => a.label.localeCompare(b.label));

function isActivePath(pathname: string, href: string, exact = false) {
  if (href === "/") return pathname === "/";
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isGroupActive(pathname: string, group: ReportGroup) {
  return group.children.some((child) =>
    isActivePath(pathname, child.href, needsExactChildMatch(group, child.href)),
  );
}

function needsExactChildMatch(group: ReportGroup, href: string) {
  return group.children.some(
    (other) => other.href !== href && other.href.startsWith(`${href}/`),
  );
}

export function AppNav() {
  const pathname = usePathname();
  const [reportOpen, setReportOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const reportMenuId = useId();
  const reportRef = useRef<HTMLDivElement>(null);
  const reportActive =
    pathname === "/reports" || pathname.startsWith("/reports/");

  useEffect(() => {
    setReportOpen(false);
    setOpenSubmenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!reportOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (
        reportRef.current &&
        !reportRef.current.contains(event.target as Node)
      ) {
        setReportOpen(false);
        setOpenSubmenu(null);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (openSubmenu) {
          setOpenSubmenu(null);
          return;
        }
        setReportOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [reportOpen, openSubmenu]);

  const optionsIndex = links.findIndex((link) => link.href === "/options");
  const beforeOptions = links.slice(0, optionsIndex);
  const afterReport = links.slice(optionsIndex);

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="flex min-w-0 flex-1 items-center gap-8">
          <nav className="app-nav">
            {beforeOptions.map((link) => {
              const active = isActivePath(pathname, link.href);
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

            <div
              className={`nav-dropdown${reportOpen ? " open" : ""}${reportActive ? " active" : ""}`}
              ref={reportRef}
            >
              <button
                type="button"
                className={`nav-dropdown-trigger${reportActive ? " active" : ""}`}
                aria-expanded={reportOpen}
                aria-controls={reportMenuId}
                aria-haspopup="menu"
                onClick={() => setReportOpen((open) => !open)}
              >
                Report
                <span className="nav-dropdown-caret" aria-hidden="true" />
              </button>
              <div
                id={reportMenuId}
                className="nav-dropdown-menu"
                role="menu"
                hidden={!reportOpen}
              >
                {reportLinks.map((item) => {
                  if (isReportGroup(item)) {
                    const submenuOpen = openSubmenu === item.label;
                    const groupActive = isGroupActive(pathname, item);
                    const submenuId = `${reportMenuId}-${item.label.toLowerCase()}`;
                    return (
                      <div
                        key={item.label}
                        className={`nav-submenu${submenuOpen ? " open" : ""}${groupActive ? " active" : ""}`}
                      >
                        <button
                          type="button"
                          className={`nav-submenu-trigger${groupActive ? " active" : ""}`}
                          aria-expanded={submenuOpen}
                          aria-controls={submenuId}
                          aria-haspopup="menu"
                          onClick={() =>
                            setOpenSubmenu((current) =>
                              current === item.label ? null : item.label,
                            )
                          }
                          onMouseEnter={() => setOpenSubmenu(item.label)}
                        >
                          {item.label}
                          <span className="nav-submenu-caret" aria-hidden="true" />
                        </button>
                        <div
                          id={submenuId}
                          className="nav-submenu-menu"
                          role="menu"
                          hidden={!submenuOpen}
                          onMouseEnter={() => setOpenSubmenu(item.label)}
                        >
                          {item.children.map((child) => {
                            const active = isActivePath(
                              pathname,
                              child.href,
                              needsExactChildMatch(item, child.href),
                            );
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                role="menuitem"
                                className={active ? "active" : undefined}
                                onClick={() => {
                                  setOpenSubmenu(null);
                                  setReportOpen(false);
                                }}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  const active = isActivePath(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className={active ? "active" : undefined}
                      onClick={() => {
                        setOpenSubmenu(null);
                        setReportOpen(false);
                      }}
                      onMouseEnter={() => setOpenSubmenu(null)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {afterReport.map((link) => {
              const active = isActivePath(pathname, link.href);
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
