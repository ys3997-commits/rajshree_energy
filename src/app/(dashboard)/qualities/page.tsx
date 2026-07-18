import {
  listOriginOptions,
  listQualityClasses,
  listQualityOptions,
} from "@/lib/actions/qualities";
import { QualitiesClient } from "./QualitiesClient";

export default async function QualitiesPage() {
  const [classes, origins, qualities] = await Promise.all([
    listQualityClasses(),
    listOriginOptions(),
    listQualityOptions(),
  ]);

  return (
    <QualitiesClient
      classes={classes.map((c) => ({
        id: c.id,
        originId: c.originId,
        domestic: c.domestic,
        qualityOptionId: c.qualityOptionId,
        origin: c.origin,
        qualityOption: c.qualityOption,
      }))}
      origins={origins.map((o) => ({ id: o.id, name: o.name }))}
      qualities={qualities.map((q) => ({ id: q.id, name: q.name }))}
    />
  );
}
