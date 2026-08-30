import { UpdateSaleListView } from "./UpdateSaleListView";
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
    <div className="update-page">
      <div className="page-header">
        <h1 className="page-title">Update - Sales</h1>
      </div>
      <UpdateSaleListView data={data} />
    </div>
  );
}
