"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import {
  createCityOption,
  createSaleExecutiveOption,
  createSectorOption,
  createStateOption,
  deleteCityOption,
  deleteSaleExecutiveOption,
  deleteSectorOption,
  deleteStateOption,
  updateCityOption,
  updateSaleExecutiveOption,
  updateSectorOption,
  updateStateOption,
} from "@/lib/actions/option-lists";
import {
  createOriginOption,
  createQualityOption,
  deleteOriginOption,
  deleteQualityOption,
  updateOriginOption,
  updateQualityOption,
} from "@/lib/actions/qualities";
import {
  createPortOption,
  deletePortOption,
  updatePortOption,
} from "@/lib/actions/ports";
import {
  createStaff,
  deleteStaff,
  updateStaff,
} from "@/lib/actions/staff";
import { Modal } from "@/components/Modal";
import { capitalizeName } from "@/lib/domain/format";

type Opt = { id: string; name: string };
type PeopleOpt = { id: string; name: string; role: string | null };

type CategoryId =
  | "origins"
  | "qualities"
  | "ports"
  | "saleExecutives"
  | "cities"
  | "states"
  | "sectors"
  | "people";

const CATEGORIES: {
  id: CategoryId;
  label: string;
  description: string;
  placeholder: string;
}[] = [
  {
    id: "origins",
    label: "Origins",
    description: "Coal source regions used in quality classes.",
    placeholder: "New origin, e.g. Indonesia",
  },
  {
    id: "qualities",
    label: "Qualities",
    description: "Grade names used in quality classes.",
    placeholder: "New quality, e.g. 6000 GCV",
  },
  {
    id: "ports",
    label: "Ports",
    description: "Ports and locations on vessels and orders.",
    placeholder: "New port, e.g. Haldia Port",
  },
  {
    id: "saleExecutives",
    label: "Sales executives",
    description: "Suggested names on customer records.",
    placeholder: "New sales executive",
  },
  {
    id: "cities",
    label: "Cities",
    description: "Suggested cities on customers and transporters.",
    placeholder: "New city",
  },
  {
    id: "states",
    label: "States",
    description: "Suggested states on customers and transporters.",
    placeholder: "New state",
  },
  {
    id: "sectors",
    label: "Sectors",
    description: "Industry sectors suggested on customers.",
    placeholder: "New sector, e.g. Steel",
  },
  {
    id: "people",
    label: "People",
    description: "People who deal and operate on the desk.",
    placeholder: "New person",
  },
];

type SimpleCategoryId = Exclude<CategoryId, "people">;
type ItemMap = Record<SimpleCategoryId, Opt[]>;

export function OptionsClient({
  origins,
  qualities,
  ports,
  saleExecutives,
  cities,
  states,
  sectors,
  people,
}: {
  origins: Opt[];
  qualities: Opt[];
  ports: Opt[];
  saleExecutives: Opt[];
  cities: Opt[];
  states: Opt[];
  sectors: Opt[];
  people: PeopleOpt[];
}) {
  const [items, setItems] = useState<ItemMap>({
    origins,
    qualities,
    ports,
    saleExecutives,
    cities,
    states,
    sectors,
  });
  const [peopleItems, setPeopleItems] = useState(people);
  const [activeId, setActiveId] = useState<CategoryId>("origins");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [roleDraft, setRoleDraft] = useState("");
  const [editing, setEditing] = useState<Opt | PeopleOpt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const active = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0];

  const filteredPeople = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...peopleItems].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;
    return sorted.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.role?.toLowerCase().includes(q) ?? false),
    );
  }, [peopleItems, query]);

  const filteredOptions = useMemo(() => {
    if (activeId === "people") return [];
    const q = query.trim().toLowerCase();
    const sorted = [...items[activeId]].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;
    return sorted.filter((item) => item.name.toLowerCase().includes(q));
  }, [activeId, items, query]);

  function switchCategory(id: CategoryId) {
    setActiveId(id);
    setQuery("");
    setDraft("");
    setRoleDraft("");
    setEditing(null);
    setError(null);
  }

  function setCategoryItems(id: SimpleCategoryId, next: Opt[]) {
    setItems((prev) => ({ ...prev, [id]: next }));
  }

  async function createItem(name: string, role?: string) {
    switch (activeId) {
      case "origins":
        return createOriginOption(name);
      case "qualities":
        return createQualityOption(name);
      case "ports":
        return createPortOption(name);
      case "saleExecutives":
        return createSaleExecutiveOption(name);
      case "cities":
        return createCityOption(name);
      case "states":
        return createStateOption(name);
      case "sectors":
        return createSectorOption(name);
      case "people": {
        const row = await createStaff({ name, role: role || null });
        return { id: row.id };
      }
    }
  }

  async function updateItem(id: string, name: string, role?: string) {
    switch (activeId) {
      case "origins":
        return updateOriginOption(id, name);
      case "qualities":
        return updateQualityOption(id, name);
      case "ports":
        return updatePortOption(id, name);
      case "saleExecutives":
        return updateSaleExecutiveOption(id, name);
      case "cities":
        return updateCityOption(id, name);
      case "states":
        return updateStateOption(id, name);
      case "sectors":
        return updateSectorOption(id, name);
      case "people":
        await updateStaff(id, { name, role: role || null });
        return { id };
    }
  }

  async function deleteItem(id: string) {
    switch (activeId) {
      case "origins":
        return deleteOriginOption(id);
      case "qualities":
        return deleteQualityOption(id);
      case "ports":
        return deletePortOption(id);
      case "saleExecutives":
        return deleteSaleExecutiveOption(id);
      case "cities":
        return deleteCityOption(id);
      case "states":
        return deleteStateOption(id);
      case "sectors":
        return deleteSectorOption(id);
      case "people":
        return deleteStaff(id);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const name = capitalizeName(draft);
    if (!name) return;
    const role = capitalizeName(roleDraft);

    startTransition(async () => {
      try {
        if (editing) {
          await updateItem(editing.id, name, role ?? undefined);
          if (activeId === "people") {
            setPeopleItems(
              peopleItems
                .map((item) =>
                  item.id === editing.id
                    ? { ...item, name, role }
                    : item,
                )
                .sort((a, b) => a.name.localeCompare(b.name)),
            );
          } else {
            setCategoryItems(
              activeId as SimpleCategoryId,
              items[activeId as SimpleCategoryId]
                .map((item) => (item.id === editing.id ? { ...item, name } : item))
                .sort((a, b) => a.name.localeCompare(b.name)),
            );
          }
          setEditing(null);
        } else {
          const { id } = await createItem(name, role ?? undefined);
          if (activeId === "people") {
            setPeopleItems(
              [...peopleItems, { id, name, role }].sort((a, b) =>
                a.name.localeCompare(b.name),
              ),
            );
          } else {
            setCategoryItems(
              activeId as SimpleCategoryId,
              [...items[activeId as SimpleCategoryId], { id, name }].sort((a, b) =>
                a.name.localeCompare(b.name),
              ),
            );
          }
        }
        setDraft("");
        setRoleDraft("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  async function onDelete(item: Opt | PeopleOpt) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteItem(item.id);
        if (activeId === "people") {
          setPeopleItems(peopleItems.filter((row) => row.id !== item.id));
        } else {
          setCategoryItems(
            activeId as SimpleCategoryId,
            items[activeId as SimpleCategoryId].filter((row) => row.id !== item.id),
          );
        }
        if (editing?.id === item.id) {
          setEditing(null);
          setDraft("");
          setRoleDraft("");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  function tabCount(id: CategoryId) {
    return id === "people" ? peopleItems.length : items[id].length;
  }

  return (
    <div className="options-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Options</h1>
          <p className="page-subtitle">
            Manage dropdown and suggestion lists used across the app.
          </p>
        </div>
      </div>

      <Modal open={error !== null} title="Message" onClose={() => setError(null)}>
        <p className="mb-4">{error}</p>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={() => setError(null)}>
            OK
          </button>
        </div>
      </Modal>

      <nav className="options-tabs" aria-label="Option categories">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`options-tab${activeId === category.id ? " options-tab-active" : ""}`}
            onClick={() => switchCategory(category.id)}
          >
            {category.label}
            <span className="options-tab-count">{tabCount(category.id)}</span>
          </button>
        ))}
      </nav>

      <section className="options-card">
        <div className="options-card-header">
          <div>
            <h2 className="options-card-title">{active.label}</h2>
            <p className="options-card-desc">{active.description}</p>
          </div>
          <label className="options-search-wrap">
            <span className="sr-only">Search {active.label}</span>
            <input
              type="search"
              className="field-input options-search-input"
              placeholder={`Search ${active.label.toLowerCase()}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        <form onSubmit={onSubmit} className="options-toolbar">
          <input
            required
            className="field-input"
            placeholder={editing ? `Edit ${active.label.toLowerCase()}` : active.placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              if (draft.trim()) setDraft(capitalizeName(draft) ?? draft);
            }}
          />
          {activeId === "people" && (
            <input
              className="field-input"
              placeholder="Role (optional)"
              value={roleDraft}
              onChange={(e) => setRoleDraft(e.target.value)}
              onBlur={() => {
                if (roleDraft.trim()) {
                  setRoleDraft(capitalizeName(roleDraft) ?? roleDraft);
                }
              }}
            />
          )}
          <button type="submit" className="btn" disabled={pending}>
            {editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditing(null);
                setDraft("");
                setRoleDraft("");
              }}
            >
              Cancel
            </button>
          )}
        </form>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                {activeId === "people" && <th>Role</th>}
                <th className="options-actions-col" />
              </tr>
            </thead>
            <tbody>
              {activeId === "people"
                ? filteredPeople.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.role ?? "—"}</td>
                      <td className="space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditing(item);
                            setDraft(item.name);
                            setRoleDraft(item.role ?? "");
                          }}
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
                  ))
                : filteredOptions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td className="space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditing(item);
                            setDraft(item.name);
                            setRoleDraft("");
                          }}
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
              {(activeId === "people" ? filteredPeople : filteredOptions).length ===
                0 && (
                <tr>
                  <td colSpan={activeId === "people" ? 3 : 2} className="options-empty">
                    {query.trim()
                      ? "No matches for your search."
                      : `No ${active.label.toLowerCase()} yet. Add one above.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
