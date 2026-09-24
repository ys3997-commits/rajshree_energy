"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { Modal } from "@/components/Modal";
import {
  createDocumentEntry,
  createDocumentOption,
  deleteDocumentEntry,
  deleteDocumentOption,
  updateDocumentEntry,
  updateDocumentOption,
  type DocumentEntryRow,
} from "@/lib/actions/option-lists";
import { capitalizeName } from "@/lib/domain/format";
import {
  DOCUMENT_KIND_LABELS,
  DOCUMENT_KINDS,
  isDocumentKind,
  type DocumentKind,
} from "./documentEntities";

export type DocumentMember = {
  id: string;
  name: string;
  kind: DocumentKind;
};

type Tab = "members" | "documents";

export function DocumentsMaster({
  members,
  entries,
}: {
  members: DocumentMember[];
  entries: DocumentEntryRow[];
}) {
  const [tab, setTab] = useState<Tab>("members");
  const [memberRows, setMemberRows] = useState(members);
  const [entryRows, setEntryRows] = useState(entries);

  return (
    <div className="options-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
        </div>
      </div>

      <div className="options-tabs" role="tablist" aria-label="Documents">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "members"}
          className={`options-tab${tab === "members" ? " options-tab-active" : ""}`}
          onClick={() => setTab("members")}
        >
          Members
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "documents"}
          className={`options-tab${tab === "documents" ? " options-tab-active" : ""}`}
          onClick={() => setTab("documents")}
        >
          Documents
        </button>
      </div>

      {tab === "members" ? (
        <MembersTab members={memberRows} onChange={setMemberRows} />
      ) : (
        <DocumentsTab entries={entryRows} onChange={setEntryRows} />
      )}
    </div>
  );
}

function MembersTab({
  members,
  onChange,
}: {
  members: DocumentMember[];
  onChange: (next: DocumentMember[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [kindDraft, setKindDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [editKindDraft, setEditKindDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...members].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;
    return sorted.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        DOCUMENT_KIND_LABELS[item.kind].toLowerCase().includes(q),
    );
  }, [members, query]);

  function cancelEdit() {
    setEditingId(null);
    setEditDraft("");
    setEditKindDraft("");
  }

  function startEdit(item: DocumentMember) {
    window.setTimeout(() => {
      setEditingId(item.id);
      setEditDraft(item.name);
      setEditKindDraft(item.kind);
      setError(null);
    }, 0);
  }

  function onAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const name = capitalizeName(draft);
    if (!name) return;
    if (!isDocumentKind(kindDraft)) {
      setError("Select Company or Individual");
      return;
    }
    const kind = kindDraft;
    startTransition(async () => {
      try {
        const { id } = await createDocumentOption(name, kind);
        onChange(
          [...members, { id, name, kind }].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
        setDraft("");
        setKindDraft("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function saveEdit() {
    if (!editingId) return;
    setError(null);
    const name = capitalizeName(editDraft);
    if (!name) return;
    if (!isDocumentKind(editKindDraft)) {
      setError("Select Company or Individual");
      return;
    }
    const kind = editKindDraft;
    const id = editingId;
    startTransition(async () => {
      try {
        await updateDocumentOption(id, name, kind);
        onChange(
          members
            .map((item) => (item.id === id ? { ...item, name, kind } : item))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        cancelEdit();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onDelete(item: DocumentMember) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteDocumentOption(item.id);
        onChange(members.filter((row) => row.id !== item.id));
        if (editingId === item.id) cancelEdit();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  return (
    <section className="options-card">
      <MessageModal message={error} onClose={() => setError(null)} />
      <div className="options-card-header">
        <p className="options-card-desc">
          Companies and individuals used on documents.
        </p>
        <label className="options-search-wrap">
          <span className="sr-only">Search members</span>
          <input
            type="search"
            className="field-input options-search-input"
            placeholder="Search members…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <form onSubmit={onAdd} className="options-toolbar">
        <input
          required
          className="field-input"
          placeholder="New member name"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (draft.trim()) setDraft(capitalizeName(draft) ?? draft);
          }}
          disabled={pending || editingId != null}
        />
        <KindSelect
          value={kindDraft}
          onChange={setKindDraft}
          disabled={pending || editingId != null}
        />
        <button
          type="submit"
          className="btn"
          disabled={pending || editingId != null}
        >
          Add
        </button>
      </form>
      <div className="table-wrap">
        <div className="table-h-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th className="options-actions-col" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <tr
                    key={item.id}
                    className={isEditing ? "payment-editing-row" : undefined}
                  >
                    {isEditing ? (
                      <>
                        <td>
                          <input
                            required
                            className="field-input"
                            aria-label="Name"
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            onBlur={() => {
                              if (editDraft.trim()) {
                                setEditDraft(capitalizeName(editDraft) ?? editDraft);
                              }
                            }}
                          />
                        </td>
                        <td>
                          <KindSelect
                            value={editKindDraft}
                            onChange={setEditKindDraft}
                            label="Type"
                          />
                        </td>
                        <td className="space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={saveEdit}
                            disabled={pending}
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={cancelEdit}
                            disabled={pending}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{item.name}</td>
                        <td>{DOCUMENT_KIND_LABELS[item.kind]}</td>
                        <td className="space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => startEdit(item)}
                            disabled={pending}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => onDelete(item)}
                            disabled={pending}
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="options-empty">
                    {query.trim()
                      ? "No matches for your search."
                      : "No members yet. Add one above."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function DocumentsTab({
  entries,
  onChange,
}: {
  entries: DocumentEntryRow[];
  onChange: (next: DocumentEntryRow[]) => void;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editKind, setEditKind] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditKind("");
  }

  function startEdit(item: DocumentEntryRow) {
    window.setTimeout(() => {
      setEditingId(item.id);
      setEditName(item.name);
      setEditKind(item.kind);
      setError(null);
    }, 0);
  }

  function onAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const documentName = capitalizeName(name);
    if (!documentName) return;
    if (!isDocumentKind(kind)) {
      setError("Select Company or Individual");
      return;
    }
    startTransition(async () => {
      try {
        const { id } = await createDocumentEntry(documentName, kind);
        onChange(
          [...entries, { id, name: documentName, kind }].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
        setName("");
        setKind("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function saveEdit() {
    if (!editingId) return;
    setError(null);
    const documentName = capitalizeName(editName);
    if (!documentName) return;
    if (!isDocumentKind(editKind)) {
      setError("Select Company or Individual");
      return;
    }
    const id = editingId;
    startTransition(async () => {
      try {
        await updateDocumentEntry(id, documentName, editKind);
        onChange(
          entries
            .map((item) =>
              item.id === id ? { ...item, name: documentName, kind: editKind } : item,
            )
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        cancelEdit();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onDelete(item: DocumentEntryRow) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteDocumentEntry(item.id);
        onChange(entries.filter((row) => row.id !== item.id));
        if (editingId === item.id) cancelEdit();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  return (
    <section className="options-card">
      <MessageModal message={error} onClose={() => setError(null)} />
      <form onSubmit={onAdd} className="options-toolbar">
        <input
          required
          className="field-input"
          placeholder="Document name"
          aria-label="Document name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name.trim()) setName(capitalizeName(name) ?? name);
          }}
          disabled={pending || editingId != null}
        />
        <KindSelect
          value={kind}
          onChange={setKind}
          disabled={pending || editingId != null}
          label="Company / Individual"
          emptyLabel="Company / Individual"
        />
        <button
          type="submit"
          className="btn"
          disabled={pending || editingId != null}
        >
          Add
        </button>
      </form>
      <div className="table-wrap">
        <div className="table-h-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Document name</th>
                <th>Type</th>
                <th className="options-actions-col" />
              </tr>
            </thead>
            <tbody>
              {entries.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <tr
                    key={item.id}
                    className={isEditing ? "payment-editing-row" : undefined}
                  >
                    {isEditing ? (
                      <>
                        <td>
                          <input
                            required
                            className="field-input"
                            aria-label="Document name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => {
                              if (editName.trim()) {
                                setEditName(capitalizeName(editName) ?? editName);
                              }
                            }}
                          />
                        </td>
                        <td>
                          <KindSelect
                            value={editKind}
                            onChange={setEditKind}
                            label="Company / Individual"
                            emptyLabel="Company / Individual"
                          />
                        </td>
                        <td className="space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={saveEdit}
                            disabled={pending}
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={cancelEdit}
                            disabled={pending}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{item.name}</td>
                        <td>{DOCUMENT_KIND_LABELS[item.kind]}</td>
                        <td className="space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => startEdit(item)}
                            disabled={pending}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => onDelete(item)}
                            disabled={pending}
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={3} className="options-empty">
                    No documents yet. Add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function KindSelect({
  value,
  onChange,
  disabled,
  label = "Type",
  emptyLabel = "Select type",
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  emptyLabel?: string;
}) {
  return (
    <select
      required
      className="field-input"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">{emptyLabel}</option>
      {DOCUMENT_KINDS.map((kind) => (
        <option key={kind} value={kind}>
          {DOCUMENT_KIND_LABELS[kind]}
        </option>
      ))}
    </select>
  );
}

function MessageModal({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  return (
    <Modal open={message !== null} title="Message" onClose={onClose}>
      <p className="mb-4">{message}</p>
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose}>
          OK
        </button>
      </div>
    </Modal>
  );
}
