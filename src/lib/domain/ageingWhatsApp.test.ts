import { describe, expect, it } from "vitest";
import { emptyAgeingBuckets } from "./ageing";
import type { AgeingBucketKey } from "./ageingBuckets";
import {
  ageingWhatsAppDisabledReason,
  ageingWhatsAppLinks,
  buildAgeingWhatsAppMessage,
} from "./ageingWhatsApp";

function buckets(
  amounts: Partial<Record<AgeingBucketKey, string>>,
): Record<AgeingBucketKey, string> {
  const next = Object.fromEntries(
    Object.entries(emptyAgeingBuckets()).map(([key, value]) => [
      key,
      value.toString(),
    ]),
  ) as Record<AgeingBucketKey, string>;
  return { ...next, ...amounts };
}

describe("buildAgeingWhatsAppMessage", () => {
  it("matches the ageing reminder template and omits empty buckets", () => {
    const msg = buildAgeingWhatsAppMessage({
      recipientName: "Gourav Bagla",
      totalDue: "1692905",
      overdue: "1692905",
      creditDays: 7,
      buckets: buckets({
        d31_40: "1048719",
        d41_50: "644186",
      }),
    });
    expect(msg).toBe(
      [
        "Hello *Sri Gourav Bagla*,",
        "",
        "We hope you are doing well. We kindly request your attention to the overdue amount.",
        "",
        "Total Due: ₹16,92,905",
        "Overdue: ₹16,92,905",
        "Credit Period: 7 Days",
        "",
        "*Outstanding Ageing:*",
        "• 31–40 Days: ₹10,48,719",
        "• 41–50 Days: ₹6,44,186",
        "",
        "We sincerely request you to make program for fund of the overdue amount at the earliest. Your prompt support will be highly appreciated.",
        "",
        "Thank you for your continued trust and cooperation.",
        "",
        "Warm regards,",
        "*Rajshree Energy*",
      ].join("\n"),
    );
  });

  it("uses Sir and a singular Day when name or period is missing", () => {
    const msg = buildAgeingWhatsAppMessage({
      recipientName: null,
      totalDue: "1000",
      overdue: "0",
      creditDays: 1,
      buckets: buckets({ d1_10: "1000" }),
    });
    expect(msg).toContain("Hello *Sri Sir*,");
    expect(msg).toContain("Credit Period: 1 Day");
  });
});

describe("ageingWhatsAppDisabledReason", () => {
  it("blocks owner messages unless RE Leadership is signed in", () => {
    expect(
      ageingWhatsAppDisabledReason({
        recipientName: "Vikram Das",
        recipientContact: "9811100001",
        dealingCompany: "Rajshree Energy",
        totalDue: "1000",
        overdue: "500",
        creditDays: 15,
        buckets: buckets({ d1_10: "1000" }),
        recipient: "owner",
        canMessageOwner: false,
      }),
    ).toBe("Only RE Leadership can message the owner.");
  });

  it("asks for payment-in-charge contact when missing", () => {
    expect(
      ageingWhatsAppDisabledReason({
        recipientName: "Ramesh",
        recipientContact: null,
        dealingCompany: "Rajshree Energy",
        totalDue: "1000",
        overdue: "500",
        creditDays: 15,
        buckets: buckets({ d1_10: "1000" }),
        recipient: "payment",
      }),
    ).toBe(
      "Add payment-in-charge contact in Customers before sending WhatsApp.",
    );
  });
});

describe("ageingWhatsAppLinks", () => {
  it("builds app and web links with the ageing message", () => {
    const links = ageingWhatsAppLinks({
      recipientName: "Umang Jhunjhunwala",
      recipientContact: "9876543210",
      dealingCompany: "Rajshree Energy",
      totalDue: "7757630",
      overdue: "1539531",
      creditDays: 15,
      buckets: buckets({ d1_10: "45562" }),
    });
    expect(links?.app).toMatch(/^whatsapp:\/\/send\?phone=919876543210&text=/);
    expect(links?.web).toMatch(
      /^https:\/\/web\.whatsapp\.com\/send\?phone=919876543210&text=/,
    );
    expect(decodeURIComponent(links?.app ?? "")).toContain("Total Due:");
    expect(decodeURIComponent(links?.app ?? "")).toContain("1–10 Days");
  });

  it("returns null when dealing company is not Rajshree Energy", () => {
    expect(
      ageingWhatsAppLinks({
        recipientName: "Ramesh",
        recipientContact: "9876543210",
        dealingCompany: "Other Company",
        totalDue: "1000",
        overdue: "500",
        creditDays: 15,
        buckets: buckets({ d1_10: "1000" }),
      }),
    ).toBeNull();
  });
});
