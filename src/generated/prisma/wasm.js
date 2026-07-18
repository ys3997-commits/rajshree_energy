
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.StaffScalarFieldEnum = {
  id: 'id',
  name: 'name',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransporterScalarFieldEnum = {
  id: 'id',
  name: 'name',
  ownerName: 'ownerName',
  ownerContactNumber1: 'ownerContactNumber1',
  ownerContactNumber2: 'ownerContactNumber2',
  email: 'email',
  city: 'city',
  state: 'state',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OriginOptionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.QualityOptionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PortOptionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.QualityClassScalarFieldEnum = {
  id: 'id',
  originId: 'originId',
  domestic: 'domestic',
  qualityOptionId: 'qualityOptionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CustomerScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  ownerName: 'ownerName',
  ownerContact: 'ownerContact',
  purchaserName: 'purchaserName',
  purchaserContact: 'purchaserContact',
  purchaserRole: 'purchaserRole',
  paymentInChargeName: 'paymentInChargeName',
  paymentInChargeContact: 'paymentInChargeContact',
  paymentInChargeRole: 'paymentInChargeRole',
  accountantName: 'accountantName',
  accountantContact: 'accountantContact',
  email: 'email',
  city: 'city',
  state: 'state',
  creditDays: 'creditDays',
  sector: 'sector',
  dealById: 'dealById',
  approachForFundsId: 'approachForFundsId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VesselScalarFieldEnum = {
  id: 'id',
  vesselName: 'vesselName',
  qualityClassId: 'qualityClassId',
  portId: 'portId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  poNumber: 'poNumber',
  orderType: 'orderType',
  customerId: 'customerId',
  orderDate: 'orderDate',
  portId: 'portId',
  creditDays: 'creditDays',
  qualityClassId: 'qualityClassId',
  rate: 'rate',
  finalRate: 'finalRate',
  quantity: 'quantity',
  orderById: 'orderById',
  dispatchedOrder: 'dispatchedOrder',
  orderStatus: 'orderStatus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PurchaseOrderScalarFieldEnum = {
  id: 'id',
  poNumber: 'poNumber',
  orderType: 'orderType',
  importerId: 'importerId',
  vesselId: 'vesselId',
  orderDate: 'orderDate',
  qualityClassId: 'qualityClassId',
  rate: 'rate',
  finalRate: 'finalRate',
  quantity: 'quantity',
  dispatchedOrder: 'dispatchedOrder',
  orderStatus: 'orderStatus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DispatchScalarFieldEnum = {
  id: 'id',
  poNumber: 'poNumber',
  purchasePoNumber: 'purchasePoNumber',
  vesselId: 'vesselId',
  dispatchDate: 'dispatchDate',
  dispatchedQuantity: 'dispatchedQuantity',
  lorryNumber: 'lorryNumber',
  dispatchTerms: 'dispatchTerms',
  freight: 'freight',
  transporterId: 'transporterId',
  importerId: 'importerId',
  receivingQuantity: 'receivingQuantity',
  receiptDate: 'receiptDate',
  receiptStatus: 'receiptStatus',
  softCopyStatus: 'softCopyStatus',
  entryInTally: 'entryInTally',
  saleInvoiceNumber: 'saleInvoiceNumber',
  purchaseInvoiceNumber: 'purchaseInvoiceNumber',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.CustomerCategory = exports.$Enums.CustomerCategory = {
  SUPPLIER: 'SUPPLIER',
  INDUSTRY: 'INDUSTRY',
  TRADER: 'TRADER'
};

exports.OrderType = exports.$Enums.OrderType = {
  REGULAR: 'REGULAR',
  OPEN: 'OPEN'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  OPEN: 'OPEN',
  PENDING: 'PENDING',
  PARTIALLY_DISPATCHED: 'PARTIALLY_DISPATCHED',
  COMPLETED: 'COMPLETED'
};

exports.PurchaseOrderStatus = exports.$Enums.PurchaseOrderStatus = {
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED'
};

exports.DispatchTerms = exports.$Enums.DispatchTerms = {
  FOR: 'FOR',
  EX_PORT: 'EX_PORT'
};

exports.ReceiptStatus = exports.$Enums.ReceiptStatus = {
  PENDING: 'PENDING',
  RECEIVED: 'RECEIVED'
};

exports.Prisma.ModelName = {
  Staff: 'Staff',
  Transporter: 'Transporter',
  OriginOption: 'OriginOption',
  QualityOption: 'QualityOption',
  PortOption: 'PortOption',
  QualityClass: 'QualityClass',
  Customer: 'Customer',
  Vessel: 'Vessel',
  Order: 'Order',
  PurchaseOrder: 'PurchaseOrder',
  Dispatch: 'Dispatch'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
