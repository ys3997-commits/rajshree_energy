"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CustomerCategory } from "@/generated/prisma";
import { SearchableSelect } from "@/components/SearchableSelect";
import { formatCustomerCategory } from "@/lib/domain/format";
import { partyKey } from "@/lib/domain/paymentParty";
import { paymentsHref, type PaymentsSection } from "./paymentsHref";

type PartyOpt = {
  id: string;
  name: string;
  kind: "customer" | "transporter";
  category?: CustomerCategory;
};

export function FundFlowDateFilter({
  section,
  dateFrom,
  dateTo,
  party,
  type,
  parties,
}: {
  section: PaymentsSection;
  dateFrom: string;
  dateTo: string;
  party: string;
  type: string;
  parties: PartyOpt[];
}) {
  const [partyId, setPartyId] = useState(party);
  const hasFilters = Boolean(dateFrom || dateTo || party || type);

  const partyOptions = useMemo(
    () => [
      { value: "", label: "All customers / transporters" },
      ...parties.map((c) => ({
        value: partyKey(c.kind, c.id),
        label:
          c.kind === "transporter"
            ? `${c.name} — Transporter`
            : `${c.name} — ${formatCustomerCategory(c.category)}`,
        group: c.kind === "transporter" ? "Transporters" : "Customers",
      })),
    ],
    [parties],
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
        Customer
        <SearchableSelect
          className="field-input"
          ariaLabel="Customer or transporter"
          placeholder="Search customer or transporter"
          value={partyId}
          onChange={setPartyId}
          options={partyOptions}
        />
      </label>
      <label>
        Type
        <select name="type" defaultValue={type} className="field-input">
          <option value="">All types</option>
          {section === "discount" ? (
            <>
              <option value="received">Discount Received</option>
              <option value="paid">Discount Paid</option>
            </>
          ) : (
            <>
              <option value="received">Fund Received</option>
              <option value="paid">Fund Paid</option>
            </>
          )}
        </select>
      </label>
      <button type="submit" className="btn">
        Apply
      </button>
      {hasFilters && (
        <Link href={paymentsHref({ section })} className="btn-link">
          Clear
        </Link>
      )}
    </form>
  );
}
