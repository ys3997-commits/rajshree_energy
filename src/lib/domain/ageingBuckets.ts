export const AGEING_BUCKETS = [
  { key: "d1_10", label: "1–10 days", minDays: 1, maxDays: 10 },
  { key: "d11_20", label: "11–20 days", minDays: 11, maxDays: 20 },
  { key: "d21_30", label: "21–30 days", minDays: 21, maxDays: 30 },
  { key: "d31_40", label: "31–40 days", minDays: 31, maxDays: 40 },
  { key: "d41_50", label: "41–50 days", minDays: 41, maxDays: 50 },
  { key: "d51_60", label: "51–60 days", minDays: 51, maxDays: 60 },
  { key: "d61_70", label: "61–70 days", minDays: 61, maxDays: 70 },
  { key: "d71_80", label: "71–80 days", minDays: 71, maxDays: 80 },
  { key: "d81_90", label: "81–90 days", minDays: 81, maxDays: 90 },
  { key: "d91_100", label: "91–100 days", minDays: 91, maxDays: 100 },
  { key: "d101_110", label: "101–110 days", minDays: 101, maxDays: 110 },
  { key: "d111_120", label: "111–120 days", minDays: 111, maxDays: 120 },
  { key: "d121_plus", label: "121+ days", minDays: 121, maxDays: Infinity },
] as const;

export type AgeingBucketKey = (typeof AGEING_BUCKETS)[number]["key"];

export type AgeingReportRow = {
  id: string;
  name: string;
  category: "INDUSTRY" | "TRADER";
  sector: string | null;
  state: string | null;
  totalDue: string;
} & Record<AgeingBucketKey, string>;

/** Supplier is treated as trader on the ageing report. */
export function ageingBuyerCategory(
  category: string,
): AgeingReportRow["category"] {
  return category === "INDUSTRY" ? "INDUSTRY" : "TRADER";
}
