import { DispatchListView } from "../../dispatches/DispatchListView";
import {
  loadDispatchListData,
  type DispatchSearchParams,
} from "../../dispatches/dispatchListShared";

type SearchParams = Promise<DispatchSearchParams>;

export default async function UpdateSalePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const data = await loadDispatchListData(sp);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Update</h1>
      </div>
      <DispatchListView
        filterPath="/update/sale"
        linkPoNumbers={false}
        showCreateButton={false}
        exportTitle="Update — Sale"
        exportFilenameBase="update-sale"
        data={data}
      />
    </div>
  );
}
