import {
  listCorrectionDispatchOptions,
  listCorrections,
} from "@/lib/actions/corrections";
import { CorrectionClient } from "./CorrectionClient";

export default async function CorrectionsPage() {
  const [dispatchOptions, initialRows] = await Promise.all([
    listCorrectionDispatchOptions(),
    listCorrections(),
  ]);

  return (
    <CorrectionClient
      dispatchOptions={dispatchOptions}
      initialRows={initialRows}
    />
  );
}
