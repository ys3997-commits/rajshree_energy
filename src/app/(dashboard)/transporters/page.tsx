import {
  listCityOptions,
  listOwnerOptions,
  listStateOptions,
} from "@/lib/actions/option-lists";
import { listTransporters } from "@/lib/actions/transporters";
import { TransportersClient } from "./TransportersClient";

export default async function TransportersPage() {
  const [rows, cities, states, owners] = await Promise.all([
    listTransporters(),
    listCityOptions(),
    listStateOptions(),
    listOwnerOptions(),
  ]);

  return (
    <TransportersClient
      initial={rows}
      cities={cities.map((o) => o.name)}
      states={states.map((o) => o.name)}
      owners={owners.map((o) => o.name)}
    />
  );
}
