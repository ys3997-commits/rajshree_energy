"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Access } from "@/lib/auth/types";
import { canAccessPath } from "@/lib/auth/pages";
import { LockedLink } from "@/components/LockedLink";
import { LogoutButton } from "@/components/LogoutButton";

type NavLeaf = { href: string; label: string };

const leadingLinks = [{ href: "/", label: "Home" }];

const ordersLinks: NavLeaf[] = [
  { href: "/purchase-orders", label: "Purchase orders" },
  { href: "/orders", label: "Sale orders" },
];

const links = [
  { href: "/dispatches", label: "Dispatches" },
  { href: "/payments", label: "Bank" },
  { href: "/bills", label: "Approvals" },
];

const mastersLinks: NavLeaf[] = [
  { href: "/customers", label: "Customers" },
  { href: "/options", label: "Options" },
  { href: "/qualities", label: "Qualities" },
  { href: "/transporters", label: "Transporters" },
  { href: "/vessels", label: "Vessels" },
];

type ReportLeaf = NavLeaf;
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
      { href: "/reports/collection", label: "Collection Engine" },
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

const updateLinks: ReportLeaf[] = [
  { href: "/update/purchase", label: "Purchases" },
  { href: "/update/sale", label: "Sales" },
  { href: "/update/transport", label: "Transport" },
];

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

function isMastersActive(pathname: string) {
  return mastersLinks.some((item) => isActivePath(pathname, item.href));
}

function isOrdersActive(pathname: string) {
  return ordersLinks.some((item) => isActivePath(pathname, item.href));
}

export function AppNav({ access }: { access: Exclude<Access, { kind: "none" }> }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [mastersOpen, setMastersOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const reportMenuId = useId();
  const updateMenuId = useId();
  const ordersMenuId = useId();
  const mastersMenuId = useId();
  const reportRef = useRef<HTMLDivElement>(null);
  const updateRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<HTMLDivElement>(null);
  const mastersRef = useRef<HTMLDivElement>(null);
  const reportActive =
    pathname === "/reports" || pathname.startsWith("/reports/");
  const updateActive =
    pathname === "/update" || pathname.startsWith("/update/");
  const ordersActive = isOrdersActive(pathname);
  const mastersActive = isMastersActive(pathname);
  const allowed = (href: string) => canAccessPath(access.pageKeys, href);

  useEffect(() => {
    setMobileNavOpen(false);
    setReportOpen(false);
    setUpdateOpen(false);
    setOrdersOpen(false);
    setMastersOpen(false);
    setOpenSubmenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!updateOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (
        updateRef.current &&
        !updateRef.current.contains(event.target as Node)
      ) {
        setUpdateOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUpdateOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [updateOpen]);

  useEffect(() => {
    if (!ordersOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (
        ordersRef.current &&
        !ordersRef.current.contains(event.target as Node)
      ) {
        setOrdersOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOrdersOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ordersOpen]);

  useEffect(() => {
    if (!mastersOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (
        mastersRef.current &&
        !mastersRef.current.contains(event.target as Node)
      ) {
        setMastersOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMastersOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mastersOpen]);

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

  const bankIndex = links.findIndex((link) => link.href === "/payments");
  const beforeUpdate = links.slice(0, bankIndex);
  const afterUpdate = links.slice(bankIndex);

  return (
    <header className={`app-header${mobileNavOpen ? " nav-open" : ""}`}>
      <div className="app-header-inner">
        <button
          type="button"
          className="app-nav-toggle"
          aria-expanded={mobileNavOpen}
          aria-controls="app-nav"
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          <span className="sr-only">
            {mobileNavOpen ? "Close menu" : "Open menu"}
          </span>
          <span className="app-nav-toggle-icon" aria-hidden="true" />
        </button>
        <div className="app-header-nav-wrap">
          <nav
            id="app-nav"
            className={`app-nav${mobileNavOpen ? " is-open" : ""}`}
          >
            {leadingLinks.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <LockedLink
                  key={link.href}
                  href={link.href}
                  allowed={allowed(link.href)}
                  className={active ? "active" : undefined}
                >
                  {link.label}
                </LockedLink>
              );
            })}

            <div
              className={`nav-dropdown${ordersOpen ? " open" : ""}${ordersActive ? " active" : ""}`}
              ref={ordersRef}
            >
              <button
                type="button"
                className={`nav-dropdown-trigger${ordersActive ? " active" : ""}`}
                aria-expanded={ordersOpen}
                aria-controls={ordersMenuId}
                aria-haspopup="menu"
                onClick={() => setOrdersOpen((open) => !open)}
              >
                Orders
                <span className="nav-dropdown-caret" aria-hidden="true" />
              </button>
              <div
                id={ordersMenuId}
                className="nav-dropdown-menu"
                role="menu"
                hidden={!ordersOpen}
              >
                {ordersLinks.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <LockedLink
                      key={item.href}
                      href={item.href}
                      allowed={allowed(item.href)}
                      role="menuitem"
                      className={active ? "active" : undefined}
                      onClick={() => setOrdersOpen(false)}
                    >
                      {item.label}
                    </LockedLink>
                  );
                })}
              </div>
            </div>

            {beforeUpdate.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <LockedLink
                  key={link.href}
                  href={link.href}
                  allowed={allowed(link.href)}
                  className={active ? "active" : undefined}
                >
                  {link.label}
                </LockedLink>
              );
            })}

            <div
              className={`nav-dropdown${updateOpen ? " open" : ""}${updateActive ? " active" : ""}`}
              ref={updateRef}
            >
              <button
                type="button"
                className={`nav-dropdown-trigger${updateActive ? " active" : ""}`}
                aria-expanded={updateOpen}
                aria-controls={updateMenuId}
                aria-haspopup="menu"
                onClick={() => setUpdateOpen((open) => !open)}
              >
                Update
                <span className="nav-dropdown-caret" aria-hidden="true" />
              </button>
              <div
                id={updateMenuId}
                className="nav-dropdown-menu"
                role="menu"
                hidden={!updateOpen}
              >
                {updateLinks.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <LockedLink
                      key={item.href}
                      href={item.href}
                      allowed={allowed(item.href)}
                      role="menuitem"
                      className={active ? "active" : undefined}
                      onClick={() => setUpdateOpen(false)}
                    >
                      {item.label}
                    </LockedLink>
                  );
                })}
              </div>
            </div>

            {afterUpdate.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <LockedLink
                  key={link.href}
                  href={link.href}
                  allowed={allowed(link.href)}
                  className={active ? "active" : undefined}
                >
                  {link.label}
                </LockedLink>
              );
            })}

            <div
              className={`nav-dropdown${mastersOpen ? " open" : ""}${mastersActive ? " active" : ""}`}
              ref={mastersRef}
            >
              <button
                type="button"
                className={`nav-dropdown-trigger${mastersActive ? " active" : ""}`}
                aria-expanded={mastersOpen}
                aria-controls={mastersMenuId}
                aria-haspopup="menu"
                onClick={() => setMastersOpen((open) => !open)}
              >
                Masters
                <span className="nav-dropdown-caret" aria-hidden="true" />
              </button>
              <div
                id={mastersMenuId}
                className="nav-dropdown-menu"
                role="menu"
                hidden={!mastersOpen}
              >
                {mastersLinks.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <LockedLink
                      key={item.href}
                      href={item.href}
                      allowed={allowed(item.href)}
                      role="menuitem"
                      className={active ? "active" : undefined}
                      onClick={() => setMastersOpen(false)}
                    >
                      {item.label}
                    </LockedLink>
                  );
                })}
              </div>
            </div>

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
                              <LockedLink
                                key={child.href}
                                href={child.href}
                                allowed={allowed(child.href)}
                                role="menuitem"
                                className={active ? "active" : undefined}
                                onClick={() => {
                                  setOpenSubmenu(null);
                                  setReportOpen(false);
                                }}
                              >
                                {child.label}
                              </LockedLink>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  const active = isActivePath(pathname, item.href);
                  return (
                    <LockedLink
                      key={item.href}
                      href={item.href}
                      allowed={allowed(item.href)}
                      role="menuitem"
                      className={active ? "active" : undefined}
                      onClick={() => {
                        setOpenSubmenu(null);
                        setReportOpen(false);
                      }}
                      onMouseEnter={() => setOpenSubmenu(null)}
                    >
                      {item.label}
                    </LockedLink>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
        <div className="app-header-user">
          <span className="app-header-who">{access.name}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
