import { listPortOptions } from "@/lib/actions/ports";
import { listQualityClasses } from "@/lib/actions/qualities";
import { listVessels } from "@/lib/actions/vessels";
import { VesselsClient } from "./VesselsClient";

export default async function VesselsPage() {
  const [vessels, qualityClasses, ports] = await Promise.all([
    listVessels(),
    listQualityClasses(),
    listPortOptions(),
  ]);
  return (
    <VesselsClient
      initial={vessels.map((v) => ({
        id: v.id,
        vesselName: v.vesselName,
        qualityClassId: v.qualityClassId,
        qualityClass: v.qualityClass,
        portId: v.portId,
        port: v.port,
        active: v.active,
      }))}
      qualityClasses={qualityClasses.map((qc) => ({
        id: qc.id,
        domestic: qc.domestic,
        origin: qc.origin,
        qualityOption: qc.qualityOption,
      }))}
      ports={ports.map((p) => ({ id: p.id, name: p.name }))}
    />
  );
}
