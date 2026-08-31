import { listPortOptions } from "@/lib/actions/ports";
import {
  listCityOptions,
  listDealingCompanyOptions,
  listOwnerOptions,
  listSaleExecutiveOptions,
  listSectorOptions,
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
    sectors,
    people,
    owners,
    dealingCompanies,
  ] = await Promise.all([
    listOriginOptions(),
    listQualityOptions(),
    listPortOptions(),
    listSaleExecutiveOptions(),
    listCityOptions(),
    listSectorOptions(),
    listStaff(),
    listOwnerOptions(),
    listDealingCompanyOptions(),
  ]);

  return (
    <OptionsClient
      origins={origins}
      qualities={qualities}
      ports={ports}
      saleExecutives={saleExecutives}
      cities={cities}
      sectors={sectors}
      people={people.map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role,
        hasLogin: row.hasLogin,
        pageKeys: row.pageKeys,
        collectionSalesExecs: row.collectionSalesExecs,
        salesEngineSalesExecs: row.salesEngineSalesExecs,
        saleOrderSalesExecs: row.saleOrderSalesExecs,
      }))}
      owners={owners}
      dealingCompanies={dealingCompanies}
    />
  );
}
