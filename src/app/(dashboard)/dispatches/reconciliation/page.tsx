import { getCurrentAccess } from "@/lib/auth/access";
import { ReconciliationListView } from "../ReconciliationListView";
import {
  loadDispatchListData,
  type DispatchSearchParams,
} from "../dispatchListShared";

type SearchParams = Promise<DispatchSearchParams>;

export default async function DispatchReconciliationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const [data, access] = await Promise.all([
    loadDispatchListData(sp),
    getCurrentAccess(),
  ]);

  return (
    <div>
      <ReconciliationListView
        data={data}
        canResizeColumns={access.kind === "owner"}
      />
    </div>
  );
}
