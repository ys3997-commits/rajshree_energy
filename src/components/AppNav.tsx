"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Access } from "@/lib/auth/types";
import { canAccessPath, hasAnyBankPageAccess, hasAnyUpdatePageAccess } from "@/lib/auth/pages";
import { LockedLink } from "@/components/LockedLink";
import { LogoutButton } from "@/components/LogoutButton";
import {
  OPTION_CATEGORIES,
  optionsHref,
  USER_MENU_CATEGORIES,
  USER_MENU_CATEGORY_IDS,
} from "@/app/(dashboard)/options/optionsCategories";

type NavLeaf = { href: string; label: string };

const leadingLinks = [{ href: "/", label: "Home" }];

const ordersLinks: NavLeaf[] = [
  { href: "/purchase-orders", label: "Purchase orders" },
  { href: "/orders", label: "Sale orders" },
];

const bankLinks: NavLeaf[] = [
  { href: "/payments", label: "Transactions" },
  { href: "/payments/discount", label: "Discount" },
];

const userMenuCategoryIdSet = new Set<string>(USER_MENU_CATEGORY_IDS);

const optionsLinks: NavLeaf[] = OPTION_CATEGORIES.filter(
  (category) => !userMenuCategoryIdSet.has(category.id),
).map((category) => ({
  href: optionsHref(category.id),
  label: category.label,
}));

const usersLinks: NavLeaf[] = USER_MENU_CATEGORIES.map((category) => ({
  href: optionsHref(category.id),
  label: category.label,
}));

const links = [
  { href: "/dispatches", label: "Dispatches" },
  { href: "/bills", label: "Approvals" },
];

const mastersLinks: (NavLeaf | { label: string; children: NavLeaf[] })[] = [
  { href: "/customers", label: "Customers" },
  {
    label: "Options",
    children: optionsLinks,
  },
  { href: "/qualities", label: "Qualities" },
  { href: "/transporters", label: "Transporters" },
  { href: "/vessels", label: "Vessels" },
];

type MastersGroup = { label: string; children: NavLeaf[] };

function isMastersGroup(
  item: NavLeaf | MastersGroup,
): item is MastersGroup {
  return "children" in item;
}

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

function isMastersGroupActive(pathname: string, group: MastersGroup) {
  return group.children.some((child) => isOptionsLinkActive(pathname, child.href));
}

function isMastersActive(pathname: string) {
  if (isOptionsActive(pathname)) return true;
  return mastersLinks.some((item) => {
    if (isMastersGroup(item)) return isMastersGroupActive(pathname, item);
    return isActivePath(pathname, item.href);
  });
}

function isOrdersActive(pathname: string) {
  return ordersLinks.some((item) => isActivePath(pathname, item.href));
}

function isBankActive(pathname: string) {
  return (
    pathname === "/payments" ||
    pathname.startsWith("/payments/") ||
    pathname.startsWith("/payments?")
  );
}

function isBankLinkActive(pathname: string, href: string) {
  if (href === "/payments") return pathname === "/payments";
  return isActivePath(pathname, href);
}

function isOptionsActive(pathname: string) {
  if (isUsersActive(pathname)) return false;
  return pathname === "/options" || pathname.startsWith("/options/");
}

function isOptionsLinkActive(pathname: string, href: string) {
  return pathname === href;
}

function isUsersActive(pathname: string) {
  return usersLinks.some((item) => isActivePath(pathname, item.href));
}

export function AppNav({ access }: { access: Exclude<Access, { kind: "none" }> }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [mastersOpen, setMastersOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [openMastersSubmenu, setOpenMastersSubmenu] = useState<string | null>(
    null,
  );
  const reportMenuId = useId();
  const updateMenuId = useId();
  const ordersMenuId = useId();
  const bankMenuId = useId();
  const mastersMenuId = useId();
  const usersMenuId = useId();
  const reportRef = useRef<HTMLDivElement>(null);
  const updateRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<HTMLDivElement>(null);
  const bankRef = useRef<HTMLDivElement>(null);
  const mastersRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);
  const reportActive =
    pathname === "/reports" || pathname.startsWith("/reports/");
  const updateActive =
    pathname === "/update" || pathname.startsWith("/update/");
  const ordersActive = isOrdersActive(pathname);
  const bankActive = isBankActive(pathname);
  const mastersActive = isMastersActive(pathname);
  const usersActive = isUsersActive(pathname);
  const allowed = (href: string) => canAccessPath(access.pageKeys, href);
  const showUpdateNav =
    access.pageKeys === "all" || hasAnyUpdatePageAccess(access.pageKeys);
  const showBankNav =
    access.pageKeys === "all" || hasAnyBankPageAccess(access.pageKeys);
  const showUsersNav = access.kind === "owner";

  useEffect(() => {
    setMobileNavOpen(false);
    setReportOpen(false);
    setUpdateOpen(false);
    setOrdersOpen(false);
    setBankOpen(false);
    setMastersOpen(false);
    setUsersOpen(false);
    setOpenSubmenu(null);
    setOpenMastersSubmenu(null);
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
    if (!bankOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (bankRef.current && !bankRef.current.contains(event.target as Node)) {
        setBankOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setBankOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [bankOpen]);

  useEffect(() => {
    if (!mastersOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (
        mastersRef.current &&
        !mastersRef.current.contains(event.target as Node)
      ) {
        setMastersOpen(false);
        setOpenMastersSubmenu(null);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (openMastersSubmenu) {
          setOpenMastersSubmenu(null);
          return;
        }
        setMastersOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mastersOpen, openMastersSubmenu]);

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

  useEffect(() => {
    if (!usersOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (
        usersRef.current &&
        !usersRef.current.contains(event.target as Node)
      ) {
        setUsersOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUsersOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [usersOpen]);

  const linksBeforeBank = links.slice(0, 1);
  const linksAfterBank = links.slice(1);

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

            {linksBeforeBank.map((link) => {
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

            {showUpdateNav && (
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
            )}

            {showBankNav && (
            <div
              className={`nav-dropdown${bankOpen ? " open" : ""}${bankActive ? " active" : ""}`}
              ref={bankRef}
            >
              <button
                type="button"
                className={`nav-dropdown-trigger${bankActive ? " active" : ""}`}
                aria-expanded={bankOpen}
                aria-controls={bankMenuId}
                aria-haspopup="menu"
                onClick={() => setBankOpen((open) => !open)}
              >
                Bank
                <span className="nav-dropdown-caret" aria-hidden="true" />
              </button>
              <div
                id={bankMenuId}
                className="nav-dropdown-menu"
                role="menu"
                hidden={!bankOpen}
              >
                {bankLinks.map((item) => {
                  const active = isBankLinkActive(pathname, item.href);
                  return (
                    <LockedLink
                      key={item.href}
                      href={item.href}
                      allowed={allowed(item.href)}
                      role="menuitem"
                      className={active ? "active" : undefined}
                      onClick={() => setBankOpen(false)}
                    >
                      {item.label}
                    </LockedLink>
                  );
                })}
              </div>
            </div>
            )}

            {linksAfterBank.map((link) => {
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
                  if (isMastersGroup(item)) {
                    const submenuOpen = openMastersSubmenu === item.label;
                    const groupActive = isMastersGroupActive(pathname, item);
                    const submenuId = `${mastersMenuId}-${item.label.toLowerCase()}`;
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
                            setOpenMastersSubmenu((current) =>
                              current === item.label ? null : item.label,
                            )
                          }
                          onMouseEnter={() => setOpenMastersSubmenu(item.label)}
                        >
                          {item.label}
                          <span className="nav-submenu-caret" aria-hidden="true" />
                        </button>
                        <div
                          id={submenuId}
                          className="nav-submenu-menu"
                          role="menu"
                          hidden={!submenuOpen}
                          onMouseEnter={() => setOpenMastersSubmenu(item.label)}
                        >
                          {item.children.map((child) => {
                            const active = isOptionsLinkActive(
                              pathname,
                              child.href,
                            );
                            return (
                              <LockedLink
                                key={child.href}
                                href={child.href}
                                allowed={allowed(child.href)}
                                role="menuitem"
                                className={active ? "active" : undefined}
                                onClick={() => {
                                  setOpenMastersSubmenu(null);
                                  setMastersOpen(false);
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
                      onClick={() => setMastersOpen(false)}
                      onMouseEnter={() => setOpenMastersSubmenu(null)}
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

            {showUsersNav && (
            <div
              className={`nav-dropdown${usersOpen ? " open" : ""}${usersActive ? " active" : ""}`}
              ref={usersRef}
            >
              <button
                type="button"
                className={`nav-dropdown-trigger${usersActive ? " active" : ""}`}
                aria-expanded={usersOpen}
                aria-controls={usersMenuId}
                aria-haspopup="menu"
                onClick={() => setUsersOpen((open) => !open)}
              >
                Users
                <span className="nav-dropdown-caret" aria-hidden="true" />
              </button>
              <div
                id={usersMenuId}
                className="nav-dropdown-menu"
                role="menu"
                hidden={!usersOpen}
              >
                {usersLinks.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <LockedLink
                      key={item.href}
                      href={item.href}
                      allowed={allowed(item.href)}
                      role="menuitem"
                      className={active ? "active" : undefined}
                      onClick={() => setUsersOpen(false)}
                    >
                      {item.label}
                    </LockedLink>
                  );
                })}
              </div>
            </div>
            )}
          </nav>
        <div className="app-header-user">
          <span className="app-header-who">{access.name}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
