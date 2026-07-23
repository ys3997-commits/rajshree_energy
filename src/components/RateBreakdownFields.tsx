import { formatRateBreakdownLine } from "@/lib/domain/format";

/** Form-grid row: basic + GST + TCS = final. */
export function RateBreakdownFields({
  breakdown,
}: {
  breakdown: {
    base: string;
    gst: string;
    tcs: string | null;
    final: string;
  };
}) {
  return (
    <>
      <label>Rate breakdown</label>
      <div className="text-sm font-medium">
        {formatRateBreakdownLine(breakdown)}
      </div>
    </>
  );
}
