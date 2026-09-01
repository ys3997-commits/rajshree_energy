"use client";

import { FormEvent, useMemo, useState, useTransition, type ReactNode } from "react";
import { createStaff, deleteStaff, updateStaff } from "@/lib/actions/staff";
import {
  BANK_SUB_PAGES,
  BANK_SUB_PAGE_KEYS,
  expandStaffPageKeys,
  MASTER_SUB_PAGES,
  MASTER_ALL_SUB_PAGE_KEYS,
  MASTER_OPTIONS_GROUP,
  MASTER_OPTIONS_SUB_PAGE_KEYS,
  orderedPagesTeamAccess,
  PAGE_GROUPS,
  REPORT_ACCESS_ITEMS,
  REPORT_SUB_PAGE_KEYS,
  reportKeysForAccessGroup,
  type ReportAccessGroup,
  TEAM_ACCESS_PAGES,
  UPDATE_SUB_PAGES,
  UPDATE_SUB_PAGE_KEYS,
} from "@/lib/auth/pages";
import {
  AGEING_REPORT_PAGE_KEY,
  COLLECTION_ENGINE_PAGE_KEY,
  isReportExecAll,
  REPORT_EXEC_ALL,
  PURCHASE_ORDERS_PAGE_KEY,
  SALE_ORDERS_PAGE_KEY,
  SALES_ENGINE_PAGE_KEY,
  type ExecScopedReportPage,
} from "@/lib/auth/report-exec-access";
import { Modal } from "@/components/Modal";
import { capitalizeName } from "@/lib/domain/format";

export type PeopleRow = {
  id: string;
  name: string;
  role: string | null;
  hasLogin: boolean;
  pageKeys: string[];
  collectionSalesExecs: string[];
  salesEngineSalesExecs: string[];
  saleOrderSalesExecs: string[];
  purchaseOrderSalesExecs: string[];
  ageingReportSalesExecs: string[];
};

type SaleExecutiveOption = { id: string; name: string };

function toggleExecScope(
  current: string[],
  name: string,
): string[] {
  if (isReportExecAll(current)) return [name];
  return current.includes(name)
    ? current.filter((item) => item !== name)
    : [...current, name];
}

export function PeopleManager({
  people,
  saleExecutives,
  query,
  onChange,
}: {
  people: PeopleRow[];
  saleExecutives: SaleExecutiveOption[];
  query: string;
  onChange: (people: PeopleRow[]) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<PeopleRow | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [disableLogin, setDisableLogin] = useState(false);
  const [pageKeys, setPageKeys] = useState<string[]>([]);
  const [collectionSalesExecs, setCollectionSalesExecs] = useState<string[]>(
    [],
  );
  const [salesEngineSalesExecs, setSalesEngineSalesExecs] = useState<string[]>(
    [],
  );
  const [saleOrderSalesExecs, setSaleOrderSalesExecs] = useState<string[]>([]);
  const [purchaseOrderSalesExecs, setPurchaseOrderSalesExecs] = useState<string[]>(
    [],
  );
  const [ageingReportSalesExecs, setAgeingReportSalesExecs] = useState<string[]>(
    [],
  );
  const [updateExpanded, setUpdateExpanded] = useState(false);
  const [bankExpanded, setBankExpanded] = useState(false);
  const [masterExpanded, setMasterExpanded] = useState(false);
  const [masterOptionsExpanded, setMasterOptionsExpanded] = useState(false);
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [reportGroupsExpanded, setReportGroupsExpanded] = useState<
    Record<string, boolean>
  >({});

  const sortedExecutives = useMemo(
    () => [...saleExecutives].sort((a, b) => a.name.localeCompare(b.name)),
    [saleExecutives],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...people].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;
    return sorted.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.role?.toLowerCase().includes(q) ?? false),
    );
  }, [people, query]);

  function openCreate() {
    setEditing(null);
    setName("");
    setRole("");
    setPassword("");
    setDisableLogin(false);
    setPageKeys([]);
    setCollectionSalesExecs([]);
    setSalesEngineSalesExecs([]);
    setSaleOrderSalesExecs([]);
    setPurchaseOrderSalesExecs([]);
    setAgeingReportSalesExecs([]);
    setUpdateExpanded(false);
    setBankExpanded(false);
    setMasterExpanded(false);
    setMasterOptionsExpanded(false);
    setReportsExpanded(false);
    setReportGroupsExpanded({});
    setEditorOpen(true);
  }

  function openEdit(item: PeopleRow) {
    setEditing(item);
    setName(item.name);
    setRole(item.role ?? "");
    setPassword("");
    setDisableLogin(false);
    setPageKeys(expandStaffPageKeys(item.pageKeys));
    setUpdateExpanded(
      UPDATE_SUB_PAGE_KEYS.some((key) => item.pageKeys.includes(key)) ||
        item.pageKeys.includes("update"),
    );
    setBankExpanded(
      BANK_SUB_PAGE_KEYS.some((key) => item.pageKeys.includes(key)) ||
        item.pageKeys.includes("payments"),
    );
    setMasterExpanded(
      MASTER_ALL_SUB_PAGE_KEYS.some((key) => item.pageKeys.includes(key)),
    );
    setMasterOptionsExpanded(
      MASTER_OPTIONS_SUB_PAGE_KEYS.some((key) => item.pageKeys.includes(key)),
    );
    setReportsExpanded(
      REPORT_SUB_PAGE_KEYS.some((key) => item.pageKeys.includes(key)),
    );
    setReportGroupsExpanded(
      Object.fromEntries(
        REPORT_ACCESS_ITEMS.filter((entry) => entry.kind === "group")
          .filter((entry) =>
            entry.pages.some((page) => item.pageKeys.includes(page.key)),
          )
          .map((entry) => [entry.id, true]),
      ),
    );
    setCollectionSalesExecs(item.collectionSalesExecs);
    setSalesEngineSalesExecs(item.salesEngineSalesExecs);
    setSaleOrderSalesExecs(item.saleOrderSalesExecs);
    setPurchaseOrderSalesExecs(item.purchaseOrderSalesExecs);
    setAgeingReportSalesExecs(item.ageingReportSalesExecs);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditing(null);
    setPassword("");
    setDisableLogin(false);
  }

  function toggleUpdateParent() {
    const turningOn = !updateExpanded;
    setUpdateExpanded(turningOn);
    if (!turningOn) {
      setPageKeys((current) =>
        current.filter((key) => !UPDATE_SUB_PAGE_KEYS.includes(key)),
      );
    }
  }

  function toggleUpdateAll() {
    const allOn = UPDATE_SUB_PAGE_KEYS.every((key) => pageKeys.includes(key));
    setPageKeys((current) => {
      const without = current.filter((key) => !UPDATE_SUB_PAGE_KEYS.includes(key));
      return allOn ? without : [...without, ...UPDATE_SUB_PAGE_KEYS];
    });
  }

  function toggleUpdateSubPage(key: string) {
    const allOn = UPDATE_SUB_PAGE_KEYS.every((k) => pageKeys.includes(k));
    if (allOn) return;
    setPageKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  const updateAllOn = UPDATE_SUB_PAGE_KEYS.every((key) => pageKeys.includes(key));

  function toggleBankParent() {
    const turningOn = !bankExpanded;
    setBankExpanded(turningOn);
    if (!turningOn) {
      setPageKeys((current) =>
        current.filter((key) => !BANK_SUB_PAGE_KEYS.includes(key)),
      );
    }
  }

  function toggleBankAll() {
    const allOn = BANK_SUB_PAGE_KEYS.every((key) => pageKeys.includes(key));
    setPageKeys((current) => {
      const without = current.filter((key) => !BANK_SUB_PAGE_KEYS.includes(key));
      return allOn ? without : [...without, ...BANK_SUB_PAGE_KEYS];
    });
  }

  function toggleBankSubPage(key: string) {
    const allOn = BANK_SUB_PAGE_KEYS.every((k) => pageKeys.includes(k));
    if (allOn) return;
    setPageKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  const bankAllOn = BANK_SUB_PAGE_KEYS.every((key) => pageKeys.includes(key));

  function toggleMasterParent() {
    const turningOn = !masterExpanded;
    setMasterExpanded(turningOn);
    if (!turningOn) {
      setPageKeys((current) =>
        current.filter((key) => !MASTER_ALL_SUB_PAGE_KEYS.includes(key)),
      );
      setMasterOptionsExpanded(false);
    }
  }

  function toggleMasterAll() {
    const allOn = MASTER_ALL_SUB_PAGE_KEYS.every((key) => pageKeys.includes(key));
    setPageKeys((current) => {
      const without = current.filter((key) => !MASTER_ALL_SUB_PAGE_KEYS.includes(key));
      return allOn ? without : [...without, ...MASTER_ALL_SUB_PAGE_KEYS];
    });
    if (!allOn) {
      setMasterOptionsExpanded(true);
    }
  }

  function toggleMasterSubPage(key: string) {
    const allOn = MASTER_ALL_SUB_PAGE_KEYS.every((k) => pageKeys.includes(k));
    if (allOn) return;
    setPageKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  function toggleMasterOptionsParent() {
    const turningOn = !masterOptionsExpanded;
    setMasterOptionsExpanded(turningOn);
    if (!turningOn) {
      setPageKeys((current) =>
        current.filter((key) => !MASTER_OPTIONS_SUB_PAGE_KEYS.includes(key)),
      );
    }
  }

  function toggleMasterOptionsAll() {
    const keys = MASTER_OPTIONS_SUB_PAGE_KEYS;
    const allOn = keys.every((key) => pageKeys.includes(key));
    const masterAllOn = MASTER_ALL_SUB_PAGE_KEYS.every((key) => pageKeys.includes(key));
    setPageKeys((current) => {
      const without = current.filter((key) => !keys.includes(key));
      return allOn ? without : [...without, ...keys];
    });
    if (!allOn && !masterAllOn) {
      setMasterOptionsExpanded(true);
    }
  }

  function toggleMasterOptionsSubPage(key: string) {
    const groupAllOn = MASTER_OPTIONS_SUB_PAGE_KEYS.every((k) => pageKeys.includes(k));
    const masterAllOn = MASTER_ALL_SUB_PAGE_KEYS.every((k) => pageKeys.includes(k));
    if (groupAllOn || masterAllOn) return;
    setPageKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  const masterAllOn = MASTER_ALL_SUB_PAGE_KEYS.every((key) => pageKeys.includes(key));
  const masterOptionsAllOn = MASTER_OPTIONS_SUB_PAGE_KEYS.every((key) =>
    pageKeys.includes(key),
  );

  function applyExecScopeDefault(key: string) {
    if (key === COLLECTION_ENGINE_PAGE_KEY) {
      setCollectionSalesExecs([REPORT_EXEC_ALL]);
    }
    if (key === SALES_ENGINE_PAGE_KEY) {
      setSalesEngineSalesExecs([REPORT_EXEC_ALL]);
    }
    if (key === SALE_ORDERS_PAGE_KEY) {
      setSaleOrderSalesExecs([REPORT_EXEC_ALL]);
    }
    if (key === PURCHASE_ORDERS_PAGE_KEY) {
      setPurchaseOrderSalesExecs([REPORT_EXEC_ALL]);
    }
    if (key === AGEING_REPORT_PAGE_KEY) {
      setAgeingReportSalesExecs([REPORT_EXEC_ALL]);
    }
  }

  function clearExecScope(key: string) {
    if (key === COLLECTION_ENGINE_PAGE_KEY) {
      setCollectionSalesExecs([]);
    }
    if (key === SALES_ENGINE_PAGE_KEY) {
      setSalesEngineSalesExecs([]);
    }
    if (key === SALE_ORDERS_PAGE_KEY) {
      setSaleOrderSalesExecs([]);
    }
    if (key === PURCHASE_ORDERS_PAGE_KEY) {
      setPurchaseOrderSalesExecs([]);
    }
    if (key === AGEING_REPORT_PAGE_KEY) {
      setAgeingReportSalesExecs([]);
    }
  }

  function toggleReportsParent() {
    const turningOn = !reportsExpanded;
    setReportsExpanded(turningOn);
    if (!turningOn) {
      setPageKeys((current) =>
        current.filter((key) => !REPORT_SUB_PAGE_KEYS.includes(key)),
      );
      for (const key of REPORT_SUB_PAGE_KEYS) {
        clearExecScope(key);
      }
      setReportGroupsExpanded({});
    }
  }

  function toggleReportsAll() {
    const allOn = REPORT_SUB_PAGE_KEYS.every((key) => pageKeys.includes(key));
    setPageKeys((current) => {
      const without = current.filter((key) => !REPORT_SUB_PAGE_KEYS.includes(key));
      if (allOn) {
        for (const key of REPORT_SUB_PAGE_KEYS) {
          if (current.includes(key)) clearExecScope(key);
        }
        return without;
      }
      for (const key of REPORT_SUB_PAGE_KEYS) {
        if (!current.includes(key)) applyExecScopeDefault(key);
      }
      return [...without, ...REPORT_SUB_PAGE_KEYS];
    });
  }

  function toggleReportGroupParent(group: ReportAccessGroup) {
    const turningOn = !(reportGroupsExpanded[group.id] ?? false);
    setReportGroupsExpanded((current) => ({ ...current, [group.id]: turningOn }));
    if (!turningOn) {
      const keys = reportKeysForAccessGroup(group);
      setPageKeys((current) => current.filter((key) => !keys.includes(key)));
      for (const key of keys) {
        clearExecScope(key);
      }
    }
  }

  function toggleReportGroupAll(group: ReportAccessGroup) {
    const keys = reportKeysForAccessGroup(group);
    const allOn = keys.every((key) => pageKeys.includes(key));
    setPageKeys((current) => {
      const without = current.filter((key) => !keys.includes(key));
      if (allOn) {
        for (const key of keys) {
          if (current.includes(key)) clearExecScope(key);
        }
        return without;
      }
      for (const key of keys) {
        if (!current.includes(key)) applyExecScopeDefault(key);
      }
      return [...new Set([...without, ...keys])];
    });
  }

  function toggleReportSubPage(key: string, parentAllOn: boolean) {
    if (parentAllOn) return;
    const turningOn = !pageKeys.includes(key);
    setPageKeys((current) =>
      turningOn
        ? [...current, key]
        : current.filter((item) => item !== key),
    );
    if (turningOn) {
      applyExecScopeDefault(key);
    } else {
      clearExecScope(key);
    }
  }

  const reportsAllOn = REPORT_SUB_PAGE_KEYS.every((key) => pageKeys.includes(key));

  function renderReportExecScope(key: string) {
    if (key === COLLECTION_ENGINE_PAGE_KEY) {
      return renderExecScope(
        COLLECTION_ENGINE_PAGE_KEY,
        collectionSalesExecs,
        setCollectionSalesExecs,
      );
    }
    if (key === SALES_ENGINE_PAGE_KEY) {
      return renderExecScope(
        SALES_ENGINE_PAGE_KEY,
        salesEngineSalesExecs,
        setSalesEngineSalesExecs,
      );
    }
    if (key === AGEING_REPORT_PAGE_KEY) {
      return renderExecScope(
        AGEING_REPORT_PAGE_KEY,
        ageingReportSalesExecs,
        setAgeingReportSalesExecs,
      );
    }
    return null;
  }

  function togglePage(key: string) {
    const turningOn = !pageKeys.includes(key);
    setPageKeys((current) =>
      turningOn
        ? [...current, key]
        : current.filter((item) => item !== key),
    );
    if (key === COLLECTION_ENGINE_PAGE_KEY) {
      setCollectionSalesExecs(turningOn ? [REPORT_EXEC_ALL] : []);
    }
    if (key === SALES_ENGINE_PAGE_KEY) {
      setSalesEngineSalesExecs(turningOn ? [REPORT_EXEC_ALL] : []);
    }
    if (key === SALE_ORDERS_PAGE_KEY) {
      setSaleOrderSalesExecs(turningOn ? [REPORT_EXEC_ALL] : []);
    }
    if (key === PURCHASE_ORDERS_PAGE_KEY) {
      setPurchaseOrderSalesExecs(turningOn ? [REPORT_EXEC_ALL] : []);
    }
    if (key === AGEING_REPORT_PAGE_KEY) {
      setAgeingReportSalesExecs(turningOn ? [REPORT_EXEC_ALL] : []);
    }
  }

  function toggleGroup(group: (typeof PAGE_GROUPS)[number]) {
    const keys = [
      ...TEAM_ACCESS_PAGES.filter((page) => page.group === group).map(
        (page) => page.key,
      ),
      ...(group === "Pages"
        ? [
            ...UPDATE_SUB_PAGE_KEYS,
            ...BANK_SUB_PAGE_KEYS,
            ...MASTER_ALL_SUB_PAGE_KEYS,
          ]
        : group === "Reports"
          ? REPORT_SUB_PAGE_KEYS
          : []),
    ];
    const allOn = keys.every((key) => pageKeys.includes(key));
    setPageKeys((current) => {
      if (allOn) {
        if (keys.includes(COLLECTION_ENGINE_PAGE_KEY)) {
          setCollectionSalesExecs([]);
        }
        if (keys.includes(SALES_ENGINE_PAGE_KEY)) {
          setSalesEngineSalesExecs([]);
        }
        if (keys.includes(SALE_ORDERS_PAGE_KEY)) {
          setSaleOrderSalesExecs([]);
        }
        if (keys.includes(PURCHASE_ORDERS_PAGE_KEY)) {
          setPurchaseOrderSalesExecs([]);
        }
        if (keys.includes(AGEING_REPORT_PAGE_KEY)) {
          setAgeingReportSalesExecs([]);
        }
        if (group === "Pages") {
          setUpdateExpanded(false);
          setBankExpanded(false);
          setMasterExpanded(false);
          setMasterOptionsExpanded(false);
        }
        if (group === "Reports") {
          setReportsExpanded(false);
          setReportGroupsExpanded({});
        }
        return current.filter((key) => !keys.includes(key));
      }
      const next = [...new Set([...current, ...keys])];
      if (
        keys.includes(COLLECTION_ENGINE_PAGE_KEY) &&
        !current.includes(COLLECTION_ENGINE_PAGE_KEY)
      ) {
        setCollectionSalesExecs([REPORT_EXEC_ALL]);
      }
      if (
        keys.includes(SALES_ENGINE_PAGE_KEY) &&
        !current.includes(SALES_ENGINE_PAGE_KEY)
      ) {
        setSalesEngineSalesExecs([REPORT_EXEC_ALL]);
      }
      if (
        keys.includes(SALE_ORDERS_PAGE_KEY) &&
        !current.includes(SALE_ORDERS_PAGE_KEY)
      ) {
        setSaleOrderSalesExecs([REPORT_EXEC_ALL]);
      }
      if (
        keys.includes(PURCHASE_ORDERS_PAGE_KEY) &&
        !current.includes(PURCHASE_ORDERS_PAGE_KEY)
      ) {
        setPurchaseOrderSalesExecs([REPORT_EXEC_ALL]);
      }
      if (
        keys.includes(AGEING_REPORT_PAGE_KEY) &&
        !current.includes(AGEING_REPORT_PAGE_KEY)
      ) {
        setAgeingReportSalesExecs([REPORT_EXEC_ALL]);
      }
      if (group === "Pages") {
        setUpdateExpanded(true);
        setBankExpanded(true);
        setMasterExpanded(true);
        setMasterOptionsExpanded(true);
      }
      if (group === "Reports") {
        setReportsExpanded(true);
        setReportGroupsExpanded(
          Object.fromEntries(
            REPORT_ACCESS_ITEMS.filter((entry) => entry.kind === "group").map(
              (entry) => [entry.id, true],
            ),
          ),
        );
      }
      return next;
    });
  }

  const loginEnabled = Boolean(
    editing ? editing.hasLogin && !disableLogin : password.trim(),
  );
  const showPages = loginEnabled || Boolean(password.trim());

  function renderExecScope(
    pageKey: ExecScopedReportPage,
    scope: string[],
    setScope: (next: string[]) => void,
  ) {
    if (!pageKeys.includes(pageKey)) return null;

    const allOn = isReportExecAll(scope);

    return (
      <div className="people-exec-scope">
        <label className="people-exec-item">
          <input
            type="checkbox"
            checked={allOn}
            onChange={(e) =>
              setScope(e.target.checked ? [REPORT_EXEC_ALL] : [])
            }
          />
          ALL
        </label>
        {sortedExecutives.map((executive) => (
          <label key={executive.id} className="people-exec-item">
            <input
              type="checkbox"
              checked={!allOn && scope.includes(executive.name)}
              disabled={allOn}
              onChange={() => setScope(toggleExecScope(scope, executive.name))}
            />
            {executive.name}
          </label>
        ))}
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const nextName = capitalizeName(name);
    if (!nextName) return;
    const nextRole = capitalizeName(role);
    setError(null);

    startTransition(async () => {
      try {
        if (editing) {
          const row = await updateStaff(editing.id, {
            name: nextName,
            role: nextRole || null,
            password: password.trim() || null,
            pageKeys,
            collectionSalesExecs,
            salesEngineSalesExecs,
            saleOrderSalesExecs,
            purchaseOrderSalesExecs,
            ageingReportSalesExecs,
            disableLogin,
          });
          onChange(
            people
              .map((item) => (item.id === editing.id ? toRow(row) : item))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
        } else {
          const row = await createStaff({
            name: nextName,
            role: nextRole || null,
            password: password.trim() || null,
            pageKeys,
            collectionSalesExecs,
            salesEngineSalesExecs,
            saleOrderSalesExecs,
            purchaseOrderSalesExecs,
            ageingReportSalesExecs,
          });
          onChange(
            [...people, toRow(row)].sort((a, b) => a.name.localeCompare(b.name)),
          );
        }
        closeEditor();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  async function onDelete(item: PeopleRow) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteStaff(item.id);
        onChange(people.filter((row) => row.id !== item.id));
        if (editing?.id === item.id) closeEditor();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  return (
    <>
      <Modal open={error !== null} title="Message" onClose={() => setError(null)}>
        <p className="mb-4">{error}</p>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={() => setError(null)}>
            OK
          </button>
        </div>
      </Modal>

      <div className="options-toolbar">
        <button type="button" className="btn" onClick={openCreate}>
          Add person
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-h-scroll"><table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Login</th>
              <th>Pages</th>
              <th className="options-actions-col" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.role ?? "—"}</td>
                <td>{item.hasLogin ? "Yes" : "No"}</td>
                <td>{item.hasLogin ? item.pageKeys.length : "—"}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => openEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => onDelete(item)}
                    disabled={pending}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="options-empty">
                  {query.trim()
                    ? "No matches for your search."
                    : "No people yet. Add one above."}
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>

      <Modal
        open={editorOpen}
        title={editing ? `Edit ${editing.name}` : "Add person"}
        onClose={closeEditor}
        wide
      >
        <form onSubmit={onSubmit} className="people-form">
          <label className="login-field">
            <span>Name</span>
            <input
              required
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (name.trim()) setName(capitalizeName(name) ?? name);
              }}
            />
          </label>
          <label className="login-field">
            <span>Role (optional)</span>
            <input
              className="field-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onBlur={() => {
                if (role.trim()) setRole(capitalizeName(role) ?? role);
              }}
            />
          </label>
          <label className="login-field">
            <span>
              {editing?.hasLogin
                ? "Password (leave blank to keep current)"
                : "Login password (optional)"}
            </span>
            <input
              className="field-input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                editing?.hasLogin ? "••••••••" : "Set a password to allow login"
              }
              disabled={disableLogin}
            />
          </label>
          {editing?.hasLogin && (
            <label className="people-check-row">
              <input
                type="checkbox"
                checked={disableLogin}
                onChange={(e) => setDisableLogin(e.target.checked)}
              />
              Remove login access
            </label>
          )}

          {showPages && !disableLogin && (
            <fieldset className="people-pages">
              <legend>Page access</legend>

              <div className="people-page-group">
                <div className="people-page-group-head">
                  <h3>Pages</h3>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => toggleGroup("Pages")}
                  >
                    {[
                      ...orderedPagesTeamAccess().map((page) => page.key),
                      ...UPDATE_SUB_PAGE_KEYS,
                      ...BANK_SUB_PAGE_KEYS,
                      ...MASTER_ALL_SUB_PAGE_KEYS,
                    ].every((key) => pageKeys.includes(key))
                      ? "Clear"
                      : "Select all"}
                  </button>
                </div>

                <div className="people-access-simple-grid">
                  {orderedPagesTeamAccess().map((page) => {
                    const scoped =
                      page.key === SALE_ORDERS_PAGE_KEY ||
                      page.key === PURCHASE_ORDERS_PAGE_KEY;
                    return (
                      <div
                        key={page.key}
                        className={scoped ? "people-access-scoped" : undefined}
                      >
                        <AccessCheckbox
                          checked={pageKeys.includes(page.key)}
                          onChange={() => togglePage(page.key)}
                          label={page.label}
                        />
                        {page.key === SALE_ORDERS_PAGE_KEY &&
                          renderExecScope(
                            SALE_ORDERS_PAGE_KEY,
                            saleOrderSalesExecs,
                            setSaleOrderSalesExecs,
                          )}
                        {page.key === PURCHASE_ORDERS_PAGE_KEY &&
                          renderExecScope(
                            PURCHASE_ORDERS_PAGE_KEY,
                            purchaseOrderSalesExecs,
                            setPurchaseOrderSalesExecs,
                          )}
                      </div>
                    );
                  })}
                </div>

                <div className="people-access-panels">
                  <AccessPanel
                    title="Update"
                    expanded={updateExpanded}
                    onToggleExpanded={toggleUpdateParent}
                    allOn={updateAllOn}
                    onToggleAll={toggleUpdateAll}
                  >
                    {UPDATE_SUB_PAGES.map((subPage) => (
                      <AccessCheckbox
                        key={subPage.key}
                        checked={pageKeys.includes(subPage.key)}
                        disabled={updateAllOn}
                        onChange={() => toggleUpdateSubPage(subPage.key)}
                        label={subPage.label}
                      />
                    ))}
                  </AccessPanel>

                  <AccessPanel
                    title="Bank"
                    expanded={bankExpanded}
                    onToggleExpanded={toggleBankParent}
                    allOn={bankAllOn}
                    onToggleAll={toggleBankAll}
                  >
                    {BANK_SUB_PAGES.map((subPage) => (
                      <AccessCheckbox
                        key={subPage.key}
                        checked={pageKeys.includes(subPage.key)}
                        disabled={bankAllOn}
                        onChange={() => toggleBankSubPage(subPage.key)}
                        label={subPage.label}
                      />
                    ))}
                  </AccessPanel>

                  <AccessPanel
                    title="Master"
                    expanded={masterExpanded}
                    onToggleExpanded={toggleMasterParent}
                    allOn={masterAllOn}
                    onToggleAll={toggleMasterAll}
                  >
                    {MASTER_SUB_PAGES.map((subPage) => (
                      <AccessCheckbox
                        key={subPage.key}
                        checked={pageKeys.includes(subPage.key)}
                        disabled={masterAllOn}
                        onChange={() => toggleMasterSubPage(subPage.key)}
                        label={subPage.label}
                      />
                    ))}
                    <div className="people-access-subpanel">
                      <label className="people-access-subpanel-head">
                        <input
                          type="checkbox"
                          checked={masterOptionsExpanded}
                          onChange={toggleMasterOptionsParent}
                        />
                        {MASTER_OPTIONS_GROUP.label}
                      </label>
                      {masterOptionsExpanded && (
                        <div className="people-access-panel-body-nested">
                          <label className="people-access-all">
                            <input
                              type="checkbox"
                              checked={masterOptionsAllOn}
                              disabled={masterAllOn}
                              onChange={toggleMasterOptionsAll}
                            />
                            ALL
                          </label>
                          {MASTER_OPTIONS_GROUP.pages.map((page) => (
                            <AccessCheckbox
                              key={page.key}
                              checked={pageKeys.includes(page.key)}
                              disabled={masterAllOn || masterOptionsAllOn}
                              onChange={() => toggleMasterOptionsSubPage(page.key)}
                              label={page.label}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </AccessPanel>
                </div>
              </div>

              <div className="people-page-group">
                <div className="people-access-panels">
                  <AccessPanel
                    title="Reports"
                    expanded={reportsExpanded}
                    onToggleExpanded={toggleReportsParent}
                    allOn={reportsAllOn}
                    onToggleAll={toggleReportsAll}
                    action={
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => toggleGroup("Reports")}
                      >
                        {REPORT_SUB_PAGE_KEYS.every((key) =>
                          pageKeys.includes(key),
                        )
                          ? "Clear"
                          : "Select all"}
                      </button>
                    }
                  >
                    {REPORT_ACCESS_ITEMS.map((item) => {
                      if (item.kind === "leaf") {
                        return (
                          <AccessCheckbox
                            key={item.key}
                            checked={pageKeys.includes(item.key)}
                            disabled={reportsAllOn}
                            onChange={() =>
                              toggleReportSubPage(item.key, reportsAllOn)
                            }
                            label={item.label}
                          />
                        );
                      }

                      const groupAllOn = item.pages.every((page) =>
                        pageKeys.includes(page.key),
                      );
                      const groupExpanded = reportGroupsExpanded[item.id] ?? false;

                      return (
                        <div key={item.id} className="people-access-subpanel">
                          <label className="people-access-subpanel-head">
                            <input
                              type="checkbox"
                              checked={groupExpanded}
                              onChange={() => toggleReportGroupParent(item)}
                            />
                            {item.label}
                          </label>
                          {groupExpanded && (
                            <div className="people-access-panel-body-nested">
                              <label className="people-access-all">
                                <input
                                  type="checkbox"
                                  checked={groupAllOn}
                                  disabled={reportsAllOn}
                                  onChange={() => toggleReportGroupAll(item)}
                                />
                                ALL
                              </label>
                              {item.pages.map((page) => {
                                const scoped =
                                  page.key === COLLECTION_ENGINE_PAGE_KEY ||
                                  page.key === SALES_ENGINE_PAGE_KEY ||
                                  page.key === AGEING_REPORT_PAGE_KEY;
                                return (
                                  <div
                                    key={page.key}
                                    className={
                                      scoped
                                        ? "people-access-report-page people-access-scoped"
                                        : "people-access-report-page"
                                    }
                                  >
                                    <AccessCheckbox
                                      checked={pageKeys.includes(page.key)}
                                      disabled={reportsAllOn || groupAllOn}
                                      onChange={() =>
                                        toggleReportSubPage(
                                          page.key,
                                          reportsAllOn || groupAllOn,
                                        )
                                      }
                                      label={page.label}
                                    />
                                    {renderReportExecScope(page.key)}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </AccessPanel>
                </div>
              </div>
            </fieldset>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeEditor}
            >
              Cancel
            </button>
            <button type="submit" className="btn" disabled={pending}>
              {editing ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function AccessCheckbox({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="people-access-item">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      {label}
    </label>
  );
}

function AccessPanel({
  title,
  expanded,
  onToggleExpanded,
  allOn,
  onToggleAll,
  allDisabled,
  action,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  allOn: boolean;
  onToggleAll: () => void;
  allDisabled?: boolean;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="people-access-panel">
      <div className="people-access-panel-toolbar">
        <label className="people-access-panel-head">
          <input type="checkbox" checked={expanded} onChange={onToggleExpanded} />
          {title}
        </label>
        {action}
      </div>
      {expanded && (
        <div className="people-access-panel-body">
          <label className="people-access-all">
            <input
              type="checkbox"
              checked={allOn}
              disabled={allDisabled}
              onChange={onToggleAll}
            />
            ALL
          </label>
          {children}
        </div>
      )}
    </div>
  );
}

function toRow(row: {
  id: string;
  name: string;
  role: string | null;
  hasLogin: boolean;
  pageKeys: string[];
  collectionSalesExecs: string[];
  salesEngineSalesExecs: string[];
  saleOrderSalesExecs: string[];
  purchaseOrderSalesExecs: string[];
  ageingReportSalesExecs: string[];
}): PeopleRow {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    hasLogin: row.hasLogin,
    pageKeys: row.pageKeys,
    collectionSalesExecs: row.collectionSalesExecs,
    salesEngineSalesExecs: row.salesEngineSalesExecs,
    saleOrderSalesExecs: row.saleOrderSalesExecs,
    purchaseOrderSalesExecs: row.purchaseOrderSalesExecs,
    ageingReportSalesExecs: row.ageingReportSalesExecs,
  };
}
