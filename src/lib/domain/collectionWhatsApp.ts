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

export function collectionWhatsAppUrl(input: {
  paymentInChargeName: string | null | undefined;
  paymentInChargeContact: string | null | undefined;
  dealingCompany: string | null | undefined;
  due: string;
  overdue: string;
}): string | null {
  if (collectionWhatsAppDisabledReason(input)) return null;
  const phone = toWhatsAppPhone(input.paymentInChargeContact);
  if (!phone) return null;
  const text = buildCollectionWhatsAppMessage(input);
  // Use the WhatsApp protocol so the OS opens the installed app / handler
  // directly — skips the wa.me "App vs WhatsApp Web" chooser page.
  return `whatsapp://send?phone=${phone}&text=${encodeURIComponent(text)}`;
}

/**
 * Watches whether a whatsapp:// navigation handed off to the OS.
 * Call this from the click handler without preventDefault so the browser
 * opens WhatsApp at native speed; onUnavailable runs only if handoff fails.
 *
 * Uses a longer window + a second focus check so a slow Desktop handoff
 * does not flash "Open WhatsApp First" after WhatsApp already opened.
 */
export function watchWhatsAppHandoff(
  onUnavailable: () => void,
  timeoutMs = 2500,
): void {
  if (typeof window === "undefined") return;

  let settled = false;
  let timeoutId = 0;
  let verifyId = 0;

  const cleanup = () => {
    window.removeEventListener("blur", onHandedOff);
    window.removeEventListener("pagehide", onHandedOff);
    document.removeEventListener("visibilitychange", onVisibility);
  };

  const finishHandedOff = () => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timeoutId);
    window.clearTimeout(verifyId);
    cleanup();
  };

  const onHandedOff = () => finishHandedOff();
  const onVisibility = () => {
    if (document.hidden) finishHandedOff();
  };

  window.addEventListener("blur", onHandedOff);
  window.addEventListener("pagehide", onHandedOff);
  document.addEventListener("visibilitychange", onVisibility);

  timeoutId = window.setTimeout(() => {
    if (settled) return;
    // Blur often arrives a moment after WhatsApp opens — confirm before warning.
    verifyId = window.setTimeout(() => {
      if (settled) return;
      if (!document.hasFocus() || document.hidden) {
        finishHandedOff();
        return;
      }
      settled = true;
      cleanup();
      onUnavailable();
    }, 400);
  }, timeoutMs);
}
