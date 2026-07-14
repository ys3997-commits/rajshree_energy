import { listCustomers } from "@/lib/actions/customers";
import { listVessels } from "@/lib/actions/vessels";
import { VesselsClient } from "./VesselsClient";

export default async function VesselsPage() {
  const [vessels, customers] = await Promise.all([
    listVessels(),
    listCustomers(),
  ]);
  return (
    <VesselsClient
      initial={vessels.map((v) => ({
        id: v.id,
        vesselName: v.vesselName,
        importerId: v.importerId,
        quality: v.quality,
        quantity: v.quantity.toString(),
        dispatchedQuantity: v.dispatchedQuantity.toString(),
        balanceQuantity: v.balanceQuantity.toString(),
        importer: v.importer,
      }))}
      customers={customers.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
