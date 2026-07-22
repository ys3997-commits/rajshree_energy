"use client";

import { formatQualityClass } from "@/lib/domain/format";

export type QualityClassOpt = {
  id: string;
  domestic: boolean;
  origin: { name: string };
  qualityOption: { name: string };
};

export function QualityClassSelect({
  name = "qualityClassId",
  value,
  onChange,
  options,
  required,
  allowEmpty = true,
  emptyLabel = "Select",
}: {
  name?: string;
  value: string;
  onChange: (id: string) => void;
  options: QualityClassOpt[];
  required?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
}) {
  return (
    <select
      name={name}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {options.map((qc) => (
        <option key={qc.id} value={qc.id}>
          {formatQualityClass(qc)}
        </option>
      ))}
    </select>
  );
}
