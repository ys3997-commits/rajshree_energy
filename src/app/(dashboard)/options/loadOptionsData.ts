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
import type { CategoryId } from "./optionsCategories";

const emptyOptionsData = () => ({
  origins: [] as { id: string; name: string }[],
  qualities: [] as { id: string; name: string }[],
  ports: [] as { id: string; name: string; state: string }[],
  saleExecutives: [] as { id: string; name: string }[],
  cities: [] as { id: string; name: string; state: string }[],
  sectors: [] as { id: string; name: string }[],
  people: [] as {
    id: string;
    name: string;
    role: string | null;
    hasLogin: boolean;
    pageKeys: string[];
    collectionSalesExecs: string[];
    salesEngineSalesExecs: string[];
    saleOrderSalesExecs: string[];
    purchaseOrderSalesExecs: string[];
    ageingReportSalesExecs: string[];
  }[],
  owners: [] as { id: string; name: string }[],
  dealingCompanies: [] as { id: string; name: string }[],
});

export async function loadOptionsData(categoryId: CategoryId) {
  const data = emptyOptionsData();

  switch (categoryId) {
    case "origins":
      data.origins = await listOriginOptions();
      break;
    case "qualities":
      data.qualities = await listQualityOptions();
      break;
    case "ports":
      data.ports = await listPortOptions();
      break;
    case "saleExecutives":
      data.saleExecutives = await listSaleExecutiveOptions();
      break;
    case "cities":
      data.cities = await listCityOptions();
      break;
    case "sectors":
      data.sectors = await listSectorOptions();
      break;
    case "people": {
      const people = await listStaff();
      data.people = people.map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role,
        hasLogin: row.hasLogin,
        pageKeys: row.pageKeys,
        collectionSalesExecs: row.collectionSalesExecs,
        salesEngineSalesExecs: row.salesEngineSalesExecs,
        saleOrderSalesExecs: row.saleOrderSalesExecs,
        purchaseOrderSalesExecs: row.purchaseOrderSalesExecs,
        ageingReportSalesExecs: row.ageingReportSalesExecs,
      }));
      break;
    }
    case "owners":
      data.owners = await listOwnerOptions();
      break;
    case "dealingCompanies":
      data.dealingCompanies = await listDealingCompanyOptions();
      break;
  }

  return data;
}
