"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import {
  createCityOption,
  createDealingCompanyOption,
  createOwnerOption,
  createSaleExecutiveOption,
  createSectorOption,
  deleteCityOption,
  deleteDealingCompanyOption,
  deleteOwnerOption,
  deleteSaleExecutiveOption,
  deleteSectorOption,
  updateCityOption,
  updateDealingCompanyOption,
  updateOwnerOption,
  updateSaleExecutiveOption,
  updateSectorOption,
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
import { Modal } from "@/components/Modal";
import { capitalizeName } from "@/lib/domain/format";
import { INDIAN_STATES_AND_UTS } from "@/lib/domain/indianStates";
import { PeopleManager, type PeopleRow } from "./PeopleManager";
import {
  categoryMeta,
  type CategoryId,
} from "./optionsCategories";

type Opt = { id: string; name: string };
type PortOpt = Opt & { state: string };
type CityOpt = Opt & { state: string };

type SimpleCategoryId = Exclude<CategoryId, "people">;
type ItemMap = {
  origins: Opt[];
  qualities: Opt[];
  ports: PortOpt[];
  saleExecutives: Opt[];
  cities: CityOpt[];
  sectors: Opt[];
  owners: Opt[];
  dealingCompanies: Opt[];
};

export function OptionsClient({
  categoryId,
  origins,
  qualities,
  ports,
  saleExecutives,
  cities,
  sectors,
  people,
  owners,
  dealingCompanies,
}: {
  categoryId: CategoryId;
  origins: Opt[];
  qualities: Opt[];
  ports: PortOpt[];
  saleExecutives: Opt[];
  cities: CityOpt[];
  sectors: Opt[];
  people: PeopleRow[];
  owners: Opt[];
  dealingCompanies: Opt[];
}) {
  const [items, setItems] = useState<ItemMap>({
    origins,
    qualities,
    ports,
    saleExecutives,
    cities,
    sectors,
    owners,
    dealingCompanies,
  });
  const [peopleItems, setPeopleItems] = useState(people);
  const activeId = categoryId;
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [stateDraft, setStateDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [editStateDraft, setEditStateDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const hasStateColumn = activeId === "ports" || activeId === "cities";

  const active = categoryMeta(activeId);

  const filteredOptions = useMemo(() => {
    if (activeId === "people") return [];
    const q = query.trim().toLowerCase();
    const sorted = [...items[activeId]].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;
    if (activeId === "ports" || activeId === "cities") {
      return (sorted as PortOpt[]).filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q),
      );
    }
    return sorted.filter((item) => item.name.toLowerCase().includes(q));
  }, [activeId, items, query]);

  function cancelEdit() {
    setEditingId(null);
    setEditDraft("");
    setEditStateDraft("");
  }

  function startEdit(item: Opt | PortOpt | CityOpt) {
    // Defer so the Edit click is not delivered to Update/Cancel, which
    // appear in the same place and would close edit mode immediately.
    window.setTimeout(() => {
      setEditingId(item.id);
      setEditDraft(item.name);
      if (activeId === "ports" || activeId === "cities") {
        setEditStateDraft((item as PortOpt | CityOpt).state);
      } else {
        setEditStateDraft("");
      }
      setError(null);
    }, 0);
  }

  function setCategoryItems<K extends SimpleCategoryId>(
    id: K,
    next: ItemMap[K],
  ) {
    setItems((prev) => ({ ...prev, [id]: next }));
  }

  async function createItem(name: string, role?: string, state?: string) {
    switch (activeId) {
      case "origins":
        return createOriginOption(name);
      case "qualities":
        return createQualityOption(name);
      case "ports":
        if (!state) throw new Error("Port state is required");
        return createPortOption(name, state);
      case "saleExecutives":
        return createSaleExecutiveOption(name);
      case "cities":
        if (!state) throw new Error("State is required");
        return createCityOption(name, state);
      case "sectors":
        return createSectorOption(name);
      case "owners":
        return createOwnerOption(name);
      case "dealingCompanies":
        return createDealingCompanyOption(name);
      case "people":
        throw new Error("Use Add person");
    }
  }

  async function updateItem(id: string, name: string, role?: string, state?: string) {
    switch (activeId) {
      case "origins":
        return updateOriginOption(id, name);
      case "qualities":
        return updateQualityOption(id, name);
      case "ports":
        if (!state) throw new Error("Port state is required");
        return updatePortOption(id, name, state);
      case "saleExecutives":
        return updateSaleExecutiveOption(id, name);
      case "cities":
        if (!state) throw new Error("State is required");
        return updateCityOption(id, name, state);
      case "sectors":
        return updateSectorOption(id, name);
      case "owners":
        return updateOwnerOption(id, name);
      case "dealingCompanies":
        return updateDealingCompanyOption(id, name);
      case "people":
        throw new Error("Use Edit on the person row");
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
      case "sectors":
        return deleteSectorOption(id);
      case "owners":
        return deleteOwnerOption(id);
      case "dealingCompanies":
        return deleteDealingCompanyOption(id);
      case "people":
        throw new Error("Use Delete on the person row");
    }
  }

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const name = capitalizeName(draft);
    if (!name) return;
    const state = capitalizeName(stateDraft);
    if (activeId === "ports" && !state) {
      setError("Port state is required");
      return;
    }
    if (activeId === "cities" && !state) {
      setError("State is required");
      return;
    }

    startTransition(async () => {
      try {
        const { id } = await createItem(name, undefined, state ?? undefined);
        if (activeId === "ports") {
          setCategoryItems(
            "ports",
            [...items.ports, { id, name, state: state! }].sort((a, b) =>
              a.name.localeCompare(b.name),
            ),
          );
        } else if (activeId === "cities") {
          setCategoryItems(
            "cities",
            [...items.cities, { id, name, state: state! }].sort((a, b) =>
              a.name.localeCompare(b.name),
            ),
          );
        } else {
          setCategoryItems(
            activeId as Exclude<SimpleCategoryId, "ports" | "cities">,
            [
              ...items[activeId as Exclude<SimpleCategoryId, "ports" | "cities">],
              { id, name },
            ].sort((a, b) => a.name.localeCompare(b.name)),
          );
        }
        setDraft("");
        setStateDraft("");
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
    const state = capitalizeName(editStateDraft);
    if (activeId === "ports" && !state) {
      setError("Port state is required");
      return;
    }
    if (activeId === "cities" && !state) {
      setError("State is required");
      return;
    }

    const id = editingId;
    startTransition(async () => {
      try {
        await updateItem(id, name, undefined, state ?? undefined);
        if (activeId === "ports") {
          setCategoryItems(
            "ports",
            items.ports
              .map((item) =>
                item.id === id ? { ...item, name, state: state! } : item,
              )
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
        } else if (activeId === "cities") {
          setCategoryItems(
            "cities",
            items.cities
              .map((item) =>
                item.id === id ? { ...item, name, state: state! } : item,
              )
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
        } else {
          setCategoryItems(
            activeId as Exclude<SimpleCategoryId, "ports" | "cities">,
            items[activeId as Exclude<SimpleCategoryId, "ports" | "cities">]
              .map((item) => (item.id === id ? { ...item, name } : item))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
        }
        cancelEdit();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  async function onDelete(item: Opt) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteItem(item.id);
        setCategoryItems(
          activeId as SimpleCategoryId,
          items[activeId as SimpleCategoryId].filter((row) => row.id !== item.id),
        );
        if (editingId === item.id) cancelEdit();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  return (
    <div className="options-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{active.label}</h1>
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

      <section className="options-card">
        <div className="options-card-header">
          <div>
            {active.description ? (
              <p className="options-card-desc">{active.description}</p>
            ) : null}
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

        {activeId === "people" ? (
          <PeopleManager
            people={peopleItems}
            saleExecutives={items.saleExecutives}
            query={query}
            onChange={setPeopleItems}
          />
        ) : (
          <>
        <form onSubmit={onAdd} className="options-toolbar">
          <input
            required
            className="field-input"
            placeholder={active.placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              if (draft.trim()) setDraft(capitalizeName(draft) ?? draft);
            }}
            disabled={pending || editingId != null}
          />
          {activeId === "ports" && (
            <select
              required
              className="field-input"
              value={stateDraft}
              onChange={(e) => setStateDraft(e.target.value)}
              disabled={pending || editingId != null}
            >
              <option value="">Select GST state</option>
              {INDIAN_STATES_AND_UTS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
          {activeId === "cities" && (
            <select
              required
              className="field-input"
              value={stateDraft}
              onChange={(e) => setStateDraft(e.target.value)}
              disabled={pending || editingId != null}
            >
              <option value="">Select state</option>
              {INDIAN_STATES_AND_UTS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            className="btn"
            disabled={pending || editingId != null}
          >
            Add
          </button>
        </form>

        <div className="table-wrap">
          <div className="table-h-scroll"><table className="data">
            <thead>
              <tr>
                <th>Name</th>
                {activeId === "ports" && <th>GST state</th>}
                {activeId === "cities" && <th>State</th>}
                <th className="options-actions-col" />
              </tr>
            </thead>
            <tbody>
              {filteredOptions.map((item) => {
                const isEditing = editingId === item.id;
                const stateRow = item as PortOpt | CityOpt;
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
                        {hasStateColumn && (
                          <td>
                            <select
                              required
                              className="field-input"
                              aria-label={
                                activeId === "ports" ? "GST state" : "State"
                              }
                              value={editStateDraft}
                              onChange={(e) => setEditStateDraft(e.target.value)}
                            >
                              <option value="">
                                {activeId === "ports"
                                  ? "Select GST state"
                                  : "Select state"}
                              </option>
                              {INDIAN_STATES_AND_UTS.map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          </td>
                        )}
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
                        {hasStateColumn && (
                          <td>{stateRow.state || "—"}</td>
                        )}
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
              {filteredOptions.length === 0 && (
                <tr>
                  <td
                    colSpan={hasStateColumn ? 3 : 2}
                    className="options-empty"
                  >
                    {query.trim()
                      ? "No matches for your search."
                      : `No ${active.label.toLowerCase()} yet. Add one above.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table></div>
        </div>
          </>
        )}
      </section>
    </div>
  );
}
