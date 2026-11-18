import { redirect } from "next/navigation";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DiscountsRedirectPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string" && value) params.set(key, value);
  }
  const qs = params.toString();
  redirect(qs ? `/reports/bank/discount?${qs}` : "/reports/bank/discount");
}
