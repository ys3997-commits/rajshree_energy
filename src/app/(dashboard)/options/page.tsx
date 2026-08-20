import { listPortOptions } from "@/lib/actions/ports";
import {
  listCityOptions,
  listDealingCompanyOptions,
  listSaleExecutiveOptions,
  listSectorOptions,
  listStateOptions,
} from "@/lib/actions/option-lists";
import {
  listOriginOptions,
  listQualityOptions,
} from "@/lib/actions/qualities";
import { listStaff } from "@/lib/actions/staff";
import { OptionsClient } from "./OptionsClient";

export default async function OptionsPage() {
  const [
    origins,
    qualities,
    ports,
    saleExecutives,
    cities,
    states,
    sectors,
    people,
    dealingCompanies,
  ] = await Promise.all([
    listOriginOptions(),
    listQualityOptions(),
    listPortOptions(),
    listSaleExecutiveOptions(),
    listCityOptions(),
    listStateOptions(),
    listSectorOptions(),
    listStaff(),
    listDealingCompanyOptions(),
  ]);

  return (
    <OptionsClient
      origins={origins}
      qualities={qualities}
      ports={ports}
      saleExecutives={saleExecutives}
      cities={cities}
      states={states}
      sectors={sectors}
      people={people.map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role,
        hasLogin: row.hasLogin,
        pageKeys: row.pageKeys,
      }))}
      dealingCompanies={dealingCompanies}
    />
  );
}
