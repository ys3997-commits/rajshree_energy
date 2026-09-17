import { listOrders } from "@/lib/actions/orders";
import { listCustomers } from "@/lib/actions/customers";
import { listSaleExecutiveOptions } from "@/lib/actions/option-lists";
import { listPortOptions } from "@/lib/actions/ports";
import { listQualityClasses } from "@/lib/actions/qualities";
import { suggestNextPoNumber } from "@/lib/actions/dispatch";
import { formatRs } from "@/lib/domain/computations";
import {
  capitalizeName,
  daysSinceOrder,
  displayOrderBalance,
  displayOrderQuantity,
  formatCreditPeriod,
  formatDateDdMmYyyy,
  formatDispatchTerms,
  formatIndianNumber,
  formatOrderStatusForDisplay,
  formatQualityClass,
  formatSaleOrderMt,
} from "@/lib/domain/format";
import { resolveOrderListStatusFilter } from "@/lib/domain/orderListFilters";
import { CreateOrderButton } from "@/components/CreateOrderButton";
import { CloseQuantityButton } from "@/components/CloseQuantityButton";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { OrderWhatsAppButton } from "@/components/OrderWhatsAppButton";
import Link from "next/link";

type SearchParams = Promise<{
  status?: string;
  customerId?: string;
  portId?: string;
  orderById?: string;
  saleExecutive?: string;
  qualityClassId?: string;
}>;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const statusFilter = resolveOrderListStatusFilter(sp.status);

  // Keep concurrency under Prisma/Supabase pool (connection_limit=5).
  const [orders, customers, ports, saleExecutives, qualityClasses] =
    await Promise.all([
      listOrders({
        status: statusFilter,
        customerId: sp.customerId || "",
        portId: sp.portId || "",
        orderById: sp.orderById || "",
        saleExecutive: sp.saleExecutive || "",
        qualityClassId: sp.qualityClassId || "",
      }),
      listCustomers({ activeOnly: true }),
      listPortOptions(),
      listSaleExecutiveOptions(),
      listQualityClasses(),
    ]);

  const suggestedPo = await suggestNextPoNumber();

  const customerOpts = customers.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    creditDays: c.creditDays,
  }));
  const portOpts = ports.map((p) => ({ id: p.id, name: p.name }));
  const qualityClassOpts = qualityClasses.map((qc) => ({
    id: qc.id,
    domestic: qc.domestic,
    origin: qc.origin,
    qualityOption: qc.qualityOption,
  }));

  const exportColumns = [
    { key: "poNumber", header: "PO Number" },
    { key: "date", header: "Date" },
    { key: "customer", header: "Customer" },
    { key: "quality", header: "Quality\nClass" },
    { key: "lorries", header: "Number Of\nLorries", align: "right" as const },
    { key: "orderQty", header: "Order\nQty", align: "right" as const },
    {
      key: "dispatchedQty",
      header: "Dispatched\nQty",
      align: "right" as const,
    },
    { key: "closingQty", header: "Closing\nQty", align: "right" as const },
    { key: "balance", header: "Balance", align: "right" as const },
    { key: "lastDispatch", header: "Last\nDispatch", align: "right" as const },
    { key: "trucks", header: "Trucks\nDispatch", align: "right" as const },
    { key: "daysSince", header: "Days Since\nOrder", align: "right" as const },
    { key: "creditPeriod", header: "Credit\nPeriod", align: "right" as const },
    { key: "rate", header: "Basic\nRate", align: "right" as const },
    { key: "deliveryTerms", header: "Delivery\nTerm" },
    { key: "status", header: "Status" },
  ];

  const exportRows = orders.map((row) => ({
    poNumber: row.poNumber,
    date: formatDateDdMmYyyy(row.orderDate?.toISOString() ?? null),
    customer: row.customer.name,
    quality: formatQualityClass(row.qualityClass),
    lorries: formatIndianNumber(row.numberOfLorries),
    orderQty: formatSaleOrderMt(displayOrderQuantity(row)),
    dispatchedQty: formatSaleOrderMt(row.dispatchedOrder),
    closingQty: formatSaleOrderMt(row.closingQuantity),
    balance: formatSaleOrderMt(displayOrderBalance(row)),
    lastDispatch: formatCreditPeriod(
      daysSinceOrder(row.dispatches[0]?.dispatchDate ?? null),
    ),
    trucks: formatIndianNumber(row._count.dispatches),
    daysSince: formatCreditPeriod(
      daysSinceOrder(row.orderDate, row.createdAt),
    ),
    creditPeriod: formatCreditPeriod(row.creditDays),
    rate: formatRs(row.rate),
    deliveryTerms: formatDispatchTerms(row.deliveryTerms),
    status: formatOrderStatusForDisplay(row),
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sale orders</h1>
        </div>
        <div className="flex gap-2">
          <CreateOrderButton
            customers={customerOpts}
            ports={portOpts}
            qualityClasses={qualityClassOpts}
            suggestedPo={suggestedPo}
          />
        </div>
      </div>

      <form className="filters" method="get">
        <label>
          Status
          <select name="status" defaultValue={statusFilter}>
            <option value="">All</option>
            <option value="RUNNING">Running</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </label>
        <label>
          Customer
          <select name="customerId" defaultValue={sp.customerId ?? ""}>
            <option value="">All</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Quality class
          <select
            name="qualityClassId"
            defaultValue={sp.qualityClassId ?? ""}
          >
            <option value="">All</option>
            {qualityClasses.map((qc) => (
              <option key={qc.id} value={qc.id}>
                {formatQualityClass(qc)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Port
          <select name="portId" defaultValue={sp.portId ?? ""}>
            <option value="">All</option>
            {ports.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sales executive
          <select
            name="saleExecutive"
            defaultValue={sp.saleExecutive ?? ""}
          >
            <option value="">All</option>
            {saleExecutives.map((se) => (
              <option key={se.id} value={se.name}>
                {capitalizeName(se.name) ?? se.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
        <TableDownloadButtons
          title="Sale orders"
          filenameBase="sale-orders"
          columns={exportColumns}
          rows={exportRows}
        />
      </form>

      <div className="table-wrap table-wrap-scroll orders-table-wrap">
        <div className="table-h-scroll"><table className="data orders-table">
          <thead>
            <tr>
              <th className="orders-sticky-po">PO Number</th>
              <th className="orders-sticky-date">Date</th>
              <th className="orders-sticky-customer">Customer</th>
              <th className="col-wrap-head">
                Quality
                <br />
                Class
              </th>
              <th className="num col-lorries">
                Number Of
                <br />
                Lorries
              </th>
              <th className="num col-wrap-head">
                Order
                <br />
                Qty
              </th>
              <th className="num col-wrap-head">
                Dispatched
                <br />
                Qty
              </th>
              <th className="num col-wrap-head">
                Closing
                <br />
                Qty
              </th>
              <th className="num">Balance</th>
              <th className="num col-wrap-head">
                Last
                <br />
                Dispatch
              </th>
              <th className="num col-trucks-dispatch">
                Trucks
                <br />
                Dispatch
              </th>
              <th className="num col-days-since-order">
                Days Since
                <br />
                Order
              </th>
              <th className="num col-wrap-head">
                Credit
                <br />
                Period
              </th>
              <th className="num col-wrap-head">
                Basic
                <br />
                Rate
              </th>
              <th className="col-wrap-head">
                Delivery
                <br />
                Term
              </th>
              <th>Status</th>
              <th className="collection-whatsapp-col" aria-label="WhatsApp" />
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((row) => {
              const canClose =
                formatOrderStatusForDisplay(row) === "Running";
              return (
              <tr key={row.id}>
                <td className="orders-sticky-po">
                  <Link
                    href={`/orders/${row.id}`}
                    className="font-medium"
                  >
                    {row.poNumber}
                  </Link>
                </td>
                <td className="cell-date orders-sticky-date">
                  {formatDateDdMmYyyy(row.orderDate?.toISOString() ?? null)}
                </td>
                <td className="orders-sticky-customer" title={row.customer.name}>
                  {row.customer.name}
                </td>
                <td>{formatQualityClass(row.qualityClass)}</td>
                <td className="num col-lorries">
                  {formatIndianNumber(row.numberOfLorries)}
                </td>
                <td className="num">{formatSaleOrderMt(displayOrderQuantity(row))}</td>
                <td className="num">{formatSaleOrderMt(row.dispatchedOrder)}</td>
                <td className="num">{formatSaleOrderMt(row.closingQuantity)}</td>
                <td className="num">{formatSaleOrderMt(displayOrderBalance(row))}</td>
                <td className="num">
                  {formatCreditPeriod(
                    daysSinceOrder(row.dispatches[0]?.dispatchDate ?? null),
                  )}
                </td>
                <td className="num col-trucks-dispatch">
                  {formatIndianNumber(row._count.dispatches)}
                </td>
                <td className="num col-days-since-order">
                  {formatCreditPeriod(
                    daysSinceOrder(row.orderDate, row.createdAt),
                  )}
                </td>
                <td className="num">{formatCreditPeriod(row.creditDays)}</td>
                <td className="num">{formatRs(row.rate)}</td>
                <td>{formatDispatchTerms(row.deliveryTerms)}</td>
                <td>{formatOrderStatusForDisplay(row)}</td>
                <td className="collection-whatsapp-col">
                  <OrderWhatsAppButton
                    purchaserName={row.customer.purchaserName}
                    purchaserContact={row.customer.purchaserContact}
                    customerCategory={row.customer.category}
                    numberOfLorries={row.numberOfLorries}
                    quantity={row.quantity?.toString() ?? null}
                    rate={row.rate?.toString() ?? null}
                    deliveryTerms={row.deliveryTerms}
                    portName={row.port?.name ?? null}
                    creditDays={row.creditDays}
                  />
                </td>
                <td className="col-actions">
                  {canClose ? (
                    <CloseQuantityButton
                      orderId={row.id}
                      kind="sale"
                      balanceMt={String(
                        displayOrderBalance(row) ?? row.balanceOrder ?? "0",
                      )}
                    />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={18}>No orders match filters.</td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
