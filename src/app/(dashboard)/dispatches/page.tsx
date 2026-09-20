import { getCurrentAccess } from "@/lib/auth/access";
import { DispatchListView } from "./DispatchListView";
import {
  loadDispatchListData,
  type DispatchSearchParams,
} from "./dispatchListShared";

type SearchParams = Promise<DispatchSearchParams>;

export default async function DispatchesPage({
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
      <DispatchListView
        filterPath="/dispatches"
        linkPoNumbers
        showCreateButton
        exportTitle="Complete Dispatch"
        exportFilenameBase="complete-dispatch"
        data={data}
        canResizeColumns={access.kind === "owner"}
      />
    </div>
  );
}
