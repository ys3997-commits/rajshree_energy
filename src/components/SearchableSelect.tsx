"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export type SearchableSelectOption = {
  value: string;
  label: string;
  group?: string;
};

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Search",
  ariaLabel,
  form,
  required,
  className = "field-input",
}: {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  form?: string;
  required?: boolean;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query]);

  const groups = useMemo(() => {
    const order: string[] = [];
    const byGroup = new Map<string, SearchableSelectOption[]>();
    for (const option of filtered) {
      const group = option.group ?? "";
      if (!byGroup.has(group)) {
        byGroup.set(group, []);
        order.push(group);
      }
      byGroup.get(group)!.push(option);
    }
    return order.map((name) => ({ name, options: byGroup.get(name)! }));
  }, [filtered]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  function openList() {
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
  }

  function pick(option: SearchableSelectOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setQuery("");
      return;
    }
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      event.preventDefault();
      openList();
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) pick(option);
    }
  }

  const displayValue = open ? query : (selected?.label ?? "");

  return (
    <div ref={rootRef} className="search-select">
      <input
        ref={inputRef}
        type="text"
        form={form}
        required={required && !value}
        className={className}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        placeholder={placeholder}
        autoComplete="off"
        value={displayValue}
        onFocus={openList}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {open ? (
        <ul className="search-select-menu" role="listbox">
          {filtered.length === 0 ? (
            <li className="search-select-empty">No matches</li>
          ) : (
            groups.map((group) => (
              <li key={group.name || "options"}>
                {group.name ? (
                  <div className="search-select-group">{group.name}</div>
                ) : null}
                <ul>
                  {group.options.map((option) => {
                    const index = filtered.indexOf(option);
                    const active = index === activeIndex;
                    return (
                      <li key={option.value}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={option.value === value}
                          className={
                            active
                              ? "search-select-option search-select-option-active"
                              : "search-select-option"
                          }
                          onMouseEnter={() => setActiveIndex(index)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pick(option)}
                        >
                          {option.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
