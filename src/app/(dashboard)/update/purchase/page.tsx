import { UpdatePurchaseListView } from "./UpdatePurchaseListView";
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
    <div className="update-page">
      <div className="page-header">
        <h1 className="page-title">Update - Purchases</h1>
      </div>
      <UpdatePurchaseListView data={data} />
    </div>
  );
}
