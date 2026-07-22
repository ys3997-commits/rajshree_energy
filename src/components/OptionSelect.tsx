"use client";

import { useMemo } from "react";

type OptionSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  emptyLabel?: string;
  required?: boolean;
};

export function OptionSelect({
  value,
  onChange,
  options,
  emptyLabel = "Select",
  required,
}: OptionSelectProps) {
  const merged = useMemo(() => {
    const names = [...options];
    if (value && !names.includes(value)) {
      return [value, ...names];
    }
    return names;
  }, [options, value]);

  return (
    <select
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{emptyLabel}</option>
      {merged.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}
