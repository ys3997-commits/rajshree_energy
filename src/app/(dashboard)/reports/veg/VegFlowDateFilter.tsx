"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { capitalizeName } from "@/lib/domain/format";
import type { VegListRow } from "@/lib/actions/veg";
import {
  vegHref,
  type VegFlowSection,
} from "./vegHref";

export function VegFlowDateFilter({
  section,
  dateFrom,
  dateTo,
  party,
  type,
  vegs,
}: {
  section: VegFlowSection;
  dateFrom: string;
  dateTo: string;
  party: string;
  type: string;
  vegs: VegListRow[];
}) {
  const [partyId, setPartyId] = useState(party);
  const hasFilters = Boolean(
    dateFrom || dateTo || party || (section === "discount" && type),
  );

  const partyOptions = useMemo(
    () => [
      { value: "", label: "All veg contacts" },
      ...vegs.map((veg) => {
        const customer = capitalizeName(veg.customerName) ?? veg.customerName;
        const name = capitalizeName(veg.name) ?? veg.name;
        return {
          value: veg.id,
          label: `${customer} — ${name}`,
          group: customer,
        };
      }),
    ],
    [vegs],
  );

  return (
    <form className="sale-analysis-date-form" method="get">
      <input type="hidden" name="party" value={partyId} />
      <label>
        From
        <input
          type="date"
          name="dateFrom"
          defaultValue={dateFrom}
          max={dateTo || undefined}
        />
      </label>
      <label>
        To
        <input
          type="date"
          name="dateTo"
          defaultValue={dateTo}
          min={dateFrom || undefined}
        />
      </label>
      <label className="fund-flow-party-filter">
        Veg
        <SearchableSelect
          className="field-input"
          ariaLabel="Veg contact"
          placeholder="Search customer or veg"
          value={partyId}
          onChange={setPartyId}
          options={partyOptions}
        />
      </label>
      {section === "discount" ? (
        <label>
          Type
          <select name="type" defaultValue={type} className="field-input">
            <option value="">All types</option>
            <option value="received">Discount Received</option>
            <option value="paid">Discount Paid</option>
          </select>
        </label>
      ) : null}
      <button type="submit" className="btn">
        Apply
      </button>
      {hasFilters && (
        <Link href={vegHref({ section })} className="btn-link">
          Clear
        </Link>
      )}
    </form>
  );
}
