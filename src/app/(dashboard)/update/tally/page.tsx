import { TallyEntryListView } from "./TallyEntryListView";
import { tallyEntryDate } from "./tallyDate";
import {
  loadDispatchListData,
  type DispatchSearchParams,
} from "../../dispatches/dispatchListShared";

type SearchParams = Promise<DispatchSearchParams>;

export default async function TallyEntryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const data = await loadDispatchListData({
    dispatchDate: tallyEntryDate(sp.dispatchDate),
  });

  return (
    <div className="update-page">
      <div className="page-header">
        <h1 className="page-title">Tally Entry</h1>
      </div>
      <TallyEntryListView data={data} />
    </div>
  );
}
