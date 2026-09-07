export type PaymentPartyKind = "customer" | "transporter" | "investment";

export type PaymentParty = {
  kind: PaymentPartyKind;
  id: string;
};

export function parsePaymentParty(input: {
  customerId?: string | null;
  transporterId?: string | null;
  investmentCompanyId?: string | null;
}): PaymentParty {
  const customerId = input.customerId?.trim() || "";
  const transporterId = input.transporterId?.trim() || "";
  const investmentCompanyId = input.investmentCompanyId?.trim() || "";
  const selected = [customerId, transporterId, investmentCompanyId].filter(
    Boolean,
  );
  if (selected.length > 1) {
    throw new Error("Select only one party");
  }
  if (customerId) return { kind: "customer", id: customerId };
  if (transporterId) return { kind: "transporter", id: transporterId };
  if (investmentCompanyId) {
    return { kind: "investment", id: investmentCompanyId };
  }
  throw new Error("Customer, transporter, or investment company is required");
}

export function partyKey(kind: PaymentPartyKind, id: string): string {
  return `${kind}:${id}`;
}

export function parsePartyKey(value: string): PaymentParty {
  const trimmed = value.trim();
  if (trimmed.startsWith("customer:")) {
    return parsePaymentParty({
      customerId: trimmed.slice("customer:".length),
    });
  }
  if (trimmed.startsWith("transporter:")) {
    return parsePaymentParty({
      transporterId: trimmed.slice("transporter:".length),
    });
  }
  if (trimmed.startsWith("investment:")) {
    return parsePaymentParty({
      investmentCompanyId: trimmed.slice("investment:".length),
    });
  }
  throw new Error("Customer, transporter, or investment company is required");
}

export function tryParsePartyKey(value?: string | null): PaymentParty | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  try {
    return parsePartyKey(trimmed);
  } catch {
    return null;
  }
}

export function partyOptionLabel(party: {
  kind: PaymentPartyKind;
  name: string;
  categoryLabel?: string;
}): string {
  if (party.kind === "transporter") return `${party.name} — Transporter`;
  if (party.kind === "investment") {
    return `${party.name} — Investment`;
  }
  return party.categoryLabel
    ? `${party.name} — ${party.categoryLabel}`
    : party.name;
}

export function partyOptionGroup(kind: PaymentPartyKind): string {
  if (kind === "transporter") return "Transporters";
  if (kind === "investment") return "Investment companies";
  return "Customers";
}
