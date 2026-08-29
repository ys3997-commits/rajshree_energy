"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { createStaff, deleteStaff, updateStaff } from "@/lib/actions/staff";
import { GRANTABLE_PAGES, PAGE_GROUPS } from "@/lib/auth/pages";
import {
  COLLECTION_ENGINE_PAGE_KEY,
  isReportExecAll,
  REPORT_EXEC_ALL,
  SALES_ENGINE_PAGE_KEY,
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
    setEditorOpen(true);
  }

  function openEdit(item: PeopleRow) {
    setEditing(item);
    setName(item.name);
    setRole(item.role ?? "");
    setPassword("");
    setDisableLogin(false);
    setPageKeys(item.pageKeys);
    setCollectionSalesExecs(item.collectionSalesExecs);
    setSalesEngineSalesExecs(item.salesEngineSalesExecs);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditing(null);
    setPassword("");
    setDisableLogin(false);
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
  }

  function toggleGroup(group: (typeof PAGE_GROUPS)[number]) {
    const keys = GRANTABLE_PAGES.filter((page) => page.group === group).map(
      (page) => page.key,
    );
    const allOn = keys.every((key) => pageKeys.includes(key));
    setPageKeys((current) => {
      if (allOn) {
        if (keys.includes(COLLECTION_ENGINE_PAGE_KEY)) {
          setCollectionSalesExecs([]);
        }
        if (keys.includes(SALES_ENGINE_PAGE_KEY)) {
          setSalesEngineSalesExecs([]);
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
      return next;
    });
  }

  const loginEnabled = Boolean(
    editing ? editing.hasLogin && !disableLogin : password.trim(),
  );
  const showPages = loginEnabled || Boolean(password.trim());

  function renderExecScope(
    pageKey: typeof COLLECTION_ENGINE_PAGE_KEY | typeof SALES_ENGINE_PAGE_KEY,
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
        <p className="options-people-hint">
          Add a password to let this person log in with the same email. They
          will only see the pages you tick.
        </p>
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
              {PAGE_GROUPS.map((group) => {
                const pages = GRANTABLE_PAGES.filter((page) => page.group === group);
                const allOn = pages.every((page) => pageKeys.includes(page.key));
                return (
                  <div key={group} className="people-page-group">
                    <div className="people-page-group-head">
                      <h3>{group}</h3>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => toggleGroup(group)}
                      >
                        {allOn ? "Clear" : "Select all"}
                      </button>
                    </div>
                    <div className="people-page-grid">
                      {pages.map((page) => (
                        <div
                          key={page.key}
                          className={
                            page.key === COLLECTION_ENGINE_PAGE_KEY ||
                            page.key === SALES_ENGINE_PAGE_KEY
                              ? "people-page-cell people-page-cell-scoped"
                              : "people-page-cell"
                          }
                        >
                          <label className="people-page-item">
                            <input
                              type="checkbox"
                              checked={pageKeys.includes(page.key)}
                              onChange={() => togglePage(page.key)}
                            />
                            {page.label}
                          </label>
                          {page.key === COLLECTION_ENGINE_PAGE_KEY &&
                            renderExecScope(
                              COLLECTION_ENGINE_PAGE_KEY,
                              collectionSalesExecs,
                              setCollectionSalesExecs,
                            )}
                          {page.key === SALES_ENGINE_PAGE_KEY &&
                            renderExecScope(
                              SALES_ENGINE_PAGE_KEY,
                              salesEngineSalesExecs,
                              setSalesEngineSalesExecs,
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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

function toRow(row: {
  id: string;
  name: string;
  role: string | null;
  hasLogin: boolean;
  pageKeys: string[];
  collectionSalesExecs: string[];
  salesEngineSalesExecs: string[];
}): PeopleRow {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    hasLogin: row.hasLogin,
    pageKeys: row.pageKeys,
    collectionSalesExecs: row.collectionSalesExecs,
    salesEngineSalesExecs: row.salesEngineSalesExecs,
  };
}
