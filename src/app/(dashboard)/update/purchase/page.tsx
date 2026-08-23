import { DispatchListView } from "../../dispatches/DispatchListView";
import {
  loadDispatchListData,
  type DispatchSearchParams,
} from "../../dispatches/dispatchListShared";

type SearchParams = Promise<DispatchSearchParams>;

export default async function UpdatePurchasePage({
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
        filterPath="/update/purchase"
        linkPoNumbers={false}
        showCreateButton={false}
        exportTitle="Update — Purchase"
        exportFilenameBase="update-purchase"
        data={data}
      />
    </div>
  );
}
