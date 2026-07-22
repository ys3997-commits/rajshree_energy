import { formatRs } from "@/lib/domain/format";

/** Form-grid rows: GST, TCS (optional), final rate. */
export function RateBreakdownFields({
  gst,
  tcs,
  final,
}: {
  gst: string;
  tcs: string | null;
  final: string;
}) {
  return (
    <>
      <label>GST (18%)</label>
      <div className="text-sm">{formatRs(gst)}</div>
      <label>TCS (2%)</label>
      <div className="text-sm">
        {tcs != null ? formatRs(tcs) : "—"}
      </div>
      <label>Final rate</label>
      <div className="text-sm font-medium">{formatRs(final)}</div>
    </>
  );
}
