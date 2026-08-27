import { capitalizeName, formatIndianNumber } from "@/lib/domain/format";

/** Digits-only WhatsApp phone (E.164 without +). Defaults 10-digit Indian numbers to 91. */
export function toWhatsAppPhone(
  contact: string | null | undefined,
): string | null {
  if (!contact?.trim()) return null;
  let digits = contact.replace(/\D/g, "");
  if (!digits) return null;
  digits = digits.replace(/^0+/, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 11 || digits.length > 15) return null;
  return digits;
}

/** WhatsApp reminders are only for Rajshree Energy dealing-company rows. */
export function isRajshreeEnergyDealingCompany(
  dealingCompany: string | null | undefined,
): boolean {
  const normalized = dealingCompany?.trim().toLowerCase().replace(/\s+/g, " ");
  return normalized === "rajshree energy";
}

function formatRupeeAmount(
  value: { toString(): string } | number | string | null | undefined,
): string {
  if (value == null || value === "") return "₹0";
  const n = Number(typeof value === "string" ? value : value.toString());
  if (!Number.isFinite(n)) return "₹0";
  return `₹${formatIndianNumber(Math.round(n))}`;
}

/** Pre-filled collection reminder for WhatsApp (click-to-chat). */
export function buildCollectionWhatsAppMessage(input: {
  paymentInChargeName: string | null | undefined;
  due: string;
  overdue: string;
}): string {
  const rawName = input.paymentInChargeName?.trim();
  const name = rawName
    ? (capitalizeName(rawName) ?? rawName)
    : "Sir";
  const totalDue = formatRupeeAmount(input.due);
  const overdue = formatRupeeAmount(input.overdue);

  return [
    `Dear *Sri ${name}*,`,
    "",
    `Your total outstanding amount is *${totalDue}*. Out of this, *${overdue}* is overdue.`,
    "",
    "We are requesting you to make program for fund.",
    "",
    "Regards,",
    "*Rajshree Energy*",
  ].join("\n");
}

export function collectionWhatsAppDisabledReason(input: {
  dealingCompany: string | null | undefined;
  paymentInChargeContact: string | null | undefined;
}): string | null {
  if (!isRajshreeEnergyDealingCompany(input.dealingCompany)) {
    return "WhatsApp is only available when dealing company is Rajshree Energy.";
  }
  if (!toWhatsAppPhone(input.paymentInChargeContact)) {
    return "Add payment-in-charge contact in Customers before sending WhatsApp.";
  }
  return null;
}

export function collectionWhatsAppLinks(input: {
  paymentInChargeName: string | null | undefined;
  paymentInChargeContact: string | null | undefined;
  dealingCompany: string | null | undefined;
  due: string;
  overdue: string;
}): { app: string; web: string } | null {
  if (collectionWhatsAppDisabledReason(input)) return null;
  const phone = toWhatsAppPhone(input.paymentInChargeContact);
  if (!phone) return null;
  const text = encodeURIComponent(buildCollectionWhatsAppMessage(input));
  return {
    // Desktop / mobile app — no App vs Web chooser page.
    app: `whatsapp://send?phone=${phone}&text=${text}`,
    // WhatsApp Web — used when the app does not hand off.
    web: `https://web.whatsapp.com/send?phone=${phone}&text=${text}`,
  };
}

/** Reuse one browser tab/window for all collection WhatsApp Web sends. */
export const COLLECTION_WHATSAPP_WEB_WINDOW = "rajshree_collection_whatsapp_web";

let collectionWhatsAppWebTab: Window | null = null;

/** Open (or reuse) the WhatsApp Web compose tab for this message. */
export function openCollectionWhatsAppWeb(webUrl: string): Window | null {
  if (typeof window === "undefined") return null;

  // Prefer navigating an existing tab we opened — named targets alone often
  // fail after WhatsApp Web redirects, which opened a new tab each click.
  if (collectionWhatsAppWebTab && !collectionWhatsAppWebTab.closed) {
    try {
      collectionWhatsAppWebTab.location.href = webUrl;
      collectionWhatsAppWebTab.focus();
      return collectionWhatsAppWebTab;
    } catch {
      collectionWhatsAppWebTab = null;
    }
  }

  collectionWhatsAppWebTab = window.open(
    webUrl,
    COLLECTION_WHATSAPP_WEB_WINDOW,
  );
  collectionWhatsAppWebTab?.focus();
  return collectionWhatsAppWebTab;
}

/** App deep link (whatsapp://). Prefer collectionWhatsAppLinks when Web is needed. */
export function collectionWhatsAppUrl(
  input: Parameters<typeof collectionWhatsAppLinks>[0],
): string | null {
  return collectionWhatsAppLinks(input)?.app ?? null;
}
