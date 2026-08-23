export type PaymentPartyKind = "customer" | "transporter";

export type PaymentParty = {
  kind: PaymentPartyKind;
  id: string;
};

export function parsePaymentParty(input: {
  customerId?: string | null;
  transporterId?: string | null;
}): PaymentParty {
  const customerId = input.customerId?.trim() || "";
  const transporterId = input.transporterId?.trim() || "";
  if (customerId && transporterId) {
    throw new Error("Select a customer or a transporter, not both");
  }
  if (customerId) return { kind: "customer", id: customerId };
  if (transporterId) return { kind: "transporter", id: transporterId };
  throw new Error("Customer or transporter is required");
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
  throw new Error("Customer or transporter is required");
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
