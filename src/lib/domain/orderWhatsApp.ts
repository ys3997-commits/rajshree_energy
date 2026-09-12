import { capitalizeName, formatIndianNumber } from "@/lib/domain/format";
import { saleTcsApplies } from "@/lib/domain/saleRate";
import { toWhatsAppPhone } from "@/lib/domain/collectionWhatsApp";

export type OrderWhatsAppInput = {
  purchaserName: string | null | undefined;
  purchaserContact: string | null | undefined;
  customerCategory: string | null | undefined;
  numberOfLorries: number | null | undefined;
  quantity: string | number | null | undefined;
  rate: string | number | null | undefined;
  deliveryTerms: string | null | undefined;
  portName: string | null | undefined;
  creditDays: number | null | undefined;
};

function formatPurchaserName(
  purchaserName: string | null | undefined,
): string {
  const rawName = purchaserName?.trim();
  return rawName ? (capitalizeName(rawName) ?? rawName) : "Sir";
}

function parsePositiveNumber(
  value: string | number | null | undefined,
): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function formatQuantity(input: OrderWhatsAppInput): string | null {
  if (input.numberOfLorries != null && input.numberOfLorries > 0) {
    const count = formatIndianNumber(input.numberOfLorries);
    return `${count} ${input.numberOfLorries === 1 ? "Truck" : "Trucks"}`;
  }
  const qty = parsePositiveNumber(input.quantity);
  if (qty == null) return null;
  const amount = Number.isInteger(qty)
    ? formatIndianNumber(qty)
    : formatIndianNumber(qty, 2);
  return `${amount} MT`;
}

function formatRate(input: OrderWhatsAppInput): string | null {
  const rate = parsePositiveNumber(input.rate);
  if (rate == null) return null;
  const basic = `₹${formatIndianNumber(Math.round(rate))}`;
  if (saleTcsApplies(input.customerCategory)) {
    return `${basic} + GST + TCS`;
  }
  return `${basic} + GST`;
}

function formatExPortDelivery(
  portName: string | null | undefined,
): string | null {
  const raw = portName?.trim();
  if (!raw) return null;
  const withPort = /port$/i.test(raw) ? raw : `${raw} Port`;
  return `Ex-${withPort}`;
}

function formatDelivery(input: OrderWhatsAppInput): string | null {
  if (input.deliveryTerms === "FOR") return "FOR at your Factory";
  if (input.deliveryTerms === "EX_PORT") {
    return formatExPortDelivery(input.portName);
  }
  return null;
}

function formatPayment(creditDays: number | null | undefined): string | null {
  if (creditDays == null || !Number.isFinite(creditDays) || creditDays < 0) {
    return null;
  }
  const days = formatIndianNumber(creditDays);
  return `${days} ${creditDays === 1 ? "Day" : "Days"}`;
}

/** Pre-filled sale-order acceptance for WhatsApp (click-to-chat). */
export function buildOrderWhatsAppMessage(input: OrderWhatsAppInput): string {
  const name = formatPurchaserName(input.purchaserName);
  const quantity = formatQuantity(input) ?? "—";
  const rate = formatRate(input) ?? "—";
  const delivery = formatDelivery(input) ?? "—";
  const payment = formatPayment(input.creditDays) ?? "—";

  return [
    `Hello *Sri ${name}*,`,
    "",
    "Thank you for the order. We are pleased to accept the order on the following terms:",
    "",
    `• *Quantity*: ${quantity}`,
    `• *Rate*: ${rate}`,
    `• *Delivery*: ${delivery}`,
    `• *Payment*: ${payment}`,
    "",
    "We sincerely appreciate your trust and continued support.",
    "",
    "Regards,",
    "*Rajshree Energy*",
  ].join("\n");
}

export function orderWhatsAppDisabledReason(
  input: OrderWhatsAppInput,
): string | null {
  if (!toWhatsAppPhone(input.purchaserContact)) {
    return "Add purchaser contact in Customers before sending WhatsApp.";
  }
  if (!input.customerCategory?.trim()) {
    return "Set customer category before sending WhatsApp.";
  }
  if (!formatQuantity(input)) {
    return "Add number of lorries or order quantity before sending WhatsApp.";
  }
  if (!formatRate(input)) {
    return "Add basic rate before sending WhatsApp.";
  }
  if (input.deliveryTerms !== "FOR" && input.deliveryTerms !== "EX_PORT") {
    return "Set delivery term before sending WhatsApp.";
  }
  if (input.deliveryTerms === "EX_PORT" && !formatExPortDelivery(input.portName)) {
    return "Set port before sending WhatsApp for Ex-Port orders.";
  }
  if (formatPayment(input.creditDays) == null) {
    return "Add credit period before sending WhatsApp.";
  }
  return null;
}

export function orderWhatsAppLinks(
  input: OrderWhatsAppInput,
): { app: string; web: string } | null {
  if (orderWhatsAppDisabledReason(input)) return null;
  const phone = toWhatsAppPhone(input.purchaserContact);
  if (!phone) return null;
  const text = encodeURIComponent(buildOrderWhatsAppMessage(input));
  return {
    app: `whatsapp://send?phone=${phone}&text=${text}`,
    web: `https://web.whatsapp.com/send?phone=${phone}&text=${text}`,
  };
}
