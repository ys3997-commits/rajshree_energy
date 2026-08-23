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
  const data = await loadDispatchListData(sp);

  return (
    <div>
      <DispatchListView
        filterPath="/dispatches"
        linkPoNumbers
        showCreateButton
        exportTitle="Dispatches"
        exportFilenameBase="dispatches"
        data={data}
      />
    </div>
  );
}
