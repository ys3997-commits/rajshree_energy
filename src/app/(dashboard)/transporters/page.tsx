import {
  listCityOptions,
  listStateOptions,
} from "@/lib/actions/option-lists";
import { listTransporters } from "@/lib/actions/transporters";
import { TransportersClient } from "./TransportersClient";

export default async function TransportersPage() {
  const [rows, cities, states] = await Promise.all([
    listTransporters(),
    listCityOptions(),
    listStateOptions(),
  ]);

  return (
    <TransportersClient
      initial={rows}
      cities={cities.map((o) => o.name)}
      states={states.map((o) => o.name)}
    />
  );
}
