import { capitalizeName, formatIndianNumber } from "@/lib/domain/format";
import { toWhatsAppPhone } from "@/lib/domain/collectionWhatsApp";

export type SalesSmsTypeValue = "DELIVERED" | "EX_PORT" | "REQUIREMENT";

function formatCustomerName(
  customerName: string | null | undefined,
): string {
  const rawName = customerName?.trim();
  return rawName ? (capitalizeName(rawName) ?? rawName) : "Sir";
}

function formatOfferRupee(
  value: string | number | null | undefined,
): string | null {
  if (value == null || value === "") return null;
  const n = Number(typeof value === "string" ? value : value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `₹${formatIndianNumber(Math.round(n))}`;
}

/** Pre-filled sales follow-up for WhatsApp (click-to-chat). */
export function buildSalesWhatsAppMessage(input: {
  purchaserName: string | null | undefined;
  smsType: SalesSmsTypeValue | null | undefined;
  offerPrice: string | null | undefined;
  offerFreight: string | null | undefined;
}): string {
  const name = formatCustomerName(input.purchaserName);
  const offerPrice = formatOfferRupee(input.offerPrice);
  const offerFreight = formatOfferRupee(input.offerFreight);
  const coalOffer = "High GCV Indonesian coal";

  if (input.smsType === "DELIVERED") {
    return [
      `Hello *Sri ${name}*,`,
      "",
      `Just sharing our offer for ${coalOffer} at ${offerPrice} + GST per MT, delivered to your factory.`,
      "",
      "Please have a look and share your feedback.",
      "",
      "Regards,",
      "*Rajshree Energy*",
    ].join("\n");
  }

  if (input.smsType === "EX_PORT") {
    return [
      `Dear *Sri ${name}*,`,
      "",
      `Just sharing our offer for ${coalOffer} at ${offerPrice} + GST per MT, Ex-Haldia Port. Freight is approx ${offerFreight} per MT.`,
      "",
      "Please have a look and share your feedback.",
      "",
      "Regards,",
      "*Rajshree Energy*",
    ].join("\n");
  }

  return [
    `Dear *Shri ${name}*,`,
    "",
    "Just wanted to check if you have any coal requirement coming up.",
    "",
    "Please share your requirement with us and we will be happy to work out our best possible rate.",
    "",
    "Regards,",
    "*Rajshree Energy*",
  ].join("\n");
}

export function salesWhatsAppDisabledReason(input: {
  purchaserContact: string | null | undefined;
  smsType: SalesSmsTypeValue | null | undefined;
  offerPrice: string | null | undefined;
  offerFreight: string | null | undefined;
}): string | null {
  if (!toWhatsAppPhone(input.purchaserContact)) {
    return "Add purchaser contact in Customers before sending WhatsApp.";
  }
  if (!input.smsType) {
    return "Select SMS type before sending WhatsApp.";
  }
  if (input.smsType === "DELIVERED" && !formatOfferRupee(input.offerPrice)) {
    return "Add offer price before sending WhatsApp.";
  }
  if (input.smsType === "EX_PORT") {
    if (!formatOfferRupee(input.offerPrice)) {
      return "Add offer price before sending WhatsApp.";
    }
    if (!formatOfferRupee(input.offerFreight)) {
      return "Add offer freight before sending WhatsApp.";
    }
  }
  return null;
}

export function salesWhatsAppLinks(input: {
  purchaserName: string | null | undefined;
  purchaserContact: string | null | undefined;
  smsType: SalesSmsTypeValue | null | undefined;
  offerPrice: string | null | undefined;
  offerFreight: string | null | undefined;
}): { app: string; web: string } | null {
  if (salesWhatsAppDisabledReason(input)) return null;
  const phone = toWhatsAppPhone(input.purchaserContact);
  if (!phone) return null;
  const text = encodeURIComponent(buildSalesWhatsAppMessage(input));
  return {
    app: `whatsapp://send?phone=${phone}&text=${text}`,
    web: `https://web.whatsapp.com/send?phone=${phone}&text=${text}`,
  };
}
