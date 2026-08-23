import { listTransportEngineRows } from "@/lib/actions/transportEngine";
import { TransportEngineClient } from "../../reports/transport/TransportEngineClient";

export default async function UpdateTransportPage() {
  const rows = await listTransportEngineRows();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Update</h1>
      </div>
      <TransportEngineClient
        initialRows={rows}
        exportTitle="Update — Transport"
        exportFilenameBase="update-transport"
      />
    </div>
  );
}
