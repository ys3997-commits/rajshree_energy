import { AGEING_BUCKETS, type AgeingBucketKey } from "@/lib/domain/ageingBuckets";
import {
  collectionWhatsAppDisabledReason,
  toWhatsAppPhone,
  type CollectionWhatsAppRecipient,
} from "@/lib/domain/collectionWhatsApp";
import { capitalizeName, formatIndianNumber } from "@/lib/domain/format";

function formatRupeeAmount(
  value: { toString(): string } | number | string | null | undefined,
): string {
  if (value == null || value === "") return "₹0";
  const n = Number(typeof value === "string" ? value : value.toString());
  if (!Number.isFinite(n)) return "₹0";
  return `₹${formatIndianNumber(Math.round(n))}`;
}

function formatCreditPeriodLabel(
  days: number | null | undefined,
): string {
  if (days == null || !Number.isFinite(days)) return "—";
  const n = Math.round(days);
  return `${formatIndianNumber(n)} ${n === 1 ? "Day" : "Days"}`;
}

function formatAgeingBucketLabel(label: string): string {
  return label.replace(/days/i, "Days");
}

function ageingBucketLines(
  buckets: Record<AgeingBucketKey, string>,
): string[] {
  const lines: string[] = [];
  for (const bucket of AGEING_BUCKETS) {
    const n = Number(buckets[bucket.key]);
    if (!Number.isFinite(n) || n === 0) continue;
    lines.push(
      `• ${formatAgeingBucketLabel(bucket.label)}: ${formatRupeeAmount(n)}`,
    );
  }
  return lines;
}

export type AgeingWhatsAppRecipient = CollectionWhatsAppRecipient;

export type AgeingWhatsAppInput = {
  recipientName: string | null | undefined;
  recipientContact: string | null | undefined;
  dealingCompany: string | null | undefined;
  totalDue: string;
  overdue: string;
  creditDays: number | null | undefined;
  buckets: Record<AgeingBucketKey, string>;
  recipient?: AgeingWhatsAppRecipient;
  canMessageOwner?: boolean;
};

/** Pre-filled ageing reminder for WhatsApp (click-to-chat). */
export function buildAgeingWhatsAppMessage(input: {
  recipientName: string | null | undefined;
  totalDue: string;
  overdue: string;
  creditDays: number | null | undefined;
  buckets: Record<AgeingBucketKey, string>;
}): string {
  const rawName = input.recipientName?.trim();
  const name = rawName ? (capitalizeName(rawName) ?? rawName) : "Sir";
  const ageingLines = ageingBucketLines(input.buckets);

  return [
    `Hello *Sri ${name}*,`,
    "",
    "We hope you are doing well. We kindly request your attention to the overdue amount.",
    "",
    `Total Due: ${formatRupeeAmount(input.totalDue)}`,
    `Overdue: ${formatRupeeAmount(input.overdue)}`,
    `Credit Period: ${formatCreditPeriodLabel(input.creditDays)}`,
    "",
    "*Outstanding Ageing:*",
    ...ageingLines,
    "",
    "We sincerely request you to make program for fund of the overdue amount at the earliest. Your prompt support will be highly appreciated.",
    "",
    "Thank you for your continued trust and cooperation.",
    "",
    "Warm regards,",
    "*Rajshree Energy*",
  ].join("\n");
}

export function ageingWhatsAppDisabledReason(
  input: AgeingWhatsAppInput,
): string | null {
  return collectionWhatsAppDisabledReason({
    recipientName: input.recipientName,
    recipientContact: input.recipientContact,
    dealingCompany: input.dealingCompany,
    due: input.totalDue,
    overdue: input.overdue,
    recipient: input.recipient,
    canMessageOwner: input.canMessageOwner,
  });
}

export function ageingWhatsAppLinks(
  input: AgeingWhatsAppInput,
): { app: string; web: string } | null {
  if (ageingWhatsAppDisabledReason(input)) return null;
  const phone = toWhatsAppPhone(input.recipientContact);
  if (!phone) return null;
  const text = encodeURIComponent(buildAgeingWhatsAppMessage(input));
  return {
    app: `whatsapp://send?phone=${phone}&text=${text}`,
    web: `https://web.whatsapp.com/send?phone=${phone}&text=${text}`,
  };
}
