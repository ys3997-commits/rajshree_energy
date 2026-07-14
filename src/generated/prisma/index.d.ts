
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Staff
 * 
 */
export type Staff = $Result.DefaultSelection<Prisma.$StaffPayload>
/**
 * Model Transporter
 * 
 */
export type Transporter = $Result.DefaultSelection<Prisma.$TransporterPayload>
/**
 * Model Customer
 * 
 */
export type Customer = $Result.DefaultSelection<Prisma.$CustomerPayload>
/**
 * Model Vessel
 * 
 */
export type Vessel = $Result.DefaultSelection<Prisma.$VesselPayload>
/**
 * Model Order
 * Sale order (customer PO / selling side).
 */
export type Order = $Result.DefaultSelection<Prisma.$OrderPayload>
/**
 * Model PurchaseOrder
 * Purchase order (importer / costing side). Linked to a vessel.
 */
export type PurchaseOrder = $Result.DefaultSelection<Prisma.$PurchaseOrderPayload>
/**
 * Model Dispatch
 * 
 */
export type Dispatch = $Result.DefaultSelection<Prisma.$DispatchPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const CustomerCategory: {
  SUPPLIER: 'SUPPLIER',
  INDUSTRY: 'INDUSTRY'
};

export type CustomerCategory = (typeof CustomerCategory)[keyof typeof CustomerCategory]


export const OrderType: {
  REGULAR: 'REGULAR',
  OPEN: 'OPEN'
};

export type OrderType = (typeof OrderType)[keyof typeof OrderType]


export const OrderStatus: {
  OPEN: 'OPEN',
  PENDING: 'PENDING',
  PARTIALLY_DISPATCHED: 'PARTIALLY_DISPATCHED',
  COMPLETED: 'COMPLETED'
};

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]


export const DispatchTerms: {
  FOR: 'FOR',
  EX_PORT: 'EX_PORT'
};

export type DispatchTerms = (typeof DispatchTerms)[keyof typeof DispatchTerms]


export const ReceiptStatus: {
  PENDING: 'PENDING',
  RECEIVED: 'RECEIVED'
};

export type ReceiptStatus = (typeof ReceiptStatus)[keyof typeof ReceiptStatus]

}

export type CustomerCategory = $Enums.CustomerCategory

export const CustomerCategory: typeof $Enums.CustomerCategory

export type OrderType = $Enums.OrderType

export const OrderType: typeof $Enums.OrderType

export type OrderStatus = $Enums.OrderStatus

export const OrderStatus: typeof $Enums.OrderStatus

export type DispatchTerms = $Enums.DispatchTerms

export const DispatchTerms: typeof $Enums.DispatchTerms

export type ReceiptStatus = $Enums.ReceiptStatus

export const ReceiptStatus: typeof $Enums.ReceiptStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Staff
 * const staff = await prisma.staff.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Staff
   * const staff = await prisma.staff.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.staff`: Exposes CRUD operations for the **Staff** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Staff
    * const staff = await prisma.staff.findMany()
    * ```
    */
  get staff(): Prisma.StaffDelegate<ExtArgs>;

  /**
   * `prisma.transporter`: Exposes CRUD operations for the **Transporter** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Transporters
    * const transporters = await prisma.transporter.findMany()
    * ```
    */
  get transporter(): Prisma.TransporterDelegate<ExtArgs>;

  /**
   * `prisma.customer`: Exposes CRUD operations for the **Customer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Customers
    * const customers = await prisma.customer.findMany()
    * ```
    */
  get customer(): Prisma.CustomerDelegate<ExtArgs>;

  /**
   * `prisma.vessel`: Exposes CRUD operations for the **Vessel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Vessels
    * const vessels = await prisma.vessel.findMany()
    * ```
    */
  get vessel(): Prisma.VesselDelegate<ExtArgs>;

  /**
   * `prisma.order`: Exposes CRUD operations for the **Order** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Orders
    * const orders = await prisma.order.findMany()
    * ```
    */
  get order(): Prisma.OrderDelegate<ExtArgs>;

  /**
   * `prisma.purchaseOrder`: Exposes CRUD operations for the **PurchaseOrder** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PurchaseOrders
    * const purchaseOrders = await prisma.purchaseOrder.findMany()
    * ```
    */
  get purchaseOrder(): Prisma.PurchaseOrderDelegate<ExtArgs>;

  /**
   * `prisma.dispatch`: Exposes CRUD operations for the **Dispatch** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Dispatches
    * const dispatches = await prisma.dispatch.findMany()
    * ```
    */
  get dispatch(): Prisma.DispatchDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Staff: 'Staff',
    Transporter: 'Transporter',
    Customer: 'Customer',
    Vessel: 'Vessel',
    Order: 'Order',
    PurchaseOrder: 'PurchaseOrder',
    Dispatch: 'Dispatch'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "staff" | "transporter" | "customer" | "vessel" | "order" | "purchaseOrder" | "dispatch"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Staff: {
        payload: Prisma.$StaffPayload<ExtArgs>
        fields: Prisma.StaffFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StaffFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StaffFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>
          }
          findFirst: {
            args: Prisma.StaffFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StaffFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>
          }
          findMany: {
            args: Prisma.StaffFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>[]
          }
          create: {
            args: Prisma.StaffCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>
          }
          createMany: {
            args: Prisma.StaffCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StaffCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>[]
          }
          delete: {
            args: Prisma.StaffDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>
          }
          update: {
            args: Prisma.StaffUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>
          }
          deleteMany: {
            args: Prisma.StaffDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StaffUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.StaffUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>
          }
          aggregate: {
            args: Prisma.StaffAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStaff>
          }
          groupBy: {
            args: Prisma.StaffGroupByArgs<ExtArgs>
            result: $Utils.Optional<StaffGroupByOutputType>[]
          }
          count: {
            args: Prisma.StaffCountArgs<ExtArgs>
            result: $Utils.Optional<StaffCountAggregateOutputType> | number
          }
        }
      }
      Transporter: {
        payload: Prisma.$TransporterPayload<ExtArgs>
        fields: Prisma.TransporterFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TransporterFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransporterPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TransporterFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransporterPayload>
          }
          findFirst: {
            args: Prisma.TransporterFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransporterPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TransporterFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransporterPayload>
          }
          findMany: {
            args: Prisma.TransporterFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransporterPayload>[]
          }
          create: {
            args: Prisma.TransporterCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransporterPayload>
          }
          createMany: {
            args: Prisma.TransporterCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TransporterCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransporterPayload>[]
          }
          delete: {
            args: Prisma.TransporterDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransporterPayload>
          }
          update: {
            args: Prisma.TransporterUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransporterPayload>
          }
          deleteMany: {
            args: Prisma.TransporterDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TransporterUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TransporterUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransporterPayload>
          }
          aggregate: {
            args: Prisma.TransporterAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTransporter>
          }
          groupBy: {
            args: Prisma.TransporterGroupByArgs<ExtArgs>
            result: $Utils.Optional<TransporterGroupByOutputType>[]
          }
          count: {
            args: Prisma.TransporterCountArgs<ExtArgs>
            result: $Utils.Optional<TransporterCountAggregateOutputType> | number
          }
        }
      }
      Customer: {
        payload: Prisma.$CustomerPayload<ExtArgs>
        fields: Prisma.CustomerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CustomerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CustomerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          findFirst: {
            args: Prisma.CustomerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CustomerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          findMany: {
            args: Prisma.CustomerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>[]
          }
          create: {
            args: Prisma.CustomerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          createMany: {
            args: Prisma.CustomerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CustomerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>[]
          }
          delete: {
            args: Prisma.CustomerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          update: {
            args: Prisma.CustomerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          deleteMany: {
            args: Prisma.CustomerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CustomerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CustomerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          aggregate: {
            args: Prisma.CustomerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCustomer>
          }
          groupBy: {
            args: Prisma.CustomerGroupByArgs<ExtArgs>
            result: $Utils.Optional<CustomerGroupByOutputType>[]
          }
          count: {
            args: Prisma.CustomerCountArgs<ExtArgs>
            result: $Utils.Optional<CustomerCountAggregateOutputType> | number
          }
        }
      }
      Vessel: {
        payload: Prisma.$VesselPayload<ExtArgs>
        fields: Prisma.VesselFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VesselFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VesselPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VesselFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VesselPayload>
          }
          findFirst: {
            args: Prisma.VesselFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VesselPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VesselFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VesselPayload>
          }
          findMany: {
            args: Prisma.VesselFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VesselPayload>[]
          }
          create: {
            args: Prisma.VesselCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VesselPayload>
          }
          createMany: {
            args: Prisma.VesselCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VesselCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VesselPayload>[]
          }
          delete: {
            args: Prisma.VesselDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VesselPayload>
          }
          update: {
            args: Prisma.VesselUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VesselPayload>
          }
          deleteMany: {
            args: Prisma.VesselDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VesselUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.VesselUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VesselPayload>
          }
          aggregate: {
            args: Prisma.VesselAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVessel>
          }
          groupBy: {
            args: Prisma.VesselGroupByArgs<ExtArgs>
            result: $Utils.Optional<VesselGroupByOutputType>[]
          }
          count: {
            args: Prisma.VesselCountArgs<ExtArgs>
            result: $Utils.Optional<VesselCountAggregateOutputType> | number
          }
        }
      }
      Order: {
        payload: Prisma.$OrderPayload<ExtArgs>
        fields: Prisma.OrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findFirst: {
            args: Prisma.OrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findMany: {
            args: Prisma.OrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          create: {
            args: Prisma.OrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          createMany: {
            args: Prisma.OrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          delete: {
            args: Prisma.OrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          update: {
            args: Prisma.OrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          deleteMany: {
            args: Prisma.OrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          aggregate: {
            args: Prisma.OrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrder>
          }
          groupBy: {
            args: Prisma.OrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderCountArgs<ExtArgs>
            result: $Utils.Optional<OrderCountAggregateOutputType> | number
          }
        }
      }
      PurchaseOrder: {
        payload: Prisma.$PurchaseOrderPayload<ExtArgs>
        fields: Prisma.PurchaseOrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PurchaseOrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PurchaseOrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>
          }
          findFirst: {
            args: Prisma.PurchaseOrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PurchaseOrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>
          }
          findMany: {
            args: Prisma.PurchaseOrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>[]
          }
          create: {
            args: Prisma.PurchaseOrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>
          }
          createMany: {
            args: Prisma.PurchaseOrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PurchaseOrderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>[]
          }
          delete: {
            args: Prisma.PurchaseOrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>
          }
          update: {
            args: Prisma.PurchaseOrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>
          }
          deleteMany: {
            args: Prisma.PurchaseOrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PurchaseOrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PurchaseOrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>
          }
          aggregate: {
            args: Prisma.PurchaseOrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePurchaseOrder>
          }
          groupBy: {
            args: Prisma.PurchaseOrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<PurchaseOrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.PurchaseOrderCountArgs<ExtArgs>
            result: $Utils.Optional<PurchaseOrderCountAggregateOutputType> | number
          }
        }
      }
      Dispatch: {
        payload: Prisma.$DispatchPayload<ExtArgs>
        fields: Prisma.DispatchFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DispatchFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispatchPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DispatchFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispatchPayload>
          }
          findFirst: {
            args: Prisma.DispatchFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispatchPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DispatchFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispatchPayload>
          }
          findMany: {
            args: Prisma.DispatchFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispatchPayload>[]
          }
          create: {
            args: Prisma.DispatchCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispatchPayload>
          }
          createMany: {
            args: Prisma.DispatchCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DispatchCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispatchPayload>[]
          }
          delete: {
            args: Prisma.DispatchDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispatchPayload>
          }
          update: {
            args: Prisma.DispatchUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispatchPayload>
          }
          deleteMany: {
            args: Prisma.DispatchDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DispatchUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DispatchUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispatchPayload>
          }
          aggregate: {
            args: Prisma.DispatchAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDispatch>
          }
          groupBy: {
            args: Prisma.DispatchGroupByArgs<ExtArgs>
            result: $Utils.Optional<DispatchGroupByOutputType>[]
          }
          count: {
            args: Prisma.DispatchCountArgs<ExtArgs>
            result: $Utils.Optional<DispatchCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type StaffCountOutputType
   */

  export type StaffCountOutputType = {
    dealByCustomers: number
    approachForFundsCustomers: number
    orders: number
    purchaseOrders: number
  }

  export type StaffCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dealByCustomers?: boolean | StaffCountOutputTypeCountDealByCustomersArgs
    approachForFundsCustomers?: boolean | StaffCountOutputTypeCountApproachForFundsCustomersArgs
    orders?: boolean | StaffCountOutputTypeCountOrdersArgs
    purchaseOrders?: boolean | StaffCountOutputTypeCountPurchaseOrdersArgs
  }

  // Custom InputTypes
  /**
   * StaffCountOutputType without action
   */
  export type StaffCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffCountOutputType
     */
    select?: StaffCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * StaffCountOutputType without action
   */
  export type StaffCountOutputTypeCountDealByCustomersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerWhereInput
  }

  /**
   * StaffCountOutputType without action
   */
  export type StaffCountOutputTypeCountApproachForFundsCustomersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerWhereInput
  }

  /**
   * StaffCountOutputType without action
   */
  export type StaffCountOutputTypeCountOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
  }

  /**
   * StaffCountOutputType without action
   */
  export type StaffCountOutputTypeCountPurchaseOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PurchaseOrderWhereInput
  }


  /**
   * Count Type TransporterCountOutputType
   */

  export type TransporterCountOutputType = {
    dispatches: number
  }

  export type TransporterCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dispatches?: boolean | TransporterCountOutputTypeCountDispatchesArgs
  }

  // Custom InputTypes
  /**
   * TransporterCountOutputType without action
   */
  export type TransporterCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransporterCountOutputType
     */
    select?: TransporterCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TransporterCountOutputType without action
   */
  export type TransporterCountOutputTypeCountDispatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispatchWhereInput
  }


  /**
   * Count Type CustomerCountOutputType
   */

  export type CustomerCountOutputType = {
    vessels: number
    orders: number
    purchaseOrders: number
    dispatches: number
  }

  export type CustomerCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vessels?: boolean | CustomerCountOutputTypeCountVesselsArgs
    orders?: boolean | CustomerCountOutputTypeCountOrdersArgs
    purchaseOrders?: boolean | CustomerCountOutputTypeCountPurchaseOrdersArgs
    dispatches?: boolean | CustomerCountOutputTypeCountDispatchesArgs
  }

  // Custom InputTypes
  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerCountOutputType
     */
    select?: CustomerCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountVesselsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VesselWhereInput
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountPurchaseOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PurchaseOrderWhereInput
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountDispatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispatchWhereInput
  }


  /**
   * Count Type VesselCountOutputType
   */

  export type VesselCountOutputType = {
    purchaseOrders: number
    dispatches: number
  }

  export type VesselCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    purchaseOrders?: boolean | VesselCountOutputTypeCountPurchaseOrdersArgs
    dispatches?: boolean | VesselCountOutputTypeCountDispatchesArgs
  }

  // Custom InputTypes
  /**
   * VesselCountOutputType without action
   */
  export type VesselCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VesselCountOutputType
     */
    select?: VesselCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * VesselCountOutputType without action
   */
  export type VesselCountOutputTypeCountPurchaseOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PurchaseOrderWhereInput
  }

  /**
   * VesselCountOutputType without action
   */
  export type VesselCountOutputTypeCountDispatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispatchWhereInput
  }


  /**
   * Count Type OrderCountOutputType
   */

  export type OrderCountOutputType = {
    dispatches: number
  }

  export type OrderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dispatches?: boolean | OrderCountOutputTypeCountDispatchesArgs
  }

  // Custom InputTypes
  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderCountOutputType
     */
    select?: OrderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountDispatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispatchWhereInput
  }


  /**
   * Count Type PurchaseOrderCountOutputType
   */

  export type PurchaseOrderCountOutputType = {
    dispatches: number
  }

  export type PurchaseOrderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dispatches?: boolean | PurchaseOrderCountOutputTypeCountDispatchesArgs
  }

  // Custom InputTypes
  /**
   * PurchaseOrderCountOutputType without action
   */
  export type PurchaseOrderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderCountOutputType
     */
    select?: PurchaseOrderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PurchaseOrderCountOutputType without action
   */
  export type PurchaseOrderCountOutputTypeCountDispatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispatchWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Staff
   */

  export type AggregateStaff = {
    _count: StaffCountAggregateOutputType | null
    _min: StaffMinAggregateOutputType | null
    _max: StaffMaxAggregateOutputType | null
  }

  export type StaffMinAggregateOutputType = {
    id: string | null
    name: string | null
    role: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StaffMaxAggregateOutputType = {
    id: string | null
    name: string | null
    role: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StaffCountAggregateOutputType = {
    id: number
    name: number
    role: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StaffMinAggregateInputType = {
    id?: true
    name?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StaffMaxAggregateInputType = {
    id?: true
    name?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StaffCountAggregateInputType = {
    id?: true
    name?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StaffAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Staff to aggregate.
     */
    where?: StaffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Staff to fetch.
     */
    orderBy?: StaffOrderByWithRelationInput | StaffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StaffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Staff from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Staff.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Staff
    **/
    _count?: true | StaffCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StaffMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StaffMaxAggregateInputType
  }

  export type GetStaffAggregateType<T extends StaffAggregateArgs> = {
        [P in keyof T & keyof AggregateStaff]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStaff[P]>
      : GetScalarType<T[P], AggregateStaff[P]>
  }




  export type StaffGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StaffWhereInput
    orderBy?: StaffOrderByWithAggregationInput | StaffOrderByWithAggregationInput[]
    by: StaffScalarFieldEnum[] | StaffScalarFieldEnum
    having?: StaffScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StaffCountAggregateInputType | true
    _min?: StaffMinAggregateInputType
    _max?: StaffMaxAggregateInputType
  }

  export type StaffGroupByOutputType = {
    id: string
    name: string
    role: string | null
    createdAt: Date
    updatedAt: Date
    _count: StaffCountAggregateOutputType | null
    _min: StaffMinAggregateOutputType | null
    _max: StaffMaxAggregateOutputType | null
  }

  type GetStaffGroupByPayload<T extends StaffGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StaffGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StaffGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StaffGroupByOutputType[P]>
            : GetScalarType<T[P], StaffGroupByOutputType[P]>
        }
      >
    >


  export type StaffSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dealByCustomers?: boolean | Staff$dealByCustomersArgs<ExtArgs>
    approachForFundsCustomers?: boolean | Staff$approachForFundsCustomersArgs<ExtArgs>
    orders?: boolean | Staff$ordersArgs<ExtArgs>
    purchaseOrders?: boolean | Staff$purchaseOrdersArgs<ExtArgs>
    _count?: boolean | StaffCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["staff"]>

  export type StaffSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["staff"]>

  export type StaffSelectScalar = {
    id?: boolean
    name?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type StaffInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dealByCustomers?: boolean | Staff$dealByCustomersArgs<ExtArgs>
    approachForFundsCustomers?: boolean | Staff$approachForFundsCustomersArgs<ExtArgs>
    orders?: boolean | Staff$ordersArgs<ExtArgs>
    purchaseOrders?: boolean | Staff$purchaseOrdersArgs<ExtArgs>
    _count?: boolean | StaffCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type StaffIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $StaffPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Staff"
    objects: {
      dealByCustomers: Prisma.$CustomerPayload<ExtArgs>[]
      approachForFundsCustomers: Prisma.$CustomerPayload<ExtArgs>[]
      orders: Prisma.$OrderPayload<ExtArgs>[]
      purchaseOrders: Prisma.$PurchaseOrderPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      role: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["staff"]>
    composites: {}
  }

  type StaffGetPayload<S extends boolean | null | undefined | StaffDefaultArgs> = $Result.GetResult<Prisma.$StaffPayload, S>

  type StaffCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<StaffFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: StaffCountAggregateInputType | true
    }

  export interface StaffDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Staff'], meta: { name: 'Staff' } }
    /**
     * Find zero or one Staff that matches the filter.
     * @param {StaffFindUniqueArgs} args - Arguments to find a Staff
     * @example
     * // Get one Staff
     * const staff = await prisma.staff.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StaffFindUniqueArgs>(args: SelectSubset<T, StaffFindUniqueArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Staff that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {StaffFindUniqueOrThrowArgs} args - Arguments to find a Staff
     * @example
     * // Get one Staff
     * const staff = await prisma.staff.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StaffFindUniqueOrThrowArgs>(args: SelectSubset<T, StaffFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Staff that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffFindFirstArgs} args - Arguments to find a Staff
     * @example
     * // Get one Staff
     * const staff = await prisma.staff.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StaffFindFirstArgs>(args?: SelectSubset<T, StaffFindFirstArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Staff that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffFindFirstOrThrowArgs} args - Arguments to find a Staff
     * @example
     * // Get one Staff
     * const staff = await prisma.staff.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StaffFindFirstOrThrowArgs>(args?: SelectSubset<T, StaffFindFirstOrThrowArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Staff that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Staff
     * const staff = await prisma.staff.findMany()
     * 
     * // Get first 10 Staff
     * const staff = await prisma.staff.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const staffWithIdOnly = await prisma.staff.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StaffFindManyArgs>(args?: SelectSubset<T, StaffFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Staff.
     * @param {StaffCreateArgs} args - Arguments to create a Staff.
     * @example
     * // Create one Staff
     * const Staff = await prisma.staff.create({
     *   data: {
     *     // ... data to create a Staff
     *   }
     * })
     * 
     */
    create<T extends StaffCreateArgs>(args: SelectSubset<T, StaffCreateArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Staff.
     * @param {StaffCreateManyArgs} args - Arguments to create many Staff.
     * @example
     * // Create many Staff
     * const staff = await prisma.staff.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StaffCreateManyArgs>(args?: SelectSubset<T, StaffCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Staff and returns the data saved in the database.
     * @param {StaffCreateManyAndReturnArgs} args - Arguments to create many Staff.
     * @example
     * // Create many Staff
     * const staff = await prisma.staff.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Staff and only return the `id`
     * const staffWithIdOnly = await prisma.staff.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StaffCreateManyAndReturnArgs>(args?: SelectSubset<T, StaffCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Staff.
     * @param {StaffDeleteArgs} args - Arguments to delete one Staff.
     * @example
     * // Delete one Staff
     * const Staff = await prisma.staff.delete({
     *   where: {
     *     // ... filter to delete one Staff
     *   }
     * })
     * 
     */
    delete<T extends StaffDeleteArgs>(args: SelectSubset<T, StaffDeleteArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Staff.
     * @param {StaffUpdateArgs} args - Arguments to update one Staff.
     * @example
     * // Update one Staff
     * const staff = await prisma.staff.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StaffUpdateArgs>(args: SelectSubset<T, StaffUpdateArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Staff.
     * @param {StaffDeleteManyArgs} args - Arguments to filter Staff to delete.
     * @example
     * // Delete a few Staff
     * const { count } = await prisma.staff.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StaffDeleteManyArgs>(args?: SelectSubset<T, StaffDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Staff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Staff
     * const staff = await prisma.staff.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StaffUpdateManyArgs>(args: SelectSubset<T, StaffUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Staff.
     * @param {StaffUpsertArgs} args - Arguments to update or create a Staff.
     * @example
     * // Update or create a Staff
     * const staff = await prisma.staff.upsert({
     *   create: {
     *     // ... data to create a Staff
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Staff we want to update
     *   }
     * })
     */
    upsert<T extends StaffUpsertArgs>(args: SelectSubset<T, StaffUpsertArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Staff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffCountArgs} args - Arguments to filter Staff to count.
     * @example
     * // Count the number of Staff
     * const count = await prisma.staff.count({
     *   where: {
     *     // ... the filter for the Staff we want to count
     *   }
     * })
    **/
    count<T extends StaffCountArgs>(
      args?: Subset<T, StaffCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StaffCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Staff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StaffAggregateArgs>(args: Subset<T, StaffAggregateArgs>): Prisma.PrismaPromise<GetStaffAggregateType<T>>

    /**
     * Group by Staff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StaffGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StaffGroupByArgs['orderBy'] }
        : { orderBy?: StaffGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StaffGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStaffGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Staff model
   */
  readonly fields: StaffFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Staff.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StaffClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    dealByCustomers<T extends Staff$dealByCustomersArgs<ExtArgs> = {}>(args?: Subset<T, Staff$dealByCustomersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findMany"> | Null>
    approachForFundsCustomers<T extends Staff$approachForFundsCustomersArgs<ExtArgs> = {}>(args?: Subset<T, Staff$approachForFundsCustomersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findMany"> | Null>
    orders<T extends Staff$ordersArgs<ExtArgs> = {}>(args?: Subset<T, Staff$ordersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany"> | Null>
    purchaseOrders<T extends Staff$purchaseOrdersArgs<ExtArgs> = {}>(args?: Subset<T, Staff$purchaseOrdersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Staff model
   */ 
  interface StaffFieldRefs {
    readonly id: FieldRef<"Staff", 'String'>
    readonly name: FieldRef<"Staff", 'String'>
    readonly role: FieldRef<"Staff", 'String'>
    readonly createdAt: FieldRef<"Staff", 'DateTime'>
    readonly updatedAt: FieldRef<"Staff", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Staff findUnique
   */
  export type StaffFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * Filter, which Staff to fetch.
     */
    where: StaffWhereUniqueInput
  }

  /**
   * Staff findUniqueOrThrow
   */
  export type StaffFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * Filter, which Staff to fetch.
     */
    where: StaffWhereUniqueInput
  }

  /**
   * Staff findFirst
   */
  export type StaffFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * Filter, which Staff to fetch.
     */
    where?: StaffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Staff to fetch.
     */
    orderBy?: StaffOrderByWithRelationInput | StaffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Staff.
     */
    cursor?: StaffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Staff from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Staff.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Staff.
     */
    distinct?: StaffScalarFieldEnum | StaffScalarFieldEnum[]
  }

  /**
   * Staff findFirstOrThrow
   */
  export type StaffFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * Filter, which Staff to fetch.
     */
    where?: StaffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Staff to fetch.
     */
    orderBy?: StaffOrderByWithRelationInput | StaffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Staff.
     */
    cursor?: StaffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Staff from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Staff.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Staff.
     */
    distinct?: StaffScalarFieldEnum | StaffScalarFieldEnum[]
  }

  /**
   * Staff findMany
   */
  export type StaffFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * Filter, which Staff to fetch.
     */
    where?: StaffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Staff to fetch.
     */
    orderBy?: StaffOrderByWithRelationInput | StaffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Staff.
     */
    cursor?: StaffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Staff from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Staff.
     */
    skip?: number
    distinct?: StaffScalarFieldEnum | StaffScalarFieldEnum[]
  }

  /**
   * Staff create
   */
  export type StaffCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * The data needed to create a Staff.
     */
    data: XOR<StaffCreateInput, StaffUncheckedCreateInput>
  }

  /**
   * Staff createMany
   */
  export type StaffCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Staff.
     */
    data: StaffCreateManyInput | StaffCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Staff createManyAndReturn
   */
  export type StaffCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Staff.
     */
    data: StaffCreateManyInput | StaffCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Staff update
   */
  export type StaffUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * The data needed to update a Staff.
     */
    data: XOR<StaffUpdateInput, StaffUncheckedUpdateInput>
    /**
     * Choose, which Staff to update.
     */
    where: StaffWhereUniqueInput
  }

  /**
   * Staff updateMany
   */
  export type StaffUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Staff.
     */
    data: XOR<StaffUpdateManyMutationInput, StaffUncheckedUpdateManyInput>
    /**
     * Filter which Staff to update
     */
    where?: StaffWhereInput
  }

  /**
   * Staff upsert
   */
  export type StaffUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * The filter to search for the Staff to update in case it exists.
     */
    where: StaffWhereUniqueInput
    /**
     * In case the Staff found by the `where` argument doesn't exist, create a new Staff with this data.
     */
    create: XOR<StaffCreateInput, StaffUncheckedCreateInput>
    /**
     * In case the Staff was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StaffUpdateInput, StaffUncheckedUpdateInput>
  }

  /**
   * Staff delete
   */
  export type StaffDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * Filter which Staff to delete.
     */
    where: StaffWhereUniqueInput
  }

  /**
   * Staff deleteMany
   */
  export type StaffDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Staff to delete
     */
    where?: StaffWhereInput
  }

  /**
   * Staff.dealByCustomers
   */
  export type Staff$dealByCustomersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    where?: CustomerWhereInput
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    cursor?: CustomerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Staff.approachForFundsCustomers
   */
  export type Staff$approachForFundsCustomersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    where?: CustomerWhereInput
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    cursor?: CustomerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Staff.orders
   */
  export type Staff$ordersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    cursor?: OrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Staff.purchaseOrders
   */
  export type Staff$purchaseOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    where?: PurchaseOrderWhereInput
    orderBy?: PurchaseOrderOrderByWithRelationInput | PurchaseOrderOrderByWithRelationInput[]
    cursor?: PurchaseOrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PurchaseOrderScalarFieldEnum | PurchaseOrderScalarFieldEnum[]
  }

  /**
   * Staff without action
   */
  export type StaffDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
  }


  /**
   * Model Transporter
   */

  export type AggregateTransporter = {
    _count: TransporterCountAggregateOutputType | null
    _min: TransporterMinAggregateOutputType | null
    _max: TransporterMaxAggregateOutputType | null
  }

  export type TransporterMinAggregateOutputType = {
    id: string | null
    name: string | null
    area: string | null
    contactPersonName: string | null
    contactNumber: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TransporterMaxAggregateOutputType = {
    id: string | null
    name: string | null
    area: string | null
    contactPersonName: string | null
    contactNumber: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TransporterCountAggregateOutputType = {
    id: number
    name: number
    area: number
    contactPersonName: number
    contactNumber: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TransporterMinAggregateInputType = {
    id?: true
    name?: true
    area?: true
    contactPersonName?: true
    contactNumber?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TransporterMaxAggregateInputType = {
    id?: true
    name?: true
    area?: true
    contactPersonName?: true
    contactNumber?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TransporterCountAggregateInputType = {
    id?: true
    name?: true
    area?: true
    contactPersonName?: true
    contactNumber?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TransporterAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transporter to aggregate.
     */
    where?: TransporterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transporters to fetch.
     */
    orderBy?: TransporterOrderByWithRelationInput | TransporterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TransporterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transporters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transporters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Transporters
    **/
    _count?: true | TransporterCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TransporterMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TransporterMaxAggregateInputType
  }

  export type GetTransporterAggregateType<T extends TransporterAggregateArgs> = {
        [P in keyof T & keyof AggregateTransporter]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransporter[P]>
      : GetScalarType<T[P], AggregateTransporter[P]>
  }




  export type TransporterGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransporterWhereInput
    orderBy?: TransporterOrderByWithAggregationInput | TransporterOrderByWithAggregationInput[]
    by: TransporterScalarFieldEnum[] | TransporterScalarFieldEnum
    having?: TransporterScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TransporterCountAggregateInputType | true
    _min?: TransporterMinAggregateInputType
    _max?: TransporterMaxAggregateInputType
  }

  export type TransporterGroupByOutputType = {
    id: string
    name: string
    area: string | null
    contactPersonName: string | null
    contactNumber: string | null
    createdAt: Date
    updatedAt: Date
    _count: TransporterCountAggregateOutputType | null
    _min: TransporterMinAggregateOutputType | null
    _max: TransporterMaxAggregateOutputType | null
  }

  type GetTransporterGroupByPayload<T extends TransporterGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransporterGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TransporterGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TransporterGroupByOutputType[P]>
            : GetScalarType<T[P], TransporterGroupByOutputType[P]>
        }
      >
    >


  export type TransporterSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    area?: boolean
    contactPersonName?: boolean
    contactNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dispatches?: boolean | Transporter$dispatchesArgs<ExtArgs>
    _count?: boolean | TransporterCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transporter"]>

  export type TransporterSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    area?: boolean
    contactPersonName?: boolean
    contactNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["transporter"]>

  export type TransporterSelectScalar = {
    id?: boolean
    name?: boolean
    area?: boolean
    contactPersonName?: boolean
    contactNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TransporterInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dispatches?: boolean | Transporter$dispatchesArgs<ExtArgs>
    _count?: boolean | TransporterCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TransporterIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TransporterPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Transporter"
    objects: {
      dispatches: Prisma.$DispatchPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      area: string | null
      contactPersonName: string | null
      contactNumber: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["transporter"]>
    composites: {}
  }

  type TransporterGetPayload<S extends boolean | null | undefined | TransporterDefaultArgs> = $Result.GetResult<Prisma.$TransporterPayload, S>

  type TransporterCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TransporterFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TransporterCountAggregateInputType | true
    }

  export interface TransporterDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Transporter'], meta: { name: 'Transporter' } }
    /**
     * Find zero or one Transporter that matches the filter.
     * @param {TransporterFindUniqueArgs} args - Arguments to find a Transporter
     * @example
     * // Get one Transporter
     * const transporter = await prisma.transporter.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransporterFindUniqueArgs>(args: SelectSubset<T, TransporterFindUniqueArgs<ExtArgs>>): Prisma__TransporterClient<$Result.GetResult<Prisma.$TransporterPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Transporter that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TransporterFindUniqueOrThrowArgs} args - Arguments to find a Transporter
     * @example
     * // Get one Transporter
     * const transporter = await prisma.transporter.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransporterFindUniqueOrThrowArgs>(args: SelectSubset<T, TransporterFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TransporterClient<$Result.GetResult<Prisma.$TransporterPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Transporter that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransporterFindFirstArgs} args - Arguments to find a Transporter
     * @example
     * // Get one Transporter
     * const transporter = await prisma.transporter.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransporterFindFirstArgs>(args?: SelectSubset<T, TransporterFindFirstArgs<ExtArgs>>): Prisma__TransporterClient<$Result.GetResult<Prisma.$TransporterPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Transporter that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransporterFindFirstOrThrowArgs} args - Arguments to find a Transporter
     * @example
     * // Get one Transporter
     * const transporter = await prisma.transporter.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransporterFindFirstOrThrowArgs>(args?: SelectSubset<T, TransporterFindFirstOrThrowArgs<ExtArgs>>): Prisma__TransporterClient<$Result.GetResult<Prisma.$TransporterPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Transporters that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransporterFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Transporters
     * const transporters = await prisma.transporter.findMany()
     * 
     * // Get first 10 Transporters
     * const transporters = await prisma.transporter.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const transporterWithIdOnly = await prisma.transporter.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TransporterFindManyArgs>(args?: SelectSubset<T, TransporterFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransporterPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Transporter.
     * @param {TransporterCreateArgs} args - Arguments to create a Transporter.
     * @example
     * // Create one Transporter
     * const Transporter = await prisma.transporter.create({
     *   data: {
     *     // ... data to create a Transporter
     *   }
     * })
     * 
     */
    create<T extends TransporterCreateArgs>(args: SelectSubset<T, TransporterCreateArgs<ExtArgs>>): Prisma__TransporterClient<$Result.GetResult<Prisma.$TransporterPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Transporters.
     * @param {TransporterCreateManyArgs} args - Arguments to create many Transporters.
     * @example
     * // Create many Transporters
     * const transporter = await prisma.transporter.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TransporterCreateManyArgs>(args?: SelectSubset<T, TransporterCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Transporters and returns the data saved in the database.
     * @param {TransporterCreateManyAndReturnArgs} args - Arguments to create many Transporters.
     * @example
     * // Create many Transporters
     * const transporter = await prisma.transporter.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Transporters and only return the `id`
     * const transporterWithIdOnly = await prisma.transporter.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TransporterCreateManyAndReturnArgs>(args?: SelectSubset<T, TransporterCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransporterPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Transporter.
     * @param {TransporterDeleteArgs} args - Arguments to delete one Transporter.
     * @example
     * // Delete one Transporter
     * const Transporter = await prisma.transporter.delete({
     *   where: {
     *     // ... filter to delete one Transporter
     *   }
     * })
     * 
     */
    delete<T extends TransporterDeleteArgs>(args: SelectSubset<T, TransporterDeleteArgs<ExtArgs>>): Prisma__TransporterClient<$Result.GetResult<Prisma.$TransporterPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Transporter.
     * @param {TransporterUpdateArgs} args - Arguments to update one Transporter.
     * @example
     * // Update one Transporter
     * const transporter = await prisma.transporter.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TransporterUpdateArgs>(args: SelectSubset<T, TransporterUpdateArgs<ExtArgs>>): Prisma__TransporterClient<$Result.GetResult<Prisma.$TransporterPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Transporters.
     * @param {TransporterDeleteManyArgs} args - Arguments to filter Transporters to delete.
     * @example
     * // Delete a few Transporters
     * const { count } = await prisma.transporter.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TransporterDeleteManyArgs>(args?: SelectSubset<T, TransporterDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transporters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransporterUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Transporters
     * const transporter = await prisma.transporter.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TransporterUpdateManyArgs>(args: SelectSubset<T, TransporterUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Transporter.
     * @param {TransporterUpsertArgs} args - Arguments to update or create a Transporter.
     * @example
     * // Update or create a Transporter
     * const transporter = await prisma.transporter.upsert({
     *   create: {
     *     // ... data to create a Transporter
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Transporter we want to update
     *   }
     * })
     */
    upsert<T extends TransporterUpsertArgs>(args: SelectSubset<T, TransporterUpsertArgs<ExtArgs>>): Prisma__TransporterClient<$Result.GetResult<Prisma.$TransporterPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Transporters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransporterCountArgs} args - Arguments to filter Transporters to count.
     * @example
     * // Count the number of Transporters
     * const count = await prisma.transporter.count({
     *   where: {
     *     // ... the filter for the Transporters we want to count
     *   }
     * })
    **/
    count<T extends TransporterCountArgs>(
      args?: Subset<T, TransporterCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransporterCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Transporter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransporterAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TransporterAggregateArgs>(args: Subset<T, TransporterAggregateArgs>): Prisma.PrismaPromise<GetTransporterAggregateType<T>>

    /**
     * Group by Transporter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransporterGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TransporterGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransporterGroupByArgs['orderBy'] }
        : { orderBy?: TransporterGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TransporterGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTransporterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Transporter model
   */
  readonly fields: TransporterFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Transporter.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransporterClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    dispatches<T extends Transporter$dispatchesArgs<ExtArgs> = {}>(args?: Subset<T, Transporter$dispatchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Transporter model
   */ 
  interface TransporterFieldRefs {
    readonly id: FieldRef<"Transporter", 'String'>
    readonly name: FieldRef<"Transporter", 'String'>
    readonly area: FieldRef<"Transporter", 'String'>
    readonly contactPersonName: FieldRef<"Transporter", 'String'>
    readonly contactNumber: FieldRef<"Transporter", 'String'>
    readonly createdAt: FieldRef<"Transporter", 'DateTime'>
    readonly updatedAt: FieldRef<"Transporter", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Transporter findUnique
   */
  export type TransporterFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transporter
     */
    select?: TransporterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransporterInclude<ExtArgs> | null
    /**
     * Filter, which Transporter to fetch.
     */
    where: TransporterWhereUniqueInput
  }

  /**
   * Transporter findUniqueOrThrow
   */
  export type TransporterFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transporter
     */
    select?: TransporterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransporterInclude<ExtArgs> | null
    /**
     * Filter, which Transporter to fetch.
     */
    where: TransporterWhereUniqueInput
  }

  /**
   * Transporter findFirst
   */
  export type TransporterFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transporter
     */
    select?: TransporterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransporterInclude<ExtArgs> | null
    /**
     * Filter, which Transporter to fetch.
     */
    where?: TransporterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transporters to fetch.
     */
    orderBy?: TransporterOrderByWithRelationInput | TransporterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transporters.
     */
    cursor?: TransporterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transporters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transporters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transporters.
     */
    distinct?: TransporterScalarFieldEnum | TransporterScalarFieldEnum[]
  }

  /**
   * Transporter findFirstOrThrow
   */
  export type TransporterFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transporter
     */
    select?: TransporterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransporterInclude<ExtArgs> | null
    /**
     * Filter, which Transporter to fetch.
     */
    where?: TransporterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transporters to fetch.
     */
    orderBy?: TransporterOrderByWithRelationInput | TransporterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transporters.
     */
    cursor?: TransporterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transporters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transporters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transporters.
     */
    distinct?: TransporterScalarFieldEnum | TransporterScalarFieldEnum[]
  }

  /**
   * Transporter findMany
   */
  export type TransporterFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transporter
     */
    select?: TransporterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransporterInclude<ExtArgs> | null
    /**
     * Filter, which Transporters to fetch.
     */
    where?: TransporterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transporters to fetch.
     */
    orderBy?: TransporterOrderByWithRelationInput | TransporterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Transporters.
     */
    cursor?: TransporterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transporters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transporters.
     */
    skip?: number
    distinct?: TransporterScalarFieldEnum | TransporterScalarFieldEnum[]
  }

  /**
   * Transporter create
   */
  export type TransporterCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transporter
     */
    select?: TransporterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransporterInclude<ExtArgs> | null
    /**
     * The data needed to create a Transporter.
     */
    data: XOR<TransporterCreateInput, TransporterUncheckedCreateInput>
  }

  /**
   * Transporter createMany
   */
  export type TransporterCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Transporters.
     */
    data: TransporterCreateManyInput | TransporterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Transporter createManyAndReturn
   */
  export type TransporterCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transporter
     */
    select?: TransporterSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Transporters.
     */
    data: TransporterCreateManyInput | TransporterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Transporter update
   */
  export type TransporterUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transporter
     */
    select?: TransporterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransporterInclude<ExtArgs> | null
    /**
     * The data needed to update a Transporter.
     */
    data: XOR<TransporterUpdateInput, TransporterUncheckedUpdateInput>
    /**
     * Choose, which Transporter to update.
     */
    where: TransporterWhereUniqueInput
  }

  /**
   * Transporter updateMany
   */
  export type TransporterUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Transporters.
     */
    data: XOR<TransporterUpdateManyMutationInput, TransporterUncheckedUpdateManyInput>
    /**
     * Filter which Transporters to update
     */
    where?: TransporterWhereInput
  }

  /**
   * Transporter upsert
   */
  export type TransporterUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transporter
     */
    select?: TransporterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransporterInclude<ExtArgs> | null
    /**
     * The filter to search for the Transporter to update in case it exists.
     */
    where: TransporterWhereUniqueInput
    /**
     * In case the Transporter found by the `where` argument doesn't exist, create a new Transporter with this data.
     */
    create: XOR<TransporterCreateInput, TransporterUncheckedCreateInput>
    /**
     * In case the Transporter was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransporterUpdateInput, TransporterUncheckedUpdateInput>
  }

  /**
   * Transporter delete
   */
  export type TransporterDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transporter
     */
    select?: TransporterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransporterInclude<ExtArgs> | null
    /**
     * Filter which Transporter to delete.
     */
    where: TransporterWhereUniqueInput
  }

  /**
   * Transporter deleteMany
   */
  export type TransporterDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transporters to delete
     */
    where?: TransporterWhereInput
  }

  /**
   * Transporter.dispatches
   */
  export type Transporter$dispatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
    where?: DispatchWhereInput
    orderBy?: DispatchOrderByWithRelationInput | DispatchOrderByWithRelationInput[]
    cursor?: DispatchWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DispatchScalarFieldEnum | DispatchScalarFieldEnum[]
  }

  /**
   * Transporter without action
   */
  export type TransporterDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transporter
     */
    select?: TransporterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransporterInclude<ExtArgs> | null
  }


  /**
   * Model Customer
   */

  export type AggregateCustomer = {
    _count: CustomerCountAggregateOutputType | null
    _min: CustomerMinAggregateOutputType | null
    _max: CustomerMaxAggregateOutputType | null
  }

  export type CustomerMinAggregateOutputType = {
    id: string | null
    name: string | null
    category: $Enums.CustomerCategory | null
    contactNumber: string | null
    pocName: string | null
    area: string | null
    industrySector: string | null
    dealById: string | null
    approachForFundsId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustomerMaxAggregateOutputType = {
    id: string | null
    name: string | null
    category: $Enums.CustomerCategory | null
    contactNumber: string | null
    pocName: string | null
    area: string | null
    industrySector: string | null
    dealById: string | null
    approachForFundsId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustomerCountAggregateOutputType = {
    id: number
    name: number
    category: number
    contactNumber: number
    pocName: number
    area: number
    industrySector: number
    dealById: number
    approachForFundsId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CustomerMinAggregateInputType = {
    id?: true
    name?: true
    category?: true
    contactNumber?: true
    pocName?: true
    area?: true
    industrySector?: true
    dealById?: true
    approachForFundsId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustomerMaxAggregateInputType = {
    id?: true
    name?: true
    category?: true
    contactNumber?: true
    pocName?: true
    area?: true
    industrySector?: true
    dealById?: true
    approachForFundsId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustomerCountAggregateInputType = {
    id?: true
    name?: true
    category?: true
    contactNumber?: true
    pocName?: true
    area?: true
    industrySector?: true
    dealById?: true
    approachForFundsId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CustomerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Customer to aggregate.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Customers
    **/
    _count?: true | CustomerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CustomerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CustomerMaxAggregateInputType
  }

  export type GetCustomerAggregateType<T extends CustomerAggregateArgs> = {
        [P in keyof T & keyof AggregateCustomer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCustomer[P]>
      : GetScalarType<T[P], AggregateCustomer[P]>
  }




  export type CustomerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerWhereInput
    orderBy?: CustomerOrderByWithAggregationInput | CustomerOrderByWithAggregationInput[]
    by: CustomerScalarFieldEnum[] | CustomerScalarFieldEnum
    having?: CustomerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CustomerCountAggregateInputType | true
    _min?: CustomerMinAggregateInputType
    _max?: CustomerMaxAggregateInputType
  }

  export type CustomerGroupByOutputType = {
    id: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber: string | null
    pocName: string | null
    area: string | null
    industrySector: string | null
    dealById: string | null
    approachForFundsId: string | null
    createdAt: Date
    updatedAt: Date
    _count: CustomerCountAggregateOutputType | null
    _min: CustomerMinAggregateOutputType | null
    _max: CustomerMaxAggregateOutputType | null
  }

  type GetCustomerGroupByPayload<T extends CustomerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CustomerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CustomerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CustomerGroupByOutputType[P]>
            : GetScalarType<T[P], CustomerGroupByOutputType[P]>
        }
      >
    >


  export type CustomerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    category?: boolean
    contactNumber?: boolean
    pocName?: boolean
    area?: boolean
    industrySector?: boolean
    dealById?: boolean
    approachForFundsId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dealBy?: boolean | Customer$dealByArgs<ExtArgs>
    approachForFunds?: boolean | Customer$approachForFundsArgs<ExtArgs>
    vessels?: boolean | Customer$vesselsArgs<ExtArgs>
    orders?: boolean | Customer$ordersArgs<ExtArgs>
    purchaseOrders?: boolean | Customer$purchaseOrdersArgs<ExtArgs>
    dispatches?: boolean | Customer$dispatchesArgs<ExtArgs>
    _count?: boolean | CustomerCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["customer"]>

  export type CustomerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    category?: boolean
    contactNumber?: boolean
    pocName?: boolean
    area?: boolean
    industrySector?: boolean
    dealById?: boolean
    approachForFundsId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dealBy?: boolean | Customer$dealByArgs<ExtArgs>
    approachForFunds?: boolean | Customer$approachForFundsArgs<ExtArgs>
  }, ExtArgs["result"]["customer"]>

  export type CustomerSelectScalar = {
    id?: boolean
    name?: boolean
    category?: boolean
    contactNumber?: boolean
    pocName?: boolean
    area?: boolean
    industrySector?: boolean
    dealById?: boolean
    approachForFundsId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CustomerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dealBy?: boolean | Customer$dealByArgs<ExtArgs>
    approachForFunds?: boolean | Customer$approachForFundsArgs<ExtArgs>
    vessels?: boolean | Customer$vesselsArgs<ExtArgs>
    orders?: boolean | Customer$ordersArgs<ExtArgs>
    purchaseOrders?: boolean | Customer$purchaseOrdersArgs<ExtArgs>
    dispatches?: boolean | Customer$dispatchesArgs<ExtArgs>
    _count?: boolean | CustomerCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CustomerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dealBy?: boolean | Customer$dealByArgs<ExtArgs>
    approachForFunds?: boolean | Customer$approachForFundsArgs<ExtArgs>
  }

  export type $CustomerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Customer"
    objects: {
      dealBy: Prisma.$StaffPayload<ExtArgs> | null
      approachForFunds: Prisma.$StaffPayload<ExtArgs> | null
      vessels: Prisma.$VesselPayload<ExtArgs>[]
      orders: Prisma.$OrderPayload<ExtArgs>[]
      purchaseOrders: Prisma.$PurchaseOrderPayload<ExtArgs>[]
      dispatches: Prisma.$DispatchPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      category: $Enums.CustomerCategory
      contactNumber: string | null
      pocName: string | null
      area: string | null
      industrySector: string | null
      dealById: string | null
      approachForFundsId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["customer"]>
    composites: {}
  }

  type CustomerGetPayload<S extends boolean | null | undefined | CustomerDefaultArgs> = $Result.GetResult<Prisma.$CustomerPayload, S>

  type CustomerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CustomerFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CustomerCountAggregateInputType | true
    }

  export interface CustomerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Customer'], meta: { name: 'Customer' } }
    /**
     * Find zero or one Customer that matches the filter.
     * @param {CustomerFindUniqueArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CustomerFindUniqueArgs>(args: SelectSubset<T, CustomerFindUniqueArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Customer that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CustomerFindUniqueOrThrowArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CustomerFindUniqueOrThrowArgs>(args: SelectSubset<T, CustomerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Customer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindFirstArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CustomerFindFirstArgs>(args?: SelectSubset<T, CustomerFindFirstArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Customer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindFirstOrThrowArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CustomerFindFirstOrThrowArgs>(args?: SelectSubset<T, CustomerFindFirstOrThrowArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Customers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Customers
     * const customers = await prisma.customer.findMany()
     * 
     * // Get first 10 Customers
     * const customers = await prisma.customer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const customerWithIdOnly = await prisma.customer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CustomerFindManyArgs>(args?: SelectSubset<T, CustomerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Customer.
     * @param {CustomerCreateArgs} args - Arguments to create a Customer.
     * @example
     * // Create one Customer
     * const Customer = await prisma.customer.create({
     *   data: {
     *     // ... data to create a Customer
     *   }
     * })
     * 
     */
    create<T extends CustomerCreateArgs>(args: SelectSubset<T, CustomerCreateArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Customers.
     * @param {CustomerCreateManyArgs} args - Arguments to create many Customers.
     * @example
     * // Create many Customers
     * const customer = await prisma.customer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CustomerCreateManyArgs>(args?: SelectSubset<T, CustomerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Customers and returns the data saved in the database.
     * @param {CustomerCreateManyAndReturnArgs} args - Arguments to create many Customers.
     * @example
     * // Create many Customers
     * const customer = await prisma.customer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Customers and only return the `id`
     * const customerWithIdOnly = await prisma.customer.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CustomerCreateManyAndReturnArgs>(args?: SelectSubset<T, CustomerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Customer.
     * @param {CustomerDeleteArgs} args - Arguments to delete one Customer.
     * @example
     * // Delete one Customer
     * const Customer = await prisma.customer.delete({
     *   where: {
     *     // ... filter to delete one Customer
     *   }
     * })
     * 
     */
    delete<T extends CustomerDeleteArgs>(args: SelectSubset<T, CustomerDeleteArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Customer.
     * @param {CustomerUpdateArgs} args - Arguments to update one Customer.
     * @example
     * // Update one Customer
     * const customer = await prisma.customer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CustomerUpdateArgs>(args: SelectSubset<T, CustomerUpdateArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Customers.
     * @param {CustomerDeleteManyArgs} args - Arguments to filter Customers to delete.
     * @example
     * // Delete a few Customers
     * const { count } = await prisma.customer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CustomerDeleteManyArgs>(args?: SelectSubset<T, CustomerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Customers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Customers
     * const customer = await prisma.customer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CustomerUpdateManyArgs>(args: SelectSubset<T, CustomerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Customer.
     * @param {CustomerUpsertArgs} args - Arguments to update or create a Customer.
     * @example
     * // Update or create a Customer
     * const customer = await prisma.customer.upsert({
     *   create: {
     *     // ... data to create a Customer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Customer we want to update
     *   }
     * })
     */
    upsert<T extends CustomerUpsertArgs>(args: SelectSubset<T, CustomerUpsertArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Customers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerCountArgs} args - Arguments to filter Customers to count.
     * @example
     * // Count the number of Customers
     * const count = await prisma.customer.count({
     *   where: {
     *     // ... the filter for the Customers we want to count
     *   }
     * })
    **/
    count<T extends CustomerCountArgs>(
      args?: Subset<T, CustomerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CustomerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Customer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CustomerAggregateArgs>(args: Subset<T, CustomerAggregateArgs>): Prisma.PrismaPromise<GetCustomerAggregateType<T>>

    /**
     * Group by Customer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CustomerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CustomerGroupByArgs['orderBy'] }
        : { orderBy?: CustomerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CustomerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Customer model
   */
  readonly fields: CustomerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Customer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CustomerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    dealBy<T extends Customer$dealByArgs<ExtArgs> = {}>(args?: Subset<T, Customer$dealByArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    approachForFunds<T extends Customer$approachForFundsArgs<ExtArgs> = {}>(args?: Subset<T, Customer$approachForFundsArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    vessels<T extends Customer$vesselsArgs<ExtArgs> = {}>(args?: Subset<T, Customer$vesselsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VesselPayload<ExtArgs>, T, "findMany"> | Null>
    orders<T extends Customer$ordersArgs<ExtArgs> = {}>(args?: Subset<T, Customer$ordersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany"> | Null>
    purchaseOrders<T extends Customer$purchaseOrdersArgs<ExtArgs> = {}>(args?: Subset<T, Customer$purchaseOrdersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findMany"> | Null>
    dispatches<T extends Customer$dispatchesArgs<ExtArgs> = {}>(args?: Subset<T, Customer$dispatchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Customer model
   */ 
  interface CustomerFieldRefs {
    readonly id: FieldRef<"Customer", 'String'>
    readonly name: FieldRef<"Customer", 'String'>
    readonly category: FieldRef<"Customer", 'CustomerCategory'>
    readonly contactNumber: FieldRef<"Customer", 'String'>
    readonly pocName: FieldRef<"Customer", 'String'>
    readonly area: FieldRef<"Customer", 'String'>
    readonly industrySector: FieldRef<"Customer", 'String'>
    readonly dealById: FieldRef<"Customer", 'String'>
    readonly approachForFundsId: FieldRef<"Customer", 'String'>
    readonly createdAt: FieldRef<"Customer", 'DateTime'>
    readonly updatedAt: FieldRef<"Customer", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Customer findUnique
   */
  export type CustomerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer findUniqueOrThrow
   */
  export type CustomerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer findFirst
   */
  export type CustomerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Customers.
     */
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer findFirstOrThrow
   */
  export type CustomerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Customers.
     */
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer findMany
   */
  export type CustomerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customers to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer create
   */
  export type CustomerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The data needed to create a Customer.
     */
    data: XOR<CustomerCreateInput, CustomerUncheckedCreateInput>
  }

  /**
   * Customer createMany
   */
  export type CustomerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Customers.
     */
    data: CustomerCreateManyInput | CustomerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Customer createManyAndReturn
   */
  export type CustomerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Customers.
     */
    data: CustomerCreateManyInput | CustomerCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Customer update
   */
  export type CustomerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The data needed to update a Customer.
     */
    data: XOR<CustomerUpdateInput, CustomerUncheckedUpdateInput>
    /**
     * Choose, which Customer to update.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer updateMany
   */
  export type CustomerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Customers.
     */
    data: XOR<CustomerUpdateManyMutationInput, CustomerUncheckedUpdateManyInput>
    /**
     * Filter which Customers to update
     */
    where?: CustomerWhereInput
  }

  /**
   * Customer upsert
   */
  export type CustomerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The filter to search for the Customer to update in case it exists.
     */
    where: CustomerWhereUniqueInput
    /**
     * In case the Customer found by the `where` argument doesn't exist, create a new Customer with this data.
     */
    create: XOR<CustomerCreateInput, CustomerUncheckedCreateInput>
    /**
     * In case the Customer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CustomerUpdateInput, CustomerUncheckedUpdateInput>
  }

  /**
   * Customer delete
   */
  export type CustomerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter which Customer to delete.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer deleteMany
   */
  export type CustomerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Customers to delete
     */
    where?: CustomerWhereInput
  }

  /**
   * Customer.dealBy
   */
  export type Customer$dealByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    where?: StaffWhereInput
  }

  /**
   * Customer.approachForFunds
   */
  export type Customer$approachForFundsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    where?: StaffWhereInput
  }

  /**
   * Customer.vessels
   */
  export type Customer$vesselsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vessel
     */
    select?: VesselSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VesselInclude<ExtArgs> | null
    where?: VesselWhereInput
    orderBy?: VesselOrderByWithRelationInput | VesselOrderByWithRelationInput[]
    cursor?: VesselWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VesselScalarFieldEnum | VesselScalarFieldEnum[]
  }

  /**
   * Customer.orders
   */
  export type Customer$ordersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    cursor?: OrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Customer.purchaseOrders
   */
  export type Customer$purchaseOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    where?: PurchaseOrderWhereInput
    orderBy?: PurchaseOrderOrderByWithRelationInput | PurchaseOrderOrderByWithRelationInput[]
    cursor?: PurchaseOrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PurchaseOrderScalarFieldEnum | PurchaseOrderScalarFieldEnum[]
  }

  /**
   * Customer.dispatches
   */
  export type Customer$dispatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
    where?: DispatchWhereInput
    orderBy?: DispatchOrderByWithRelationInput | DispatchOrderByWithRelationInput[]
    cursor?: DispatchWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DispatchScalarFieldEnum | DispatchScalarFieldEnum[]
  }

  /**
   * Customer without action
   */
  export type CustomerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
  }


  /**
   * Model Vessel
   */

  export type AggregateVessel = {
    _count: VesselCountAggregateOutputType | null
    _avg: VesselAvgAggregateOutputType | null
    _sum: VesselSumAggregateOutputType | null
    _min: VesselMinAggregateOutputType | null
    _max: VesselMaxAggregateOutputType | null
  }

  export type VesselAvgAggregateOutputType = {
    quantity: Decimal | null
    dispatchedQuantity: Decimal | null
  }

  export type VesselSumAggregateOutputType = {
    quantity: Decimal | null
    dispatchedQuantity: Decimal | null
  }

  export type VesselMinAggregateOutputType = {
    id: string | null
    vesselName: string | null
    importerId: string | null
    quality: string | null
    quantity: Decimal | null
    dispatchedQuantity: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VesselMaxAggregateOutputType = {
    id: string | null
    vesselName: string | null
    importerId: string | null
    quality: string | null
    quantity: Decimal | null
    dispatchedQuantity: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VesselCountAggregateOutputType = {
    id: number
    vesselName: number
    importerId: number
    quality: number
    quantity: number
    dispatchedQuantity: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type VesselAvgAggregateInputType = {
    quantity?: true
    dispatchedQuantity?: true
  }

  export type VesselSumAggregateInputType = {
    quantity?: true
    dispatchedQuantity?: true
  }

  export type VesselMinAggregateInputType = {
    id?: true
    vesselName?: true
    importerId?: true
    quality?: true
    quantity?: true
    dispatchedQuantity?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VesselMaxAggregateInputType = {
    id?: true
    vesselName?: true
    importerId?: true
    quality?: true
    quantity?: true
    dispatchedQuantity?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VesselCountAggregateInputType = {
    id?: true
    vesselName?: true
    importerId?: true
    quality?: true
    quantity?: true
    dispatchedQuantity?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type VesselAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vessel to aggregate.
     */
    where?: VesselWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vessels to fetch.
     */
    orderBy?: VesselOrderByWithRelationInput | VesselOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VesselWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vessels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vessels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Vessels
    **/
    _count?: true | VesselCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VesselAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VesselSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VesselMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VesselMaxAggregateInputType
  }

  export type GetVesselAggregateType<T extends VesselAggregateArgs> = {
        [P in keyof T & keyof AggregateVessel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVessel[P]>
      : GetScalarType<T[P], AggregateVessel[P]>
  }




  export type VesselGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VesselWhereInput
    orderBy?: VesselOrderByWithAggregationInput | VesselOrderByWithAggregationInput[]
    by: VesselScalarFieldEnum[] | VesselScalarFieldEnum
    having?: VesselScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VesselCountAggregateInputType | true
    _avg?: VesselAvgAggregateInputType
    _sum?: VesselSumAggregateInputType
    _min?: VesselMinAggregateInputType
    _max?: VesselMaxAggregateInputType
  }

  export type VesselGroupByOutputType = {
    id: string
    vesselName: string
    importerId: string
    quality: string | null
    quantity: Decimal
    dispatchedQuantity: Decimal
    createdAt: Date
    updatedAt: Date
    _count: VesselCountAggregateOutputType | null
    _avg: VesselAvgAggregateOutputType | null
    _sum: VesselSumAggregateOutputType | null
    _min: VesselMinAggregateOutputType | null
    _max: VesselMaxAggregateOutputType | null
  }

  type GetVesselGroupByPayload<T extends VesselGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VesselGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VesselGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VesselGroupByOutputType[P]>
            : GetScalarType<T[P], VesselGroupByOutputType[P]>
        }
      >
    >


  export type VesselSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vesselName?: boolean
    importerId?: boolean
    quality?: boolean
    quantity?: boolean
    dispatchedQuantity?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    importer?: boolean | CustomerDefaultArgs<ExtArgs>
    purchaseOrders?: boolean | Vessel$purchaseOrdersArgs<ExtArgs>
    dispatches?: boolean | Vessel$dispatchesArgs<ExtArgs>
    _count?: boolean | VesselCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vessel"]>

  export type VesselSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vesselName?: boolean
    importerId?: boolean
    quality?: boolean
    quantity?: boolean
    dispatchedQuantity?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    importer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vessel"]>

  export type VesselSelectScalar = {
    id?: boolean
    vesselName?: boolean
    importerId?: boolean
    quality?: boolean
    quantity?: boolean
    dispatchedQuantity?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type VesselInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    importer?: boolean | CustomerDefaultArgs<ExtArgs>
    purchaseOrders?: boolean | Vessel$purchaseOrdersArgs<ExtArgs>
    dispatches?: boolean | Vessel$dispatchesArgs<ExtArgs>
    _count?: boolean | VesselCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type VesselIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    importer?: boolean | CustomerDefaultArgs<ExtArgs>
  }

  export type $VesselPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Vessel"
    objects: {
      importer: Prisma.$CustomerPayload<ExtArgs>
      purchaseOrders: Prisma.$PurchaseOrderPayload<ExtArgs>[]
      dispatches: Prisma.$DispatchPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      vesselName: string
      importerId: string
      quality: string | null
      quantity: Prisma.Decimal
      /**
       * Accumulated by dispatch transactions only — never write from forms.
       */
      dispatchedQuantity: Prisma.Decimal
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["vessel"]>
    composites: {}
  }

  type VesselGetPayload<S extends boolean | null | undefined | VesselDefaultArgs> = $Result.GetResult<Prisma.$VesselPayload, S>

  type VesselCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<VesselFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: VesselCountAggregateInputType | true
    }

  export interface VesselDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Vessel'], meta: { name: 'Vessel' } }
    /**
     * Find zero or one Vessel that matches the filter.
     * @param {VesselFindUniqueArgs} args - Arguments to find a Vessel
     * @example
     * // Get one Vessel
     * const vessel = await prisma.vessel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VesselFindUniqueArgs>(args: SelectSubset<T, VesselFindUniqueArgs<ExtArgs>>): Prisma__VesselClient<$Result.GetResult<Prisma.$VesselPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Vessel that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {VesselFindUniqueOrThrowArgs} args - Arguments to find a Vessel
     * @example
     * // Get one Vessel
     * const vessel = await prisma.vessel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VesselFindUniqueOrThrowArgs>(args: SelectSubset<T, VesselFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VesselClient<$Result.GetResult<Prisma.$VesselPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Vessel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VesselFindFirstArgs} args - Arguments to find a Vessel
     * @example
     * // Get one Vessel
     * const vessel = await prisma.vessel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VesselFindFirstArgs>(args?: SelectSubset<T, VesselFindFirstArgs<ExtArgs>>): Prisma__VesselClient<$Result.GetResult<Prisma.$VesselPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Vessel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VesselFindFirstOrThrowArgs} args - Arguments to find a Vessel
     * @example
     * // Get one Vessel
     * const vessel = await prisma.vessel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VesselFindFirstOrThrowArgs>(args?: SelectSubset<T, VesselFindFirstOrThrowArgs<ExtArgs>>): Prisma__VesselClient<$Result.GetResult<Prisma.$VesselPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Vessels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VesselFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Vessels
     * const vessels = await prisma.vessel.findMany()
     * 
     * // Get first 10 Vessels
     * const vessels = await prisma.vessel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const vesselWithIdOnly = await prisma.vessel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VesselFindManyArgs>(args?: SelectSubset<T, VesselFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VesselPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Vessel.
     * @param {VesselCreateArgs} args - Arguments to create a Vessel.
     * @example
     * // Create one Vessel
     * const Vessel = await prisma.vessel.create({
     *   data: {
     *     // ... data to create a Vessel
     *   }
     * })
     * 
     */
    create<T extends VesselCreateArgs>(args: SelectSubset<T, VesselCreateArgs<ExtArgs>>): Prisma__VesselClient<$Result.GetResult<Prisma.$VesselPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Vessels.
     * @param {VesselCreateManyArgs} args - Arguments to create many Vessels.
     * @example
     * // Create many Vessels
     * const vessel = await prisma.vessel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VesselCreateManyArgs>(args?: SelectSubset<T, VesselCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Vessels and returns the data saved in the database.
     * @param {VesselCreateManyAndReturnArgs} args - Arguments to create many Vessels.
     * @example
     * // Create many Vessels
     * const vessel = await prisma.vessel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Vessels and only return the `id`
     * const vesselWithIdOnly = await prisma.vessel.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VesselCreateManyAndReturnArgs>(args?: SelectSubset<T, VesselCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VesselPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Vessel.
     * @param {VesselDeleteArgs} args - Arguments to delete one Vessel.
     * @example
     * // Delete one Vessel
     * const Vessel = await prisma.vessel.delete({
     *   where: {
     *     // ... filter to delete one Vessel
     *   }
     * })
     * 
     */
    delete<T extends VesselDeleteArgs>(args: SelectSubset<T, VesselDeleteArgs<ExtArgs>>): Prisma__VesselClient<$Result.GetResult<Prisma.$VesselPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Vessel.
     * @param {VesselUpdateArgs} args - Arguments to update one Vessel.
     * @example
     * // Update one Vessel
     * const vessel = await prisma.vessel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VesselUpdateArgs>(args: SelectSubset<T, VesselUpdateArgs<ExtArgs>>): Prisma__VesselClient<$Result.GetResult<Prisma.$VesselPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Vessels.
     * @param {VesselDeleteManyArgs} args - Arguments to filter Vessels to delete.
     * @example
     * // Delete a few Vessels
     * const { count } = await prisma.vessel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VesselDeleteManyArgs>(args?: SelectSubset<T, VesselDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Vessels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VesselUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Vessels
     * const vessel = await prisma.vessel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VesselUpdateManyArgs>(args: SelectSubset<T, VesselUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Vessel.
     * @param {VesselUpsertArgs} args - Arguments to update or create a Vessel.
     * @example
     * // Update or create a Vessel
     * const vessel = await prisma.vessel.upsert({
     *   create: {
     *     // ... data to create a Vessel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Vessel we want to update
     *   }
     * })
     */
    upsert<T extends VesselUpsertArgs>(args: SelectSubset<T, VesselUpsertArgs<ExtArgs>>): Prisma__VesselClient<$Result.GetResult<Prisma.$VesselPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Vessels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VesselCountArgs} args - Arguments to filter Vessels to count.
     * @example
     * // Count the number of Vessels
     * const count = await prisma.vessel.count({
     *   where: {
     *     // ... the filter for the Vessels we want to count
     *   }
     * })
    **/
    count<T extends VesselCountArgs>(
      args?: Subset<T, VesselCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VesselCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Vessel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VesselAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VesselAggregateArgs>(args: Subset<T, VesselAggregateArgs>): Prisma.PrismaPromise<GetVesselAggregateType<T>>

    /**
     * Group by Vessel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VesselGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VesselGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VesselGroupByArgs['orderBy'] }
        : { orderBy?: VesselGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VesselGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVesselGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Vessel model
   */
  readonly fields: VesselFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Vessel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VesselClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    importer<T extends CustomerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustomerDefaultArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    purchaseOrders<T extends Vessel$purchaseOrdersArgs<ExtArgs> = {}>(args?: Subset<T, Vessel$purchaseOrdersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findMany"> | Null>
    dispatches<T extends Vessel$dispatchesArgs<ExtArgs> = {}>(args?: Subset<T, Vessel$dispatchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Vessel model
   */ 
  interface VesselFieldRefs {
    readonly id: FieldRef<"Vessel", 'String'>
    readonly vesselName: FieldRef<"Vessel", 'String'>
    readonly importerId: FieldRef<"Vessel", 'String'>
    readonly quality: FieldRef<"Vessel", 'String'>
    readonly quantity: FieldRef<"Vessel", 'Decimal'>
    readonly dispatchedQuantity: FieldRef<"Vessel", 'Decimal'>
    readonly createdAt: FieldRef<"Vessel", 'DateTime'>
    readonly updatedAt: FieldRef<"Vessel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Vessel findUnique
   */
  export type VesselFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vessel
     */
    select?: VesselSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VesselInclude<ExtArgs> | null
    /**
     * Filter, which Vessel to fetch.
     */
    where: VesselWhereUniqueInput
  }

  /**
   * Vessel findUniqueOrThrow
   */
  export type VesselFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vessel
     */
    select?: VesselSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VesselInclude<ExtArgs> | null
    /**
     * Filter, which Vessel to fetch.
     */
    where: VesselWhereUniqueInput
  }

  /**
   * Vessel findFirst
   */
  export type VesselFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vessel
     */
    select?: VesselSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VesselInclude<ExtArgs> | null
    /**
     * Filter, which Vessel to fetch.
     */
    where?: VesselWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vessels to fetch.
     */
    orderBy?: VesselOrderByWithRelationInput | VesselOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vessels.
     */
    cursor?: VesselWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vessels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vessels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vessels.
     */
    distinct?: VesselScalarFieldEnum | VesselScalarFieldEnum[]
  }

  /**
   * Vessel findFirstOrThrow
   */
  export type VesselFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vessel
     */
    select?: VesselSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VesselInclude<ExtArgs> | null
    /**
     * Filter, which Vessel to fetch.
     */
    where?: VesselWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vessels to fetch.
     */
    orderBy?: VesselOrderByWithRelationInput | VesselOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vessels.
     */
    cursor?: VesselWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vessels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vessels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vessels.
     */
    distinct?: VesselScalarFieldEnum | VesselScalarFieldEnum[]
  }

  /**
   * Vessel findMany
   */
  export type VesselFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vessel
     */
    select?: VesselSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VesselInclude<ExtArgs> | null
    /**
     * Filter, which Vessels to fetch.
     */
    where?: VesselWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vessels to fetch.
     */
    orderBy?: VesselOrderByWithRelationInput | VesselOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Vessels.
     */
    cursor?: VesselWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vessels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vessels.
     */
    skip?: number
    distinct?: VesselScalarFieldEnum | VesselScalarFieldEnum[]
  }

  /**
   * Vessel create
   */
  export type VesselCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vessel
     */
    select?: VesselSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VesselInclude<ExtArgs> | null
    /**
     * The data needed to create a Vessel.
     */
    data: XOR<VesselCreateInput, VesselUncheckedCreateInput>
  }

  /**
   * Vessel createMany
   */
  export type VesselCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Vessels.
     */
    data: VesselCreateManyInput | VesselCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Vessel createManyAndReturn
   */
  export type VesselCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vessel
     */
    select?: VesselSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Vessels.
     */
    data: VesselCreateManyInput | VesselCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VesselIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Vessel update
   */
  export type VesselUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vessel
     */
    select?: VesselSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VesselInclude<ExtArgs> | null
    /**
     * The data needed to update a Vessel.
     */
    data: XOR<VesselUpdateInput, VesselUncheckedUpdateInput>
    /**
     * Choose, which Vessel to update.
     */
    where: VesselWhereUniqueInput
  }

  /**
   * Vessel updateMany
   */
  export type VesselUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Vessels.
     */
    data: XOR<VesselUpdateManyMutationInput, VesselUncheckedUpdateManyInput>
    /**
     * Filter which Vessels to update
     */
    where?: VesselWhereInput
  }

  /**
   * Vessel upsert
   */
  export type VesselUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vessel
     */
    select?: VesselSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VesselInclude<ExtArgs> | null
    /**
     * The filter to search for the Vessel to update in case it exists.
     */
    where: VesselWhereUniqueInput
    /**
     * In case the Vessel found by the `where` argument doesn't exist, create a new Vessel with this data.
     */
    create: XOR<VesselCreateInput, VesselUncheckedCreateInput>
    /**
     * In case the Vessel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VesselUpdateInput, VesselUncheckedUpdateInput>
  }

  /**
   * Vessel delete
   */
  export type VesselDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vessel
     */
    select?: VesselSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VesselInclude<ExtArgs> | null
    /**
     * Filter which Vessel to delete.
     */
    where: VesselWhereUniqueInput
  }

  /**
   * Vessel deleteMany
   */
  export type VesselDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vessels to delete
     */
    where?: VesselWhereInput
  }

  /**
   * Vessel.purchaseOrders
   */
  export type Vessel$purchaseOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    where?: PurchaseOrderWhereInput
    orderBy?: PurchaseOrderOrderByWithRelationInput | PurchaseOrderOrderByWithRelationInput[]
    cursor?: PurchaseOrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PurchaseOrderScalarFieldEnum | PurchaseOrderScalarFieldEnum[]
  }

  /**
   * Vessel.dispatches
   */
  export type Vessel$dispatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
    where?: DispatchWhereInput
    orderBy?: DispatchOrderByWithRelationInput | DispatchOrderByWithRelationInput[]
    cursor?: DispatchWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DispatchScalarFieldEnum | DispatchScalarFieldEnum[]
  }

  /**
   * Vessel without action
   */
  export type VesselDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vessel
     */
    select?: VesselSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VesselInclude<ExtArgs> | null
  }


  /**
   * Model Order
   */

  export type AggregateOrder = {
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  export type OrderAvgAggregateOutputType = {
    creditDays: number | null
    rate: Decimal | null
    quantity: Decimal | null
    dispatchedOrder: Decimal | null
  }

  export type OrderSumAggregateOutputType = {
    creditDays: number | null
    rate: Decimal | null
    quantity: Decimal | null
    dispatchedOrder: Decimal | null
  }

  export type OrderMinAggregateOutputType = {
    id: string | null
    poNumber: string | null
    orderType: $Enums.OrderType | null
    customerId: string | null
    orderDate: Date | null
    area: string | null
    creditDays: number | null
    quality: string | null
    rate: Decimal | null
    quantity: Decimal | null
    orderById: string | null
    dispatchedOrder: Decimal | null
    orderStatus: $Enums.OrderStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderMaxAggregateOutputType = {
    id: string | null
    poNumber: string | null
    orderType: $Enums.OrderType | null
    customerId: string | null
    orderDate: Date | null
    area: string | null
    creditDays: number | null
    quality: string | null
    rate: Decimal | null
    quantity: Decimal | null
    orderById: string | null
    dispatchedOrder: Decimal | null
    orderStatus: $Enums.OrderStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderCountAggregateOutputType = {
    id: number
    poNumber: number
    orderType: number
    customerId: number
    orderDate: number
    area: number
    creditDays: number
    quality: number
    rate: number
    quantity: number
    orderById: number
    dispatchedOrder: number
    orderStatus: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrderAvgAggregateInputType = {
    creditDays?: true
    rate?: true
    quantity?: true
    dispatchedOrder?: true
  }

  export type OrderSumAggregateInputType = {
    creditDays?: true
    rate?: true
    quantity?: true
    dispatchedOrder?: true
  }

  export type OrderMinAggregateInputType = {
    id?: true
    poNumber?: true
    orderType?: true
    customerId?: true
    orderDate?: true
    area?: true
    creditDays?: true
    quality?: true
    rate?: true
    quantity?: true
    orderById?: true
    dispatchedOrder?: true
    orderStatus?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderMaxAggregateInputType = {
    id?: true
    poNumber?: true
    orderType?: true
    customerId?: true
    orderDate?: true
    area?: true
    creditDays?: true
    quality?: true
    rate?: true
    quantity?: true
    orderById?: true
    dispatchedOrder?: true
    orderStatus?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderCountAggregateInputType = {
    id?: true
    poNumber?: true
    orderType?: true
    customerId?: true
    orderDate?: true
    area?: true
    creditDays?: true
    quality?: true
    rate?: true
    quantity?: true
    orderById?: true
    dispatchedOrder?: true
    orderStatus?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Order to aggregate.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Orders
    **/
    _count?: true | OrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderMaxAggregateInputType
  }

  export type GetOrderAggregateType<T extends OrderAggregateArgs> = {
        [P in keyof T & keyof AggregateOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrder[P]>
      : GetScalarType<T[P], AggregateOrder[P]>
  }




  export type OrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithAggregationInput | OrderOrderByWithAggregationInput[]
    by: OrderScalarFieldEnum[] | OrderScalarFieldEnum
    having?: OrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderCountAggregateInputType | true
    _avg?: OrderAvgAggregateInputType
    _sum?: OrderSumAggregateInputType
    _min?: OrderMinAggregateInputType
    _max?: OrderMaxAggregateInputType
  }

  export type OrderGroupByOutputType = {
    id: string
    poNumber: string
    orderType: $Enums.OrderType
    customerId: string
    orderDate: Date | null
    area: string | null
    creditDays: number | null
    quality: string | null
    rate: Decimal | null
    quantity: Decimal | null
    orderById: string | null
    dispatchedOrder: Decimal
    orderStatus: $Enums.OrderStatus
    createdAt: Date
    updatedAt: Date
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  type GetOrderGroupByPayload<T extends OrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderGroupByOutputType[P]>
            : GetScalarType<T[P], OrderGroupByOutputType[P]>
        }
      >
    >


  export type OrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poNumber?: boolean
    orderType?: boolean
    customerId?: boolean
    orderDate?: boolean
    area?: boolean
    creditDays?: boolean
    quality?: boolean
    rate?: boolean
    quantity?: boolean
    orderById?: boolean
    dispatchedOrder?: boolean
    orderStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
    orderBy?: boolean | Order$orderByArgs<ExtArgs>
    dispatches?: boolean | Order$dispatchesArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poNumber?: boolean
    orderType?: boolean
    customerId?: boolean
    orderDate?: boolean
    area?: boolean
    creditDays?: boolean
    quality?: boolean
    rate?: boolean
    quantity?: boolean
    orderById?: boolean
    dispatchedOrder?: boolean
    orderStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
    orderBy?: boolean | Order$orderByArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectScalar = {
    id?: boolean
    poNumber?: boolean
    orderType?: boolean
    customerId?: boolean
    orderDate?: boolean
    area?: boolean
    creditDays?: boolean
    quality?: boolean
    rate?: boolean
    quantity?: boolean
    orderById?: boolean
    dispatchedOrder?: boolean
    orderStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
    orderBy?: boolean | Order$orderByArgs<ExtArgs>
    dispatches?: boolean | Order$dispatchesArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
    orderBy?: boolean | Order$orderByArgs<ExtArgs>
  }

  export type $OrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Order"
    objects: {
      customer: Prisma.$CustomerPayload<ExtArgs>
      orderBy: Prisma.$StaffPayload<ExtArgs> | null
      dispatches: Prisma.$DispatchPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      poNumber: string
      orderType: $Enums.OrderType
      customerId: string
      orderDate: Date | null
      area: string | null
      creditDays: number | null
      quality: string | null
      rate: Prisma.Decimal | null
      /**
       * Null for open orders until completeOpenOrder fills it in.
       */
      quantity: Prisma.Decimal | null
      orderById: string | null
      /**
       * Accumulated by dispatch transactions only — never write from forms.
       */
      dispatchedOrder: Prisma.Decimal
      orderStatus: $Enums.OrderStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["order"]>
    composites: {}
  }

  type OrderGetPayload<S extends boolean | null | undefined | OrderDefaultArgs> = $Result.GetResult<Prisma.$OrderPayload, S>

  type OrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OrderFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OrderCountAggregateInputType | true
    }

  export interface OrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Order'], meta: { name: 'Order' } }
    /**
     * Find zero or one Order that matches the filter.
     * @param {OrderFindUniqueArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderFindUniqueArgs>(args: SelectSubset<T, OrderFindUniqueArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Order that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OrderFindUniqueOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Order that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderFindFirstArgs>(args?: SelectSubset<T, OrderFindFirstArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Order that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Orders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Orders
     * const orders = await prisma.order.findMany()
     * 
     * // Get first 10 Orders
     * const orders = await prisma.order.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderWithIdOnly = await prisma.order.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderFindManyArgs>(args?: SelectSubset<T, OrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Order.
     * @param {OrderCreateArgs} args - Arguments to create a Order.
     * @example
     * // Create one Order
     * const Order = await prisma.order.create({
     *   data: {
     *     // ... data to create a Order
     *   }
     * })
     * 
     */
    create<T extends OrderCreateArgs>(args: SelectSubset<T, OrderCreateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Orders.
     * @param {OrderCreateManyArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderCreateManyArgs>(args?: SelectSubset<T, OrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Orders and returns the data saved in the database.
     * @param {OrderCreateManyAndReturnArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Order.
     * @param {OrderDeleteArgs} args - Arguments to delete one Order.
     * @example
     * // Delete one Order
     * const Order = await prisma.order.delete({
     *   where: {
     *     // ... filter to delete one Order
     *   }
     * })
     * 
     */
    delete<T extends OrderDeleteArgs>(args: SelectSubset<T, OrderDeleteArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Order.
     * @param {OrderUpdateArgs} args - Arguments to update one Order.
     * @example
     * // Update one Order
     * const order = await prisma.order.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderUpdateArgs>(args: SelectSubset<T, OrderUpdateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Orders.
     * @param {OrderDeleteManyArgs} args - Arguments to filter Orders to delete.
     * @example
     * // Delete a few Orders
     * const { count } = await prisma.order.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderDeleteManyArgs>(args?: SelectSubset<T, OrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderUpdateManyArgs>(args: SelectSubset<T, OrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Order.
     * @param {OrderUpsertArgs} args - Arguments to update or create a Order.
     * @example
     * // Update or create a Order
     * const order = await prisma.order.upsert({
     *   create: {
     *     // ... data to create a Order
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Order we want to update
     *   }
     * })
     */
    upsert<T extends OrderUpsertArgs>(args: SelectSubset<T, OrderUpsertArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderCountArgs} args - Arguments to filter Orders to count.
     * @example
     * // Count the number of Orders
     * const count = await prisma.order.count({
     *   where: {
     *     // ... the filter for the Orders we want to count
     *   }
     * })
    **/
    count<T extends OrderCountArgs>(
      args?: Subset<T, OrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrderAggregateArgs>(args: Subset<T, OrderAggregateArgs>): Prisma.PrismaPromise<GetOrderAggregateType<T>>

    /**
     * Group by Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderGroupByArgs['orderBy'] }
        : { orderBy?: OrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Order model
   */
  readonly fields: OrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Order.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    customer<T extends CustomerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustomerDefaultArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    orderBy<T extends Order$orderByArgs<ExtArgs> = {}>(args?: Subset<T, Order$orderByArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    dispatches<T extends Order$dispatchesArgs<ExtArgs> = {}>(args?: Subset<T, Order$dispatchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Order model
   */ 
  interface OrderFieldRefs {
    readonly id: FieldRef<"Order", 'String'>
    readonly poNumber: FieldRef<"Order", 'String'>
    readonly orderType: FieldRef<"Order", 'OrderType'>
    readonly customerId: FieldRef<"Order", 'String'>
    readonly orderDate: FieldRef<"Order", 'DateTime'>
    readonly area: FieldRef<"Order", 'String'>
    readonly creditDays: FieldRef<"Order", 'Int'>
    readonly quality: FieldRef<"Order", 'String'>
    readonly rate: FieldRef<"Order", 'Decimal'>
    readonly quantity: FieldRef<"Order", 'Decimal'>
    readonly orderById: FieldRef<"Order", 'String'>
    readonly dispatchedOrder: FieldRef<"Order", 'Decimal'>
    readonly orderStatus: FieldRef<"Order", 'OrderStatus'>
    readonly createdAt: FieldRef<"Order", 'DateTime'>
    readonly updatedAt: FieldRef<"Order", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Order findUnique
   */
  export type OrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findUniqueOrThrow
   */
  export type OrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findFirst
   */
  export type OrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findFirstOrThrow
   */
  export type OrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findMany
   */
  export type OrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Orders to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order create
   */
  export type OrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to create a Order.
     */
    data: XOR<OrderCreateInput, OrderUncheckedCreateInput>
  }

  /**
   * Order createMany
   */
  export type OrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Order createManyAndReturn
   */
  export type OrderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Order update
   */
  export type OrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to update a Order.
     */
    data: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
    /**
     * Choose, which Order to update.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order updateMany
   */
  export type OrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
  }

  /**
   * Order upsert
   */
  export type OrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The filter to search for the Order to update in case it exists.
     */
    where: OrderWhereUniqueInput
    /**
     * In case the Order found by the `where` argument doesn't exist, create a new Order with this data.
     */
    create: XOR<OrderCreateInput, OrderUncheckedCreateInput>
    /**
     * In case the Order was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
  }

  /**
   * Order delete
   */
  export type OrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter which Order to delete.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order deleteMany
   */
  export type OrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Orders to delete
     */
    where?: OrderWhereInput
  }

  /**
   * Order.orderBy
   */
  export type Order$orderByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    where?: StaffWhereInput
  }

  /**
   * Order.dispatches
   */
  export type Order$dispatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
    where?: DispatchWhereInput
    orderBy?: DispatchOrderByWithRelationInput | DispatchOrderByWithRelationInput[]
    cursor?: DispatchWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DispatchScalarFieldEnum | DispatchScalarFieldEnum[]
  }

  /**
   * Order without action
   */
  export type OrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
  }


  /**
   * Model PurchaseOrder
   */

  export type AggregatePurchaseOrder = {
    _count: PurchaseOrderCountAggregateOutputType | null
    _avg: PurchaseOrderAvgAggregateOutputType | null
    _sum: PurchaseOrderSumAggregateOutputType | null
    _min: PurchaseOrderMinAggregateOutputType | null
    _max: PurchaseOrderMaxAggregateOutputType | null
  }

  export type PurchaseOrderAvgAggregateOutputType = {
    rate: Decimal | null
    quantity: Decimal | null
    dispatchedOrder: Decimal | null
  }

  export type PurchaseOrderSumAggregateOutputType = {
    rate: Decimal | null
    quantity: Decimal | null
    dispatchedOrder: Decimal | null
  }

  export type PurchaseOrderMinAggregateOutputType = {
    id: string | null
    poNumber: string | null
    orderType: $Enums.OrderType | null
    importerId: string | null
    vesselId: string | null
    orderDate: Date | null
    quality: string | null
    rate: Decimal | null
    quantity: Decimal | null
    orderById: string | null
    dispatchedOrder: Decimal | null
    orderStatus: $Enums.OrderStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PurchaseOrderMaxAggregateOutputType = {
    id: string | null
    poNumber: string | null
    orderType: $Enums.OrderType | null
    importerId: string | null
    vesselId: string | null
    orderDate: Date | null
    quality: string | null
    rate: Decimal | null
    quantity: Decimal | null
    orderById: string | null
    dispatchedOrder: Decimal | null
    orderStatus: $Enums.OrderStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PurchaseOrderCountAggregateOutputType = {
    id: number
    poNumber: number
    orderType: number
    importerId: number
    vesselId: number
    orderDate: number
    quality: number
    rate: number
    quantity: number
    orderById: number
    dispatchedOrder: number
    orderStatus: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PurchaseOrderAvgAggregateInputType = {
    rate?: true
    quantity?: true
    dispatchedOrder?: true
  }

  export type PurchaseOrderSumAggregateInputType = {
    rate?: true
    quantity?: true
    dispatchedOrder?: true
  }

  export type PurchaseOrderMinAggregateInputType = {
    id?: true
    poNumber?: true
    orderType?: true
    importerId?: true
    vesselId?: true
    orderDate?: true
    quality?: true
    rate?: true
    quantity?: true
    orderById?: true
    dispatchedOrder?: true
    orderStatus?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PurchaseOrderMaxAggregateInputType = {
    id?: true
    poNumber?: true
    orderType?: true
    importerId?: true
    vesselId?: true
    orderDate?: true
    quality?: true
    rate?: true
    quantity?: true
    orderById?: true
    dispatchedOrder?: true
    orderStatus?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PurchaseOrderCountAggregateInputType = {
    id?: true
    poNumber?: true
    orderType?: true
    importerId?: true
    vesselId?: true
    orderDate?: true
    quality?: true
    rate?: true
    quantity?: true
    orderById?: true
    dispatchedOrder?: true
    orderStatus?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PurchaseOrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PurchaseOrder to aggregate.
     */
    where?: PurchaseOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PurchaseOrders to fetch.
     */
    orderBy?: PurchaseOrderOrderByWithRelationInput | PurchaseOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PurchaseOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PurchaseOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PurchaseOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PurchaseOrders
    **/
    _count?: true | PurchaseOrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PurchaseOrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PurchaseOrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PurchaseOrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PurchaseOrderMaxAggregateInputType
  }

  export type GetPurchaseOrderAggregateType<T extends PurchaseOrderAggregateArgs> = {
        [P in keyof T & keyof AggregatePurchaseOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePurchaseOrder[P]>
      : GetScalarType<T[P], AggregatePurchaseOrder[P]>
  }




  export type PurchaseOrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PurchaseOrderWhereInput
    orderBy?: PurchaseOrderOrderByWithAggregationInput | PurchaseOrderOrderByWithAggregationInput[]
    by: PurchaseOrderScalarFieldEnum[] | PurchaseOrderScalarFieldEnum
    having?: PurchaseOrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PurchaseOrderCountAggregateInputType | true
    _avg?: PurchaseOrderAvgAggregateInputType
    _sum?: PurchaseOrderSumAggregateInputType
    _min?: PurchaseOrderMinAggregateInputType
    _max?: PurchaseOrderMaxAggregateInputType
  }

  export type PurchaseOrderGroupByOutputType = {
    id: string
    poNumber: string
    orderType: $Enums.OrderType
    importerId: string
    vesselId: string
    orderDate: Date | null
    quality: string | null
    rate: Decimal | null
    quantity: Decimal | null
    orderById: string | null
    dispatchedOrder: Decimal
    orderStatus: $Enums.OrderStatus
    createdAt: Date
    updatedAt: Date
    _count: PurchaseOrderCountAggregateOutputType | null
    _avg: PurchaseOrderAvgAggregateOutputType | null
    _sum: PurchaseOrderSumAggregateOutputType | null
    _min: PurchaseOrderMinAggregateOutputType | null
    _max: PurchaseOrderMaxAggregateOutputType | null
  }

  type GetPurchaseOrderGroupByPayload<T extends PurchaseOrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PurchaseOrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PurchaseOrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PurchaseOrderGroupByOutputType[P]>
            : GetScalarType<T[P], PurchaseOrderGroupByOutputType[P]>
        }
      >
    >


  export type PurchaseOrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poNumber?: boolean
    orderType?: boolean
    importerId?: boolean
    vesselId?: boolean
    orderDate?: boolean
    quality?: boolean
    rate?: boolean
    quantity?: boolean
    orderById?: boolean
    dispatchedOrder?: boolean
    orderStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    importer?: boolean | CustomerDefaultArgs<ExtArgs>
    vessel?: boolean | VesselDefaultArgs<ExtArgs>
    orderBy?: boolean | PurchaseOrder$orderByArgs<ExtArgs>
    dispatches?: boolean | PurchaseOrder$dispatchesArgs<ExtArgs>
    _count?: boolean | PurchaseOrderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["purchaseOrder"]>

  export type PurchaseOrderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poNumber?: boolean
    orderType?: boolean
    importerId?: boolean
    vesselId?: boolean
    orderDate?: boolean
    quality?: boolean
    rate?: boolean
    quantity?: boolean
    orderById?: boolean
    dispatchedOrder?: boolean
    orderStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    importer?: boolean | CustomerDefaultArgs<ExtArgs>
    vessel?: boolean | VesselDefaultArgs<ExtArgs>
    orderBy?: boolean | PurchaseOrder$orderByArgs<ExtArgs>
  }, ExtArgs["result"]["purchaseOrder"]>

  export type PurchaseOrderSelectScalar = {
    id?: boolean
    poNumber?: boolean
    orderType?: boolean
    importerId?: boolean
    vesselId?: boolean
    orderDate?: boolean
    quality?: boolean
    rate?: boolean
    quantity?: boolean
    orderById?: boolean
    dispatchedOrder?: boolean
    orderStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PurchaseOrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    importer?: boolean | CustomerDefaultArgs<ExtArgs>
    vessel?: boolean | VesselDefaultArgs<ExtArgs>
    orderBy?: boolean | PurchaseOrder$orderByArgs<ExtArgs>
    dispatches?: boolean | PurchaseOrder$dispatchesArgs<ExtArgs>
    _count?: boolean | PurchaseOrderCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PurchaseOrderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    importer?: boolean | CustomerDefaultArgs<ExtArgs>
    vessel?: boolean | VesselDefaultArgs<ExtArgs>
    orderBy?: boolean | PurchaseOrder$orderByArgs<ExtArgs>
  }

  export type $PurchaseOrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PurchaseOrder"
    objects: {
      importer: Prisma.$CustomerPayload<ExtArgs>
      vessel: Prisma.$VesselPayload<ExtArgs>
      orderBy: Prisma.$StaffPayload<ExtArgs> | null
      dispatches: Prisma.$DispatchPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      poNumber: string
      orderType: $Enums.OrderType
      importerId: string
      vesselId: string
      orderDate: Date | null
      quality: string | null
      rate: Prisma.Decimal | null
      /**
       * Null for open purchase orders until completed.
       */
      quantity: Prisma.Decimal | null
      orderById: string | null
      /**
       * Accumulated by dispatch transactions only — never write from forms.
       */
      dispatchedOrder: Prisma.Decimal
      orderStatus: $Enums.OrderStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["purchaseOrder"]>
    composites: {}
  }

  type PurchaseOrderGetPayload<S extends boolean | null | undefined | PurchaseOrderDefaultArgs> = $Result.GetResult<Prisma.$PurchaseOrderPayload, S>

  type PurchaseOrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PurchaseOrderFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PurchaseOrderCountAggregateInputType | true
    }

  export interface PurchaseOrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PurchaseOrder'], meta: { name: 'PurchaseOrder' } }
    /**
     * Find zero or one PurchaseOrder that matches the filter.
     * @param {PurchaseOrderFindUniqueArgs} args - Arguments to find a PurchaseOrder
     * @example
     * // Get one PurchaseOrder
     * const purchaseOrder = await prisma.purchaseOrder.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PurchaseOrderFindUniqueArgs>(args: SelectSubset<T, PurchaseOrderFindUniqueArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PurchaseOrder that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PurchaseOrderFindUniqueOrThrowArgs} args - Arguments to find a PurchaseOrder
     * @example
     * // Get one PurchaseOrder
     * const purchaseOrder = await prisma.purchaseOrder.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PurchaseOrderFindUniqueOrThrowArgs>(args: SelectSubset<T, PurchaseOrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PurchaseOrder that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderFindFirstArgs} args - Arguments to find a PurchaseOrder
     * @example
     * // Get one PurchaseOrder
     * const purchaseOrder = await prisma.purchaseOrder.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PurchaseOrderFindFirstArgs>(args?: SelectSubset<T, PurchaseOrderFindFirstArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PurchaseOrder that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderFindFirstOrThrowArgs} args - Arguments to find a PurchaseOrder
     * @example
     * // Get one PurchaseOrder
     * const purchaseOrder = await prisma.purchaseOrder.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PurchaseOrderFindFirstOrThrowArgs>(args?: SelectSubset<T, PurchaseOrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PurchaseOrders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PurchaseOrders
     * const purchaseOrders = await prisma.purchaseOrder.findMany()
     * 
     * // Get first 10 PurchaseOrders
     * const purchaseOrders = await prisma.purchaseOrder.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const purchaseOrderWithIdOnly = await prisma.purchaseOrder.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PurchaseOrderFindManyArgs>(args?: SelectSubset<T, PurchaseOrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PurchaseOrder.
     * @param {PurchaseOrderCreateArgs} args - Arguments to create a PurchaseOrder.
     * @example
     * // Create one PurchaseOrder
     * const PurchaseOrder = await prisma.purchaseOrder.create({
     *   data: {
     *     // ... data to create a PurchaseOrder
     *   }
     * })
     * 
     */
    create<T extends PurchaseOrderCreateArgs>(args: SelectSubset<T, PurchaseOrderCreateArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PurchaseOrders.
     * @param {PurchaseOrderCreateManyArgs} args - Arguments to create many PurchaseOrders.
     * @example
     * // Create many PurchaseOrders
     * const purchaseOrder = await prisma.purchaseOrder.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PurchaseOrderCreateManyArgs>(args?: SelectSubset<T, PurchaseOrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PurchaseOrders and returns the data saved in the database.
     * @param {PurchaseOrderCreateManyAndReturnArgs} args - Arguments to create many PurchaseOrders.
     * @example
     * // Create many PurchaseOrders
     * const purchaseOrder = await prisma.purchaseOrder.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PurchaseOrders and only return the `id`
     * const purchaseOrderWithIdOnly = await prisma.purchaseOrder.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PurchaseOrderCreateManyAndReturnArgs>(args?: SelectSubset<T, PurchaseOrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PurchaseOrder.
     * @param {PurchaseOrderDeleteArgs} args - Arguments to delete one PurchaseOrder.
     * @example
     * // Delete one PurchaseOrder
     * const PurchaseOrder = await prisma.purchaseOrder.delete({
     *   where: {
     *     // ... filter to delete one PurchaseOrder
     *   }
     * })
     * 
     */
    delete<T extends PurchaseOrderDeleteArgs>(args: SelectSubset<T, PurchaseOrderDeleteArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PurchaseOrder.
     * @param {PurchaseOrderUpdateArgs} args - Arguments to update one PurchaseOrder.
     * @example
     * // Update one PurchaseOrder
     * const purchaseOrder = await prisma.purchaseOrder.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PurchaseOrderUpdateArgs>(args: SelectSubset<T, PurchaseOrderUpdateArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PurchaseOrders.
     * @param {PurchaseOrderDeleteManyArgs} args - Arguments to filter PurchaseOrders to delete.
     * @example
     * // Delete a few PurchaseOrders
     * const { count } = await prisma.purchaseOrder.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PurchaseOrderDeleteManyArgs>(args?: SelectSubset<T, PurchaseOrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PurchaseOrders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PurchaseOrders
     * const purchaseOrder = await prisma.purchaseOrder.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PurchaseOrderUpdateManyArgs>(args: SelectSubset<T, PurchaseOrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PurchaseOrder.
     * @param {PurchaseOrderUpsertArgs} args - Arguments to update or create a PurchaseOrder.
     * @example
     * // Update or create a PurchaseOrder
     * const purchaseOrder = await prisma.purchaseOrder.upsert({
     *   create: {
     *     // ... data to create a PurchaseOrder
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PurchaseOrder we want to update
     *   }
     * })
     */
    upsert<T extends PurchaseOrderUpsertArgs>(args: SelectSubset<T, PurchaseOrderUpsertArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PurchaseOrders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderCountArgs} args - Arguments to filter PurchaseOrders to count.
     * @example
     * // Count the number of PurchaseOrders
     * const count = await prisma.purchaseOrder.count({
     *   where: {
     *     // ... the filter for the PurchaseOrders we want to count
     *   }
     * })
    **/
    count<T extends PurchaseOrderCountArgs>(
      args?: Subset<T, PurchaseOrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PurchaseOrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PurchaseOrder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PurchaseOrderAggregateArgs>(args: Subset<T, PurchaseOrderAggregateArgs>): Prisma.PrismaPromise<GetPurchaseOrderAggregateType<T>>

    /**
     * Group by PurchaseOrder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PurchaseOrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PurchaseOrderGroupByArgs['orderBy'] }
        : { orderBy?: PurchaseOrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PurchaseOrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPurchaseOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PurchaseOrder model
   */
  readonly fields: PurchaseOrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PurchaseOrder.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PurchaseOrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    importer<T extends CustomerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustomerDefaultArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    vessel<T extends VesselDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VesselDefaultArgs<ExtArgs>>): Prisma__VesselClient<$Result.GetResult<Prisma.$VesselPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    orderBy<T extends PurchaseOrder$orderByArgs<ExtArgs> = {}>(args?: Subset<T, PurchaseOrder$orderByArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    dispatches<T extends PurchaseOrder$dispatchesArgs<ExtArgs> = {}>(args?: Subset<T, PurchaseOrder$dispatchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PurchaseOrder model
   */ 
  interface PurchaseOrderFieldRefs {
    readonly id: FieldRef<"PurchaseOrder", 'String'>
    readonly poNumber: FieldRef<"PurchaseOrder", 'String'>
    readonly orderType: FieldRef<"PurchaseOrder", 'OrderType'>
    readonly importerId: FieldRef<"PurchaseOrder", 'String'>
    readonly vesselId: FieldRef<"PurchaseOrder", 'String'>
    readonly orderDate: FieldRef<"PurchaseOrder", 'DateTime'>
    readonly quality: FieldRef<"PurchaseOrder", 'String'>
    readonly rate: FieldRef<"PurchaseOrder", 'Decimal'>
    readonly quantity: FieldRef<"PurchaseOrder", 'Decimal'>
    readonly orderById: FieldRef<"PurchaseOrder", 'String'>
    readonly dispatchedOrder: FieldRef<"PurchaseOrder", 'Decimal'>
    readonly orderStatus: FieldRef<"PurchaseOrder", 'OrderStatus'>
    readonly createdAt: FieldRef<"PurchaseOrder", 'DateTime'>
    readonly updatedAt: FieldRef<"PurchaseOrder", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PurchaseOrder findUnique
   */
  export type PurchaseOrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrder to fetch.
     */
    where: PurchaseOrderWhereUniqueInput
  }

  /**
   * PurchaseOrder findUniqueOrThrow
   */
  export type PurchaseOrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrder to fetch.
     */
    where: PurchaseOrderWhereUniqueInput
  }

  /**
   * PurchaseOrder findFirst
   */
  export type PurchaseOrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrder to fetch.
     */
    where?: PurchaseOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PurchaseOrders to fetch.
     */
    orderBy?: PurchaseOrderOrderByWithRelationInput | PurchaseOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PurchaseOrders.
     */
    cursor?: PurchaseOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PurchaseOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PurchaseOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PurchaseOrders.
     */
    distinct?: PurchaseOrderScalarFieldEnum | PurchaseOrderScalarFieldEnum[]
  }

  /**
   * PurchaseOrder findFirstOrThrow
   */
  export type PurchaseOrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrder to fetch.
     */
    where?: PurchaseOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PurchaseOrders to fetch.
     */
    orderBy?: PurchaseOrderOrderByWithRelationInput | PurchaseOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PurchaseOrders.
     */
    cursor?: PurchaseOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PurchaseOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PurchaseOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PurchaseOrders.
     */
    distinct?: PurchaseOrderScalarFieldEnum | PurchaseOrderScalarFieldEnum[]
  }

  /**
   * PurchaseOrder findMany
   */
  export type PurchaseOrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrders to fetch.
     */
    where?: PurchaseOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PurchaseOrders to fetch.
     */
    orderBy?: PurchaseOrderOrderByWithRelationInput | PurchaseOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PurchaseOrders.
     */
    cursor?: PurchaseOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PurchaseOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PurchaseOrders.
     */
    skip?: number
    distinct?: PurchaseOrderScalarFieldEnum | PurchaseOrderScalarFieldEnum[]
  }

  /**
   * PurchaseOrder create
   */
  export type PurchaseOrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * The data needed to create a PurchaseOrder.
     */
    data: XOR<PurchaseOrderCreateInput, PurchaseOrderUncheckedCreateInput>
  }

  /**
   * PurchaseOrder createMany
   */
  export type PurchaseOrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PurchaseOrders.
     */
    data: PurchaseOrderCreateManyInput | PurchaseOrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PurchaseOrder createManyAndReturn
   */
  export type PurchaseOrderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PurchaseOrders.
     */
    data: PurchaseOrderCreateManyInput | PurchaseOrderCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PurchaseOrder update
   */
  export type PurchaseOrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * The data needed to update a PurchaseOrder.
     */
    data: XOR<PurchaseOrderUpdateInput, PurchaseOrderUncheckedUpdateInput>
    /**
     * Choose, which PurchaseOrder to update.
     */
    where: PurchaseOrderWhereUniqueInput
  }

  /**
   * PurchaseOrder updateMany
   */
  export type PurchaseOrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PurchaseOrders.
     */
    data: XOR<PurchaseOrderUpdateManyMutationInput, PurchaseOrderUncheckedUpdateManyInput>
    /**
     * Filter which PurchaseOrders to update
     */
    where?: PurchaseOrderWhereInput
  }

  /**
   * PurchaseOrder upsert
   */
  export type PurchaseOrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * The filter to search for the PurchaseOrder to update in case it exists.
     */
    where: PurchaseOrderWhereUniqueInput
    /**
     * In case the PurchaseOrder found by the `where` argument doesn't exist, create a new PurchaseOrder with this data.
     */
    create: XOR<PurchaseOrderCreateInput, PurchaseOrderUncheckedCreateInput>
    /**
     * In case the PurchaseOrder was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PurchaseOrderUpdateInput, PurchaseOrderUncheckedUpdateInput>
  }

  /**
   * PurchaseOrder delete
   */
  export type PurchaseOrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * Filter which PurchaseOrder to delete.
     */
    where: PurchaseOrderWhereUniqueInput
  }

  /**
   * PurchaseOrder deleteMany
   */
  export type PurchaseOrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PurchaseOrders to delete
     */
    where?: PurchaseOrderWhereInput
  }

  /**
   * PurchaseOrder.orderBy
   */
  export type PurchaseOrder$orderByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    where?: StaffWhereInput
  }

  /**
   * PurchaseOrder.dispatches
   */
  export type PurchaseOrder$dispatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
    where?: DispatchWhereInput
    orderBy?: DispatchOrderByWithRelationInput | DispatchOrderByWithRelationInput[]
    cursor?: DispatchWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DispatchScalarFieldEnum | DispatchScalarFieldEnum[]
  }

  /**
   * PurchaseOrder without action
   */
  export type PurchaseOrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
  }


  /**
   * Model Dispatch
   */

  export type AggregateDispatch = {
    _count: DispatchCountAggregateOutputType | null
    _avg: DispatchAvgAggregateOutputType | null
    _sum: DispatchSumAggregateOutputType | null
    _min: DispatchMinAggregateOutputType | null
    _max: DispatchMaxAggregateOutputType | null
  }

  export type DispatchAvgAggregateOutputType = {
    dispatchedQuantity: Decimal | null
    freight: Decimal | null
    receivingQuantity: Decimal | null
  }

  export type DispatchSumAggregateOutputType = {
    dispatchedQuantity: Decimal | null
    freight: Decimal | null
    receivingQuantity: Decimal | null
  }

  export type DispatchMinAggregateOutputType = {
    id: string | null
    poNumber: string | null
    purchasePoNumber: string | null
    vesselId: string | null
    dispatchDate: Date | null
    dispatchedQuantity: Decimal | null
    lorryNumber: string | null
    dispatchTerms: $Enums.DispatchTerms | null
    freight: Decimal | null
    transporterId: string | null
    importerId: string | null
    receivingQuantity: Decimal | null
    receiptDate: Date | null
    receiptStatus: $Enums.ReceiptStatus | null
    softCopyStatus: boolean | null
    entryInTally: boolean | null
    saleInvoiceNumber: string | null
    purchaseInvoiceNumber: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DispatchMaxAggregateOutputType = {
    id: string | null
    poNumber: string | null
    purchasePoNumber: string | null
    vesselId: string | null
    dispatchDate: Date | null
    dispatchedQuantity: Decimal | null
    lorryNumber: string | null
    dispatchTerms: $Enums.DispatchTerms | null
    freight: Decimal | null
    transporterId: string | null
    importerId: string | null
    receivingQuantity: Decimal | null
    receiptDate: Date | null
    receiptStatus: $Enums.ReceiptStatus | null
    softCopyStatus: boolean | null
    entryInTally: boolean | null
    saleInvoiceNumber: string | null
    purchaseInvoiceNumber: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DispatchCountAggregateOutputType = {
    id: number
    poNumber: number
    purchasePoNumber: number
    vesselId: number
    dispatchDate: number
    dispatchedQuantity: number
    lorryNumber: number
    dispatchTerms: number
    freight: number
    transporterId: number
    importerId: number
    receivingQuantity: number
    receiptDate: number
    receiptStatus: number
    softCopyStatus: number
    entryInTally: number
    saleInvoiceNumber: number
    purchaseInvoiceNumber: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DispatchAvgAggregateInputType = {
    dispatchedQuantity?: true
    freight?: true
    receivingQuantity?: true
  }

  export type DispatchSumAggregateInputType = {
    dispatchedQuantity?: true
    freight?: true
    receivingQuantity?: true
  }

  export type DispatchMinAggregateInputType = {
    id?: true
    poNumber?: true
    purchasePoNumber?: true
    vesselId?: true
    dispatchDate?: true
    dispatchedQuantity?: true
    lorryNumber?: true
    dispatchTerms?: true
    freight?: true
    transporterId?: true
    importerId?: true
    receivingQuantity?: true
    receiptDate?: true
    receiptStatus?: true
    softCopyStatus?: true
    entryInTally?: true
    saleInvoiceNumber?: true
    purchaseInvoiceNumber?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DispatchMaxAggregateInputType = {
    id?: true
    poNumber?: true
    purchasePoNumber?: true
    vesselId?: true
    dispatchDate?: true
    dispatchedQuantity?: true
    lorryNumber?: true
    dispatchTerms?: true
    freight?: true
    transporterId?: true
    importerId?: true
    receivingQuantity?: true
    receiptDate?: true
    receiptStatus?: true
    softCopyStatus?: true
    entryInTally?: true
    saleInvoiceNumber?: true
    purchaseInvoiceNumber?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DispatchCountAggregateInputType = {
    id?: true
    poNumber?: true
    purchasePoNumber?: true
    vesselId?: true
    dispatchDate?: true
    dispatchedQuantity?: true
    lorryNumber?: true
    dispatchTerms?: true
    freight?: true
    transporterId?: true
    importerId?: true
    receivingQuantity?: true
    receiptDate?: true
    receiptStatus?: true
    softCopyStatus?: true
    entryInTally?: true
    saleInvoiceNumber?: true
    purchaseInvoiceNumber?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DispatchAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Dispatch to aggregate.
     */
    where?: DispatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dispatches to fetch.
     */
    orderBy?: DispatchOrderByWithRelationInput | DispatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DispatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dispatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dispatches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Dispatches
    **/
    _count?: true | DispatchCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DispatchAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DispatchSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DispatchMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DispatchMaxAggregateInputType
  }

  export type GetDispatchAggregateType<T extends DispatchAggregateArgs> = {
        [P in keyof T & keyof AggregateDispatch]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDispatch[P]>
      : GetScalarType<T[P], AggregateDispatch[P]>
  }




  export type DispatchGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispatchWhereInput
    orderBy?: DispatchOrderByWithAggregationInput | DispatchOrderByWithAggregationInput[]
    by: DispatchScalarFieldEnum[] | DispatchScalarFieldEnum
    having?: DispatchScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DispatchCountAggregateInputType | true
    _avg?: DispatchAvgAggregateInputType
    _sum?: DispatchSumAggregateInputType
    _min?: DispatchMinAggregateInputType
    _max?: DispatchMaxAggregateInputType
  }

  export type DispatchGroupByOutputType = {
    id: string
    poNumber: string
    purchasePoNumber: string
    vesselId: string
    dispatchDate: Date
    dispatchedQuantity: Decimal
    lorryNumber: string | null
    dispatchTerms: $Enums.DispatchTerms
    freight: Decimal | null
    transporterId: string | null
    importerId: string | null
    receivingQuantity: Decimal | null
    receiptDate: Date | null
    receiptStatus: $Enums.ReceiptStatus
    softCopyStatus: boolean
    entryInTally: boolean
    saleInvoiceNumber: string | null
    purchaseInvoiceNumber: string | null
    createdAt: Date
    updatedAt: Date
    _count: DispatchCountAggregateOutputType | null
    _avg: DispatchAvgAggregateOutputType | null
    _sum: DispatchSumAggregateOutputType | null
    _min: DispatchMinAggregateOutputType | null
    _max: DispatchMaxAggregateOutputType | null
  }

  type GetDispatchGroupByPayload<T extends DispatchGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DispatchGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DispatchGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DispatchGroupByOutputType[P]>
            : GetScalarType<T[P], DispatchGroupByOutputType[P]>
        }
      >
    >


  export type DispatchSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poNumber?: boolean
    purchasePoNumber?: boolean
    vesselId?: boolean
    dispatchDate?: boolean
    dispatchedQuantity?: boolean
    lorryNumber?: boolean
    dispatchTerms?: boolean
    freight?: boolean
    transporterId?: boolean
    importerId?: boolean
    receivingQuantity?: boolean
    receiptDate?: boolean
    receiptStatus?: boolean
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: boolean
    purchaseInvoiceNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
    purchaseOrder?: boolean | PurchaseOrderDefaultArgs<ExtArgs>
    vessel?: boolean | VesselDefaultArgs<ExtArgs>
    transporter?: boolean | Dispatch$transporterArgs<ExtArgs>
    importer?: boolean | Dispatch$importerArgs<ExtArgs>
  }, ExtArgs["result"]["dispatch"]>

  export type DispatchSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poNumber?: boolean
    purchasePoNumber?: boolean
    vesselId?: boolean
    dispatchDate?: boolean
    dispatchedQuantity?: boolean
    lorryNumber?: boolean
    dispatchTerms?: boolean
    freight?: boolean
    transporterId?: boolean
    importerId?: boolean
    receivingQuantity?: boolean
    receiptDate?: boolean
    receiptStatus?: boolean
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: boolean
    purchaseInvoiceNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
    purchaseOrder?: boolean | PurchaseOrderDefaultArgs<ExtArgs>
    vessel?: boolean | VesselDefaultArgs<ExtArgs>
    transporter?: boolean | Dispatch$transporterArgs<ExtArgs>
    importer?: boolean | Dispatch$importerArgs<ExtArgs>
  }, ExtArgs["result"]["dispatch"]>

  export type DispatchSelectScalar = {
    id?: boolean
    poNumber?: boolean
    purchasePoNumber?: boolean
    vesselId?: boolean
    dispatchDate?: boolean
    dispatchedQuantity?: boolean
    lorryNumber?: boolean
    dispatchTerms?: boolean
    freight?: boolean
    transporterId?: boolean
    importerId?: boolean
    receivingQuantity?: boolean
    receiptDate?: boolean
    receiptStatus?: boolean
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: boolean
    purchaseInvoiceNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DispatchInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
    purchaseOrder?: boolean | PurchaseOrderDefaultArgs<ExtArgs>
    vessel?: boolean | VesselDefaultArgs<ExtArgs>
    transporter?: boolean | Dispatch$transporterArgs<ExtArgs>
    importer?: boolean | Dispatch$importerArgs<ExtArgs>
  }
  export type DispatchIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
    purchaseOrder?: boolean | PurchaseOrderDefaultArgs<ExtArgs>
    vessel?: boolean | VesselDefaultArgs<ExtArgs>
    transporter?: boolean | Dispatch$transporterArgs<ExtArgs>
    importer?: boolean | Dispatch$importerArgs<ExtArgs>
  }

  export type $DispatchPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Dispatch"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>
      purchaseOrder: Prisma.$PurchaseOrderPayload<ExtArgs>
      vessel: Prisma.$VesselPayload<ExtArgs>
      transporter: Prisma.$TransporterPayload<ExtArgs> | null
      importer: Prisma.$CustomerPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      poNumber: string
      purchasePoNumber: string
      vesselId: string
      dispatchDate: Date
      dispatchedQuantity: Prisma.Decimal
      lorryNumber: string | null
      dispatchTerms: $Enums.DispatchTerms
      /**
       * Freight per MT (Rs/MT) — required for FOR; stripped from sale rate for profit.
       */
      freight: Prisma.Decimal | null
      transporterId: string | null
      importerId: string | null
      receivingQuantity: Prisma.Decimal | null
      receiptDate: Date | null
      receiptStatus: $Enums.ReceiptStatus
      softCopyStatus: boolean
      entryInTally: boolean
      /**
       * Sale (customer) invoice number — often filled after dispatch.
       */
      saleInvoiceNumber: string | null
      /**
       * Purchase (supplier) invoice number — often filled after dispatch.
       */
      purchaseInvoiceNumber: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["dispatch"]>
    composites: {}
  }

  type DispatchGetPayload<S extends boolean | null | undefined | DispatchDefaultArgs> = $Result.GetResult<Prisma.$DispatchPayload, S>

  type DispatchCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DispatchFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DispatchCountAggregateInputType | true
    }

  export interface DispatchDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Dispatch'], meta: { name: 'Dispatch' } }
    /**
     * Find zero or one Dispatch that matches the filter.
     * @param {DispatchFindUniqueArgs} args - Arguments to find a Dispatch
     * @example
     * // Get one Dispatch
     * const dispatch = await prisma.dispatch.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DispatchFindUniqueArgs>(args: SelectSubset<T, DispatchFindUniqueArgs<ExtArgs>>): Prisma__DispatchClient<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Dispatch that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DispatchFindUniqueOrThrowArgs} args - Arguments to find a Dispatch
     * @example
     * // Get one Dispatch
     * const dispatch = await prisma.dispatch.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DispatchFindUniqueOrThrowArgs>(args: SelectSubset<T, DispatchFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DispatchClient<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Dispatch that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispatchFindFirstArgs} args - Arguments to find a Dispatch
     * @example
     * // Get one Dispatch
     * const dispatch = await prisma.dispatch.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DispatchFindFirstArgs>(args?: SelectSubset<T, DispatchFindFirstArgs<ExtArgs>>): Prisma__DispatchClient<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Dispatch that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispatchFindFirstOrThrowArgs} args - Arguments to find a Dispatch
     * @example
     * // Get one Dispatch
     * const dispatch = await prisma.dispatch.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DispatchFindFirstOrThrowArgs>(args?: SelectSubset<T, DispatchFindFirstOrThrowArgs<ExtArgs>>): Prisma__DispatchClient<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Dispatches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispatchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Dispatches
     * const dispatches = await prisma.dispatch.findMany()
     * 
     * // Get first 10 Dispatches
     * const dispatches = await prisma.dispatch.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dispatchWithIdOnly = await prisma.dispatch.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DispatchFindManyArgs>(args?: SelectSubset<T, DispatchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Dispatch.
     * @param {DispatchCreateArgs} args - Arguments to create a Dispatch.
     * @example
     * // Create one Dispatch
     * const Dispatch = await prisma.dispatch.create({
     *   data: {
     *     // ... data to create a Dispatch
     *   }
     * })
     * 
     */
    create<T extends DispatchCreateArgs>(args: SelectSubset<T, DispatchCreateArgs<ExtArgs>>): Prisma__DispatchClient<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Dispatches.
     * @param {DispatchCreateManyArgs} args - Arguments to create many Dispatches.
     * @example
     * // Create many Dispatches
     * const dispatch = await prisma.dispatch.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DispatchCreateManyArgs>(args?: SelectSubset<T, DispatchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Dispatches and returns the data saved in the database.
     * @param {DispatchCreateManyAndReturnArgs} args - Arguments to create many Dispatches.
     * @example
     * // Create many Dispatches
     * const dispatch = await prisma.dispatch.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Dispatches and only return the `id`
     * const dispatchWithIdOnly = await prisma.dispatch.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DispatchCreateManyAndReturnArgs>(args?: SelectSubset<T, DispatchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Dispatch.
     * @param {DispatchDeleteArgs} args - Arguments to delete one Dispatch.
     * @example
     * // Delete one Dispatch
     * const Dispatch = await prisma.dispatch.delete({
     *   where: {
     *     // ... filter to delete one Dispatch
     *   }
     * })
     * 
     */
    delete<T extends DispatchDeleteArgs>(args: SelectSubset<T, DispatchDeleteArgs<ExtArgs>>): Prisma__DispatchClient<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Dispatch.
     * @param {DispatchUpdateArgs} args - Arguments to update one Dispatch.
     * @example
     * // Update one Dispatch
     * const dispatch = await prisma.dispatch.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DispatchUpdateArgs>(args: SelectSubset<T, DispatchUpdateArgs<ExtArgs>>): Prisma__DispatchClient<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Dispatches.
     * @param {DispatchDeleteManyArgs} args - Arguments to filter Dispatches to delete.
     * @example
     * // Delete a few Dispatches
     * const { count } = await prisma.dispatch.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DispatchDeleteManyArgs>(args?: SelectSubset<T, DispatchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Dispatches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispatchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Dispatches
     * const dispatch = await prisma.dispatch.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DispatchUpdateManyArgs>(args: SelectSubset<T, DispatchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Dispatch.
     * @param {DispatchUpsertArgs} args - Arguments to update or create a Dispatch.
     * @example
     * // Update or create a Dispatch
     * const dispatch = await prisma.dispatch.upsert({
     *   create: {
     *     // ... data to create a Dispatch
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Dispatch we want to update
     *   }
     * })
     */
    upsert<T extends DispatchUpsertArgs>(args: SelectSubset<T, DispatchUpsertArgs<ExtArgs>>): Prisma__DispatchClient<$Result.GetResult<Prisma.$DispatchPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Dispatches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispatchCountArgs} args - Arguments to filter Dispatches to count.
     * @example
     * // Count the number of Dispatches
     * const count = await prisma.dispatch.count({
     *   where: {
     *     // ... the filter for the Dispatches we want to count
     *   }
     * })
    **/
    count<T extends DispatchCountArgs>(
      args?: Subset<T, DispatchCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DispatchCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Dispatch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispatchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DispatchAggregateArgs>(args: Subset<T, DispatchAggregateArgs>): Prisma.PrismaPromise<GetDispatchAggregateType<T>>

    /**
     * Group by Dispatch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispatchGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DispatchGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DispatchGroupByArgs['orderBy'] }
        : { orderBy?: DispatchGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DispatchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDispatchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Dispatch model
   */
  readonly fields: DispatchFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Dispatch.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DispatchClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    purchaseOrder<T extends PurchaseOrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PurchaseOrderDefaultArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    vessel<T extends VesselDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VesselDefaultArgs<ExtArgs>>): Prisma__VesselClient<$Result.GetResult<Prisma.$VesselPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    transporter<T extends Dispatch$transporterArgs<ExtArgs> = {}>(args?: Subset<T, Dispatch$transporterArgs<ExtArgs>>): Prisma__TransporterClient<$Result.GetResult<Prisma.$TransporterPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    importer<T extends Dispatch$importerArgs<ExtArgs> = {}>(args?: Subset<T, Dispatch$importerArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Dispatch model
   */ 
  interface DispatchFieldRefs {
    readonly id: FieldRef<"Dispatch", 'String'>
    readonly poNumber: FieldRef<"Dispatch", 'String'>
    readonly purchasePoNumber: FieldRef<"Dispatch", 'String'>
    readonly vesselId: FieldRef<"Dispatch", 'String'>
    readonly dispatchDate: FieldRef<"Dispatch", 'DateTime'>
    readonly dispatchedQuantity: FieldRef<"Dispatch", 'Decimal'>
    readonly lorryNumber: FieldRef<"Dispatch", 'String'>
    readonly dispatchTerms: FieldRef<"Dispatch", 'DispatchTerms'>
    readonly freight: FieldRef<"Dispatch", 'Decimal'>
    readonly transporterId: FieldRef<"Dispatch", 'String'>
    readonly importerId: FieldRef<"Dispatch", 'String'>
    readonly receivingQuantity: FieldRef<"Dispatch", 'Decimal'>
    readonly receiptDate: FieldRef<"Dispatch", 'DateTime'>
    readonly receiptStatus: FieldRef<"Dispatch", 'ReceiptStatus'>
    readonly softCopyStatus: FieldRef<"Dispatch", 'Boolean'>
    readonly entryInTally: FieldRef<"Dispatch", 'Boolean'>
    readonly saleInvoiceNumber: FieldRef<"Dispatch", 'String'>
    readonly purchaseInvoiceNumber: FieldRef<"Dispatch", 'String'>
    readonly createdAt: FieldRef<"Dispatch", 'DateTime'>
    readonly updatedAt: FieldRef<"Dispatch", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Dispatch findUnique
   */
  export type DispatchFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
    /**
     * Filter, which Dispatch to fetch.
     */
    where: DispatchWhereUniqueInput
  }

  /**
   * Dispatch findUniqueOrThrow
   */
  export type DispatchFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
    /**
     * Filter, which Dispatch to fetch.
     */
    where: DispatchWhereUniqueInput
  }

  /**
   * Dispatch findFirst
   */
  export type DispatchFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
    /**
     * Filter, which Dispatch to fetch.
     */
    where?: DispatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dispatches to fetch.
     */
    orderBy?: DispatchOrderByWithRelationInput | DispatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Dispatches.
     */
    cursor?: DispatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dispatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dispatches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Dispatches.
     */
    distinct?: DispatchScalarFieldEnum | DispatchScalarFieldEnum[]
  }

  /**
   * Dispatch findFirstOrThrow
   */
  export type DispatchFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
    /**
     * Filter, which Dispatch to fetch.
     */
    where?: DispatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dispatches to fetch.
     */
    orderBy?: DispatchOrderByWithRelationInput | DispatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Dispatches.
     */
    cursor?: DispatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dispatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dispatches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Dispatches.
     */
    distinct?: DispatchScalarFieldEnum | DispatchScalarFieldEnum[]
  }

  /**
   * Dispatch findMany
   */
  export type DispatchFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
    /**
     * Filter, which Dispatches to fetch.
     */
    where?: DispatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dispatches to fetch.
     */
    orderBy?: DispatchOrderByWithRelationInput | DispatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Dispatches.
     */
    cursor?: DispatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dispatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dispatches.
     */
    skip?: number
    distinct?: DispatchScalarFieldEnum | DispatchScalarFieldEnum[]
  }

  /**
   * Dispatch create
   */
  export type DispatchCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
    /**
     * The data needed to create a Dispatch.
     */
    data: XOR<DispatchCreateInput, DispatchUncheckedCreateInput>
  }

  /**
   * Dispatch createMany
   */
  export type DispatchCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Dispatches.
     */
    data: DispatchCreateManyInput | DispatchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Dispatch createManyAndReturn
   */
  export type DispatchCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Dispatches.
     */
    data: DispatchCreateManyInput | DispatchCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Dispatch update
   */
  export type DispatchUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
    /**
     * The data needed to update a Dispatch.
     */
    data: XOR<DispatchUpdateInput, DispatchUncheckedUpdateInput>
    /**
     * Choose, which Dispatch to update.
     */
    where: DispatchWhereUniqueInput
  }

  /**
   * Dispatch updateMany
   */
  export type DispatchUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Dispatches.
     */
    data: XOR<DispatchUpdateManyMutationInput, DispatchUncheckedUpdateManyInput>
    /**
     * Filter which Dispatches to update
     */
    where?: DispatchWhereInput
  }

  /**
   * Dispatch upsert
   */
  export type DispatchUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
    /**
     * The filter to search for the Dispatch to update in case it exists.
     */
    where: DispatchWhereUniqueInput
    /**
     * In case the Dispatch found by the `where` argument doesn't exist, create a new Dispatch with this data.
     */
    create: XOR<DispatchCreateInput, DispatchUncheckedCreateInput>
    /**
     * In case the Dispatch was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DispatchUpdateInput, DispatchUncheckedUpdateInput>
  }

  /**
   * Dispatch delete
   */
  export type DispatchDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
    /**
     * Filter which Dispatch to delete.
     */
    where: DispatchWhereUniqueInput
  }

  /**
   * Dispatch deleteMany
   */
  export type DispatchDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Dispatches to delete
     */
    where?: DispatchWhereInput
  }

  /**
   * Dispatch.transporter
   */
  export type Dispatch$transporterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transporter
     */
    select?: TransporterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransporterInclude<ExtArgs> | null
    where?: TransporterWhereInput
  }

  /**
   * Dispatch.importer
   */
  export type Dispatch$importerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    where?: CustomerWhereInput
  }

  /**
   * Dispatch without action
   */
  export type DispatchDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispatch
     */
    select?: DispatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispatchInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const StaffScalarFieldEnum: {
    id: 'id',
    name: 'name',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type StaffScalarFieldEnum = (typeof StaffScalarFieldEnum)[keyof typeof StaffScalarFieldEnum]


  export const TransporterScalarFieldEnum: {
    id: 'id',
    name: 'name',
    area: 'area',
    contactPersonName: 'contactPersonName',
    contactNumber: 'contactNumber',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TransporterScalarFieldEnum = (typeof TransporterScalarFieldEnum)[keyof typeof TransporterScalarFieldEnum]


  export const CustomerScalarFieldEnum: {
    id: 'id',
    name: 'name',
    category: 'category',
    contactNumber: 'contactNumber',
    pocName: 'pocName',
    area: 'area',
    industrySector: 'industrySector',
    dealById: 'dealById',
    approachForFundsId: 'approachForFundsId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CustomerScalarFieldEnum = (typeof CustomerScalarFieldEnum)[keyof typeof CustomerScalarFieldEnum]


  export const VesselScalarFieldEnum: {
    id: 'id',
    vesselName: 'vesselName',
    importerId: 'importerId',
    quality: 'quality',
    quantity: 'quantity',
    dispatchedQuantity: 'dispatchedQuantity',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type VesselScalarFieldEnum = (typeof VesselScalarFieldEnum)[keyof typeof VesselScalarFieldEnum]


  export const OrderScalarFieldEnum: {
    id: 'id',
    poNumber: 'poNumber',
    orderType: 'orderType',
    customerId: 'customerId',
    orderDate: 'orderDate',
    area: 'area',
    creditDays: 'creditDays',
    quality: 'quality',
    rate: 'rate',
    quantity: 'quantity',
    orderById: 'orderById',
    dispatchedOrder: 'dispatchedOrder',
    orderStatus: 'orderStatus',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrderScalarFieldEnum = (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum]


  export const PurchaseOrderScalarFieldEnum: {
    id: 'id',
    poNumber: 'poNumber',
    orderType: 'orderType',
    importerId: 'importerId',
    vesselId: 'vesselId',
    orderDate: 'orderDate',
    quality: 'quality',
    rate: 'rate',
    quantity: 'quantity',
    orderById: 'orderById',
    dispatchedOrder: 'dispatchedOrder',
    orderStatus: 'orderStatus',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PurchaseOrderScalarFieldEnum = (typeof PurchaseOrderScalarFieldEnum)[keyof typeof PurchaseOrderScalarFieldEnum]


  export const DispatchScalarFieldEnum: {
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

  export type DispatchScalarFieldEnum = (typeof DispatchScalarFieldEnum)[keyof typeof DispatchScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'CustomerCategory'
   */
  export type EnumCustomerCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CustomerCategory'>
    


  /**
   * Reference to a field of type 'CustomerCategory[]'
   */
  export type ListEnumCustomerCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CustomerCategory[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'OrderType'
   */
  export type EnumOrderTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderType'>
    


  /**
   * Reference to a field of type 'OrderType[]'
   */
  export type ListEnumOrderTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'OrderStatus'
   */
  export type EnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus'>
    


  /**
   * Reference to a field of type 'OrderStatus[]'
   */
  export type ListEnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus[]'>
    


  /**
   * Reference to a field of type 'DispatchTerms'
   */
  export type EnumDispatchTermsFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DispatchTerms'>
    


  /**
   * Reference to a field of type 'DispatchTerms[]'
   */
  export type ListEnumDispatchTermsFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DispatchTerms[]'>
    


  /**
   * Reference to a field of type 'ReceiptStatus'
   */
  export type EnumReceiptStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ReceiptStatus'>
    


  /**
   * Reference to a field of type 'ReceiptStatus[]'
   */
  export type ListEnumReceiptStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ReceiptStatus[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type StaffWhereInput = {
    AND?: StaffWhereInput | StaffWhereInput[]
    OR?: StaffWhereInput[]
    NOT?: StaffWhereInput | StaffWhereInput[]
    id?: StringFilter<"Staff"> | string
    name?: StringFilter<"Staff"> | string
    role?: StringNullableFilter<"Staff"> | string | null
    createdAt?: DateTimeFilter<"Staff"> | Date | string
    updatedAt?: DateTimeFilter<"Staff"> | Date | string
    dealByCustomers?: CustomerListRelationFilter
    approachForFundsCustomers?: CustomerListRelationFilter
    orders?: OrderListRelationFilter
    purchaseOrders?: PurchaseOrderListRelationFilter
  }

  export type StaffOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dealByCustomers?: CustomerOrderByRelationAggregateInput
    approachForFundsCustomers?: CustomerOrderByRelationAggregateInput
    orders?: OrderOrderByRelationAggregateInput
    purchaseOrders?: PurchaseOrderOrderByRelationAggregateInput
  }

  export type StaffWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: StaffWhereInput | StaffWhereInput[]
    OR?: StaffWhereInput[]
    NOT?: StaffWhereInput | StaffWhereInput[]
    name?: StringFilter<"Staff"> | string
    role?: StringNullableFilter<"Staff"> | string | null
    createdAt?: DateTimeFilter<"Staff"> | Date | string
    updatedAt?: DateTimeFilter<"Staff"> | Date | string
    dealByCustomers?: CustomerListRelationFilter
    approachForFundsCustomers?: CustomerListRelationFilter
    orders?: OrderListRelationFilter
    purchaseOrders?: PurchaseOrderListRelationFilter
  }, "id">

  export type StaffOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: StaffCountOrderByAggregateInput
    _max?: StaffMaxOrderByAggregateInput
    _min?: StaffMinOrderByAggregateInput
  }

  export type StaffScalarWhereWithAggregatesInput = {
    AND?: StaffScalarWhereWithAggregatesInput | StaffScalarWhereWithAggregatesInput[]
    OR?: StaffScalarWhereWithAggregatesInput[]
    NOT?: StaffScalarWhereWithAggregatesInput | StaffScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Staff"> | string
    name?: StringWithAggregatesFilter<"Staff"> | string
    role?: StringNullableWithAggregatesFilter<"Staff"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Staff"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Staff"> | Date | string
  }

  export type TransporterWhereInput = {
    AND?: TransporterWhereInput | TransporterWhereInput[]
    OR?: TransporterWhereInput[]
    NOT?: TransporterWhereInput | TransporterWhereInput[]
    id?: StringFilter<"Transporter"> | string
    name?: StringFilter<"Transporter"> | string
    area?: StringNullableFilter<"Transporter"> | string | null
    contactPersonName?: StringNullableFilter<"Transporter"> | string | null
    contactNumber?: StringNullableFilter<"Transporter"> | string | null
    createdAt?: DateTimeFilter<"Transporter"> | Date | string
    updatedAt?: DateTimeFilter<"Transporter"> | Date | string
    dispatches?: DispatchListRelationFilter
  }

  export type TransporterOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    area?: SortOrderInput | SortOrder
    contactPersonName?: SortOrderInput | SortOrder
    contactNumber?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dispatches?: DispatchOrderByRelationAggregateInput
  }

  export type TransporterWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TransporterWhereInput | TransporterWhereInput[]
    OR?: TransporterWhereInput[]
    NOT?: TransporterWhereInput | TransporterWhereInput[]
    name?: StringFilter<"Transporter"> | string
    area?: StringNullableFilter<"Transporter"> | string | null
    contactPersonName?: StringNullableFilter<"Transporter"> | string | null
    contactNumber?: StringNullableFilter<"Transporter"> | string | null
    createdAt?: DateTimeFilter<"Transporter"> | Date | string
    updatedAt?: DateTimeFilter<"Transporter"> | Date | string
    dispatches?: DispatchListRelationFilter
  }, "id">

  export type TransporterOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    area?: SortOrderInput | SortOrder
    contactPersonName?: SortOrderInput | SortOrder
    contactNumber?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TransporterCountOrderByAggregateInput
    _max?: TransporterMaxOrderByAggregateInput
    _min?: TransporterMinOrderByAggregateInput
  }

  export type TransporterScalarWhereWithAggregatesInput = {
    AND?: TransporterScalarWhereWithAggregatesInput | TransporterScalarWhereWithAggregatesInput[]
    OR?: TransporterScalarWhereWithAggregatesInput[]
    NOT?: TransporterScalarWhereWithAggregatesInput | TransporterScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Transporter"> | string
    name?: StringWithAggregatesFilter<"Transporter"> | string
    area?: StringNullableWithAggregatesFilter<"Transporter"> | string | null
    contactPersonName?: StringNullableWithAggregatesFilter<"Transporter"> | string | null
    contactNumber?: StringNullableWithAggregatesFilter<"Transporter"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Transporter"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Transporter"> | Date | string
  }

  export type CustomerWhereInput = {
    AND?: CustomerWhereInput | CustomerWhereInput[]
    OR?: CustomerWhereInput[]
    NOT?: CustomerWhereInput | CustomerWhereInput[]
    id?: StringFilter<"Customer"> | string
    name?: StringFilter<"Customer"> | string
    category?: EnumCustomerCategoryFilter<"Customer"> | $Enums.CustomerCategory
    contactNumber?: StringNullableFilter<"Customer"> | string | null
    pocName?: StringNullableFilter<"Customer"> | string | null
    area?: StringNullableFilter<"Customer"> | string | null
    industrySector?: StringNullableFilter<"Customer"> | string | null
    dealById?: StringNullableFilter<"Customer"> | string | null
    approachForFundsId?: StringNullableFilter<"Customer"> | string | null
    createdAt?: DateTimeFilter<"Customer"> | Date | string
    updatedAt?: DateTimeFilter<"Customer"> | Date | string
    dealBy?: XOR<StaffNullableRelationFilter, StaffWhereInput> | null
    approachForFunds?: XOR<StaffNullableRelationFilter, StaffWhereInput> | null
    vessels?: VesselListRelationFilter
    orders?: OrderListRelationFilter
    purchaseOrders?: PurchaseOrderListRelationFilter
    dispatches?: DispatchListRelationFilter
  }

  export type CustomerOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    contactNumber?: SortOrderInput | SortOrder
    pocName?: SortOrderInput | SortOrder
    area?: SortOrderInput | SortOrder
    industrySector?: SortOrderInput | SortOrder
    dealById?: SortOrderInput | SortOrder
    approachForFundsId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dealBy?: StaffOrderByWithRelationInput
    approachForFunds?: StaffOrderByWithRelationInput
    vessels?: VesselOrderByRelationAggregateInput
    orders?: OrderOrderByRelationAggregateInput
    purchaseOrders?: PurchaseOrderOrderByRelationAggregateInput
    dispatches?: DispatchOrderByRelationAggregateInput
  }

  export type CustomerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CustomerWhereInput | CustomerWhereInput[]
    OR?: CustomerWhereInput[]
    NOT?: CustomerWhereInput | CustomerWhereInput[]
    name?: StringFilter<"Customer"> | string
    category?: EnumCustomerCategoryFilter<"Customer"> | $Enums.CustomerCategory
    contactNumber?: StringNullableFilter<"Customer"> | string | null
    pocName?: StringNullableFilter<"Customer"> | string | null
    area?: StringNullableFilter<"Customer"> | string | null
    industrySector?: StringNullableFilter<"Customer"> | string | null
    dealById?: StringNullableFilter<"Customer"> | string | null
    approachForFundsId?: StringNullableFilter<"Customer"> | string | null
    createdAt?: DateTimeFilter<"Customer"> | Date | string
    updatedAt?: DateTimeFilter<"Customer"> | Date | string
    dealBy?: XOR<StaffNullableRelationFilter, StaffWhereInput> | null
    approachForFunds?: XOR<StaffNullableRelationFilter, StaffWhereInput> | null
    vessels?: VesselListRelationFilter
    orders?: OrderListRelationFilter
    purchaseOrders?: PurchaseOrderListRelationFilter
    dispatches?: DispatchListRelationFilter
  }, "id">

  export type CustomerOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    contactNumber?: SortOrderInput | SortOrder
    pocName?: SortOrderInput | SortOrder
    area?: SortOrderInput | SortOrder
    industrySector?: SortOrderInput | SortOrder
    dealById?: SortOrderInput | SortOrder
    approachForFundsId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CustomerCountOrderByAggregateInput
    _max?: CustomerMaxOrderByAggregateInput
    _min?: CustomerMinOrderByAggregateInput
  }

  export type CustomerScalarWhereWithAggregatesInput = {
    AND?: CustomerScalarWhereWithAggregatesInput | CustomerScalarWhereWithAggregatesInput[]
    OR?: CustomerScalarWhereWithAggregatesInput[]
    NOT?: CustomerScalarWhereWithAggregatesInput | CustomerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Customer"> | string
    name?: StringWithAggregatesFilter<"Customer"> | string
    category?: EnumCustomerCategoryWithAggregatesFilter<"Customer"> | $Enums.CustomerCategory
    contactNumber?: StringNullableWithAggregatesFilter<"Customer"> | string | null
    pocName?: StringNullableWithAggregatesFilter<"Customer"> | string | null
    area?: StringNullableWithAggregatesFilter<"Customer"> | string | null
    industrySector?: StringNullableWithAggregatesFilter<"Customer"> | string | null
    dealById?: StringNullableWithAggregatesFilter<"Customer"> | string | null
    approachForFundsId?: StringNullableWithAggregatesFilter<"Customer"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Customer"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Customer"> | Date | string
  }

  export type VesselWhereInput = {
    AND?: VesselWhereInput | VesselWhereInput[]
    OR?: VesselWhereInput[]
    NOT?: VesselWhereInput | VesselWhereInput[]
    id?: StringFilter<"Vessel"> | string
    vesselName?: StringFilter<"Vessel"> | string
    importerId?: StringFilter<"Vessel"> | string
    quality?: StringNullableFilter<"Vessel"> | string | null
    quantity?: DecimalFilter<"Vessel"> | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalFilter<"Vessel"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"Vessel"> | Date | string
    updatedAt?: DateTimeFilter<"Vessel"> | Date | string
    importer?: XOR<CustomerRelationFilter, CustomerWhereInput>
    purchaseOrders?: PurchaseOrderListRelationFilter
    dispatches?: DispatchListRelationFilter
  }

  export type VesselOrderByWithRelationInput = {
    id?: SortOrder
    vesselName?: SortOrder
    importerId?: SortOrder
    quality?: SortOrderInput | SortOrder
    quantity?: SortOrder
    dispatchedQuantity?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    importer?: CustomerOrderByWithRelationInput
    purchaseOrders?: PurchaseOrderOrderByRelationAggregateInput
    dispatches?: DispatchOrderByRelationAggregateInput
  }

  export type VesselWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    vesselName?: string
    AND?: VesselWhereInput | VesselWhereInput[]
    OR?: VesselWhereInput[]
    NOT?: VesselWhereInput | VesselWhereInput[]
    importerId?: StringFilter<"Vessel"> | string
    quality?: StringNullableFilter<"Vessel"> | string | null
    quantity?: DecimalFilter<"Vessel"> | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalFilter<"Vessel"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"Vessel"> | Date | string
    updatedAt?: DateTimeFilter<"Vessel"> | Date | string
    importer?: XOR<CustomerRelationFilter, CustomerWhereInput>
    purchaseOrders?: PurchaseOrderListRelationFilter
    dispatches?: DispatchListRelationFilter
  }, "id" | "vesselName">

  export type VesselOrderByWithAggregationInput = {
    id?: SortOrder
    vesselName?: SortOrder
    importerId?: SortOrder
    quality?: SortOrderInput | SortOrder
    quantity?: SortOrder
    dispatchedQuantity?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: VesselCountOrderByAggregateInput
    _avg?: VesselAvgOrderByAggregateInput
    _max?: VesselMaxOrderByAggregateInput
    _min?: VesselMinOrderByAggregateInput
    _sum?: VesselSumOrderByAggregateInput
  }

  export type VesselScalarWhereWithAggregatesInput = {
    AND?: VesselScalarWhereWithAggregatesInput | VesselScalarWhereWithAggregatesInput[]
    OR?: VesselScalarWhereWithAggregatesInput[]
    NOT?: VesselScalarWhereWithAggregatesInput | VesselScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Vessel"> | string
    vesselName?: StringWithAggregatesFilter<"Vessel"> | string
    importerId?: StringWithAggregatesFilter<"Vessel"> | string
    quality?: StringNullableWithAggregatesFilter<"Vessel"> | string | null
    quantity?: DecimalWithAggregatesFilter<"Vessel"> | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalWithAggregatesFilter<"Vessel"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeWithAggregatesFilter<"Vessel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Vessel"> | Date | string
  }

  export type OrderWhereInput = {
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    id?: StringFilter<"Order"> | string
    poNumber?: StringFilter<"Order"> | string
    orderType?: EnumOrderTypeFilter<"Order"> | $Enums.OrderType
    customerId?: StringFilter<"Order"> | string
    orderDate?: DateTimeNullableFilter<"Order"> | Date | string | null
    area?: StringNullableFilter<"Order"> | string | null
    creditDays?: IntNullableFilter<"Order"> | number | null
    quality?: StringNullableFilter<"Order"> | string | null
    rate?: DecimalNullableFilter<"Order"> | Decimal | DecimalJsLike | number | string | null
    quantity?: DecimalNullableFilter<"Order"> | Decimal | DecimalJsLike | number | string | null
    orderById?: StringNullableFilter<"Order"> | string | null
    dispatchedOrder?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    customer?: XOR<CustomerRelationFilter, CustomerWhereInput>
    orderBy?: XOR<StaffNullableRelationFilter, StaffWhereInput> | null
    dispatches?: DispatchListRelationFilter
  }

  export type OrderOrderByWithRelationInput = {
    id?: SortOrder
    poNumber?: SortOrder
    orderType?: SortOrder
    customerId?: SortOrder
    orderDate?: SortOrderInput | SortOrder
    area?: SortOrderInput | SortOrder
    creditDays?: SortOrderInput | SortOrder
    quality?: SortOrderInput | SortOrder
    rate?: SortOrderInput | SortOrder
    quantity?: SortOrderInput | SortOrder
    orderById?: SortOrderInput | SortOrder
    dispatchedOrder?: SortOrder
    orderStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    customer?: CustomerOrderByWithRelationInput
    orderBy?: StaffOrderByWithRelationInput
    dispatches?: DispatchOrderByRelationAggregateInput
  }

  export type OrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    poNumber?: string
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    orderType?: EnumOrderTypeFilter<"Order"> | $Enums.OrderType
    customerId?: StringFilter<"Order"> | string
    orderDate?: DateTimeNullableFilter<"Order"> | Date | string | null
    area?: StringNullableFilter<"Order"> | string | null
    creditDays?: IntNullableFilter<"Order"> | number | null
    quality?: StringNullableFilter<"Order"> | string | null
    rate?: DecimalNullableFilter<"Order"> | Decimal | DecimalJsLike | number | string | null
    quantity?: DecimalNullableFilter<"Order"> | Decimal | DecimalJsLike | number | string | null
    orderById?: StringNullableFilter<"Order"> | string | null
    dispatchedOrder?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    customer?: XOR<CustomerRelationFilter, CustomerWhereInput>
    orderBy?: XOR<StaffNullableRelationFilter, StaffWhereInput> | null
    dispatches?: DispatchListRelationFilter
  }, "id" | "poNumber">

  export type OrderOrderByWithAggregationInput = {
    id?: SortOrder
    poNumber?: SortOrder
    orderType?: SortOrder
    customerId?: SortOrder
    orderDate?: SortOrderInput | SortOrder
    area?: SortOrderInput | SortOrder
    creditDays?: SortOrderInput | SortOrder
    quality?: SortOrderInput | SortOrder
    rate?: SortOrderInput | SortOrder
    quantity?: SortOrderInput | SortOrder
    orderById?: SortOrderInput | SortOrder
    dispatchedOrder?: SortOrder
    orderStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrderCountOrderByAggregateInput
    _avg?: OrderAvgOrderByAggregateInput
    _max?: OrderMaxOrderByAggregateInput
    _min?: OrderMinOrderByAggregateInput
    _sum?: OrderSumOrderByAggregateInput
  }

  export type OrderScalarWhereWithAggregatesInput = {
    AND?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    OR?: OrderScalarWhereWithAggregatesInput[]
    NOT?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Order"> | string
    poNumber?: StringWithAggregatesFilter<"Order"> | string
    orderType?: EnumOrderTypeWithAggregatesFilter<"Order"> | $Enums.OrderType
    customerId?: StringWithAggregatesFilter<"Order"> | string
    orderDate?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    area?: StringNullableWithAggregatesFilter<"Order"> | string | null
    creditDays?: IntNullableWithAggregatesFilter<"Order"> | number | null
    quality?: StringNullableWithAggregatesFilter<"Order"> | string | null
    rate?: DecimalNullableWithAggregatesFilter<"Order"> | Decimal | DecimalJsLike | number | string | null
    quantity?: DecimalNullableWithAggregatesFilter<"Order"> | Decimal | DecimalJsLike | number | string | null
    orderById?: StringNullableWithAggregatesFilter<"Order"> | string | null
    dispatchedOrder?: DecimalWithAggregatesFilter<"Order"> | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusWithAggregatesFilter<"Order"> | $Enums.OrderStatus
    createdAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
  }

  export type PurchaseOrderWhereInput = {
    AND?: PurchaseOrderWhereInput | PurchaseOrderWhereInput[]
    OR?: PurchaseOrderWhereInput[]
    NOT?: PurchaseOrderWhereInput | PurchaseOrderWhereInput[]
    id?: StringFilter<"PurchaseOrder"> | string
    poNumber?: StringFilter<"PurchaseOrder"> | string
    orderType?: EnumOrderTypeFilter<"PurchaseOrder"> | $Enums.OrderType
    importerId?: StringFilter<"PurchaseOrder"> | string
    vesselId?: StringFilter<"PurchaseOrder"> | string
    orderDate?: DateTimeNullableFilter<"PurchaseOrder"> | Date | string | null
    quality?: StringNullableFilter<"PurchaseOrder"> | string | null
    rate?: DecimalNullableFilter<"PurchaseOrder"> | Decimal | DecimalJsLike | number | string | null
    quantity?: DecimalNullableFilter<"PurchaseOrder"> | Decimal | DecimalJsLike | number | string | null
    orderById?: StringNullableFilter<"PurchaseOrder"> | string | null
    dispatchedOrder?: DecimalFilter<"PurchaseOrder"> | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFilter<"PurchaseOrder"> | $Enums.OrderStatus
    createdAt?: DateTimeFilter<"PurchaseOrder"> | Date | string
    updatedAt?: DateTimeFilter<"PurchaseOrder"> | Date | string
    importer?: XOR<CustomerRelationFilter, CustomerWhereInput>
    vessel?: XOR<VesselRelationFilter, VesselWhereInput>
    orderBy?: XOR<StaffNullableRelationFilter, StaffWhereInput> | null
    dispatches?: DispatchListRelationFilter
  }

  export type PurchaseOrderOrderByWithRelationInput = {
    id?: SortOrder
    poNumber?: SortOrder
    orderType?: SortOrder
    importerId?: SortOrder
    vesselId?: SortOrder
    orderDate?: SortOrderInput | SortOrder
    quality?: SortOrderInput | SortOrder
    rate?: SortOrderInput | SortOrder
    quantity?: SortOrderInput | SortOrder
    orderById?: SortOrderInput | SortOrder
    dispatchedOrder?: SortOrder
    orderStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    importer?: CustomerOrderByWithRelationInput
    vessel?: VesselOrderByWithRelationInput
    orderBy?: StaffOrderByWithRelationInput
    dispatches?: DispatchOrderByRelationAggregateInput
  }

  export type PurchaseOrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    poNumber?: string
    AND?: PurchaseOrderWhereInput | PurchaseOrderWhereInput[]
    OR?: PurchaseOrderWhereInput[]
    NOT?: PurchaseOrderWhereInput | PurchaseOrderWhereInput[]
    orderType?: EnumOrderTypeFilter<"PurchaseOrder"> | $Enums.OrderType
    importerId?: StringFilter<"PurchaseOrder"> | string
    vesselId?: StringFilter<"PurchaseOrder"> | string
    orderDate?: DateTimeNullableFilter<"PurchaseOrder"> | Date | string | null
    quality?: StringNullableFilter<"PurchaseOrder"> | string | null
    rate?: DecimalNullableFilter<"PurchaseOrder"> | Decimal | DecimalJsLike | number | string | null
    quantity?: DecimalNullableFilter<"PurchaseOrder"> | Decimal | DecimalJsLike | number | string | null
    orderById?: StringNullableFilter<"PurchaseOrder"> | string | null
    dispatchedOrder?: DecimalFilter<"PurchaseOrder"> | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFilter<"PurchaseOrder"> | $Enums.OrderStatus
    createdAt?: DateTimeFilter<"PurchaseOrder"> | Date | string
    updatedAt?: DateTimeFilter<"PurchaseOrder"> | Date | string
    importer?: XOR<CustomerRelationFilter, CustomerWhereInput>
    vessel?: XOR<VesselRelationFilter, VesselWhereInput>
    orderBy?: XOR<StaffNullableRelationFilter, StaffWhereInput> | null
    dispatches?: DispatchListRelationFilter
  }, "id" | "poNumber">

  export type PurchaseOrderOrderByWithAggregationInput = {
    id?: SortOrder
    poNumber?: SortOrder
    orderType?: SortOrder
    importerId?: SortOrder
    vesselId?: SortOrder
    orderDate?: SortOrderInput | SortOrder
    quality?: SortOrderInput | SortOrder
    rate?: SortOrderInput | SortOrder
    quantity?: SortOrderInput | SortOrder
    orderById?: SortOrderInput | SortOrder
    dispatchedOrder?: SortOrder
    orderStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PurchaseOrderCountOrderByAggregateInput
    _avg?: PurchaseOrderAvgOrderByAggregateInput
    _max?: PurchaseOrderMaxOrderByAggregateInput
    _min?: PurchaseOrderMinOrderByAggregateInput
    _sum?: PurchaseOrderSumOrderByAggregateInput
  }

  export type PurchaseOrderScalarWhereWithAggregatesInput = {
    AND?: PurchaseOrderScalarWhereWithAggregatesInput | PurchaseOrderScalarWhereWithAggregatesInput[]
    OR?: PurchaseOrderScalarWhereWithAggregatesInput[]
    NOT?: PurchaseOrderScalarWhereWithAggregatesInput | PurchaseOrderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PurchaseOrder"> | string
    poNumber?: StringWithAggregatesFilter<"PurchaseOrder"> | string
    orderType?: EnumOrderTypeWithAggregatesFilter<"PurchaseOrder"> | $Enums.OrderType
    importerId?: StringWithAggregatesFilter<"PurchaseOrder"> | string
    vesselId?: StringWithAggregatesFilter<"PurchaseOrder"> | string
    orderDate?: DateTimeNullableWithAggregatesFilter<"PurchaseOrder"> | Date | string | null
    quality?: StringNullableWithAggregatesFilter<"PurchaseOrder"> | string | null
    rate?: DecimalNullableWithAggregatesFilter<"PurchaseOrder"> | Decimal | DecimalJsLike | number | string | null
    quantity?: DecimalNullableWithAggregatesFilter<"PurchaseOrder"> | Decimal | DecimalJsLike | number | string | null
    orderById?: StringNullableWithAggregatesFilter<"PurchaseOrder"> | string | null
    dispatchedOrder?: DecimalWithAggregatesFilter<"PurchaseOrder"> | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusWithAggregatesFilter<"PurchaseOrder"> | $Enums.OrderStatus
    createdAt?: DateTimeWithAggregatesFilter<"PurchaseOrder"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PurchaseOrder"> | Date | string
  }

  export type DispatchWhereInput = {
    AND?: DispatchWhereInput | DispatchWhereInput[]
    OR?: DispatchWhereInput[]
    NOT?: DispatchWhereInput | DispatchWhereInput[]
    id?: StringFilter<"Dispatch"> | string
    poNumber?: StringFilter<"Dispatch"> | string
    purchasePoNumber?: StringFilter<"Dispatch"> | string
    vesselId?: StringFilter<"Dispatch"> | string
    dispatchDate?: DateTimeFilter<"Dispatch"> | Date | string
    dispatchedQuantity?: DecimalFilter<"Dispatch"> | Decimal | DecimalJsLike | number | string
    lorryNumber?: StringNullableFilter<"Dispatch"> | string | null
    dispatchTerms?: EnumDispatchTermsFilter<"Dispatch"> | $Enums.DispatchTerms
    freight?: DecimalNullableFilter<"Dispatch"> | Decimal | DecimalJsLike | number | string | null
    transporterId?: StringNullableFilter<"Dispatch"> | string | null
    importerId?: StringNullableFilter<"Dispatch"> | string | null
    receivingQuantity?: DecimalNullableFilter<"Dispatch"> | Decimal | DecimalJsLike | number | string | null
    receiptDate?: DateTimeNullableFilter<"Dispatch"> | Date | string | null
    receiptStatus?: EnumReceiptStatusFilter<"Dispatch"> | $Enums.ReceiptStatus
    softCopyStatus?: BoolFilter<"Dispatch"> | boolean
    entryInTally?: BoolFilter<"Dispatch"> | boolean
    saleInvoiceNumber?: StringNullableFilter<"Dispatch"> | string | null
    purchaseInvoiceNumber?: StringNullableFilter<"Dispatch"> | string | null
    createdAt?: DateTimeFilter<"Dispatch"> | Date | string
    updatedAt?: DateTimeFilter<"Dispatch"> | Date | string
    order?: XOR<OrderRelationFilter, OrderWhereInput>
    purchaseOrder?: XOR<PurchaseOrderRelationFilter, PurchaseOrderWhereInput>
    vessel?: XOR<VesselRelationFilter, VesselWhereInput>
    transporter?: XOR<TransporterNullableRelationFilter, TransporterWhereInput> | null
    importer?: XOR<CustomerNullableRelationFilter, CustomerWhereInput> | null
  }

  export type DispatchOrderByWithRelationInput = {
    id?: SortOrder
    poNumber?: SortOrder
    purchasePoNumber?: SortOrder
    vesselId?: SortOrder
    dispatchDate?: SortOrder
    dispatchedQuantity?: SortOrder
    lorryNumber?: SortOrderInput | SortOrder
    dispatchTerms?: SortOrder
    freight?: SortOrderInput | SortOrder
    transporterId?: SortOrderInput | SortOrder
    importerId?: SortOrderInput | SortOrder
    receivingQuantity?: SortOrderInput | SortOrder
    receiptDate?: SortOrderInput | SortOrder
    receiptStatus?: SortOrder
    softCopyStatus?: SortOrder
    entryInTally?: SortOrder
    saleInvoiceNumber?: SortOrderInput | SortOrder
    purchaseInvoiceNumber?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    order?: OrderOrderByWithRelationInput
    purchaseOrder?: PurchaseOrderOrderByWithRelationInput
    vessel?: VesselOrderByWithRelationInput
    transporter?: TransporterOrderByWithRelationInput
    importer?: CustomerOrderByWithRelationInput
  }

  export type DispatchWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DispatchWhereInput | DispatchWhereInput[]
    OR?: DispatchWhereInput[]
    NOT?: DispatchWhereInput | DispatchWhereInput[]
    poNumber?: StringFilter<"Dispatch"> | string
    purchasePoNumber?: StringFilter<"Dispatch"> | string
    vesselId?: StringFilter<"Dispatch"> | string
    dispatchDate?: DateTimeFilter<"Dispatch"> | Date | string
    dispatchedQuantity?: DecimalFilter<"Dispatch"> | Decimal | DecimalJsLike | number | string
    lorryNumber?: StringNullableFilter<"Dispatch"> | string | null
    dispatchTerms?: EnumDispatchTermsFilter<"Dispatch"> | $Enums.DispatchTerms
    freight?: DecimalNullableFilter<"Dispatch"> | Decimal | DecimalJsLike | number | string | null
    transporterId?: StringNullableFilter<"Dispatch"> | string | null
    importerId?: StringNullableFilter<"Dispatch"> | string | null
    receivingQuantity?: DecimalNullableFilter<"Dispatch"> | Decimal | DecimalJsLike | number | string | null
    receiptDate?: DateTimeNullableFilter<"Dispatch"> | Date | string | null
    receiptStatus?: EnumReceiptStatusFilter<"Dispatch"> | $Enums.ReceiptStatus
    softCopyStatus?: BoolFilter<"Dispatch"> | boolean
    entryInTally?: BoolFilter<"Dispatch"> | boolean
    saleInvoiceNumber?: StringNullableFilter<"Dispatch"> | string | null
    purchaseInvoiceNumber?: StringNullableFilter<"Dispatch"> | string | null
    createdAt?: DateTimeFilter<"Dispatch"> | Date | string
    updatedAt?: DateTimeFilter<"Dispatch"> | Date | string
    order?: XOR<OrderRelationFilter, OrderWhereInput>
    purchaseOrder?: XOR<PurchaseOrderRelationFilter, PurchaseOrderWhereInput>
    vessel?: XOR<VesselRelationFilter, VesselWhereInput>
    transporter?: XOR<TransporterNullableRelationFilter, TransporterWhereInput> | null
    importer?: XOR<CustomerNullableRelationFilter, CustomerWhereInput> | null
  }, "id">

  export type DispatchOrderByWithAggregationInput = {
    id?: SortOrder
    poNumber?: SortOrder
    purchasePoNumber?: SortOrder
    vesselId?: SortOrder
    dispatchDate?: SortOrder
    dispatchedQuantity?: SortOrder
    lorryNumber?: SortOrderInput | SortOrder
    dispatchTerms?: SortOrder
    freight?: SortOrderInput | SortOrder
    transporterId?: SortOrderInput | SortOrder
    importerId?: SortOrderInput | SortOrder
    receivingQuantity?: SortOrderInput | SortOrder
    receiptDate?: SortOrderInput | SortOrder
    receiptStatus?: SortOrder
    softCopyStatus?: SortOrder
    entryInTally?: SortOrder
    saleInvoiceNumber?: SortOrderInput | SortOrder
    purchaseInvoiceNumber?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DispatchCountOrderByAggregateInput
    _avg?: DispatchAvgOrderByAggregateInput
    _max?: DispatchMaxOrderByAggregateInput
    _min?: DispatchMinOrderByAggregateInput
    _sum?: DispatchSumOrderByAggregateInput
  }

  export type DispatchScalarWhereWithAggregatesInput = {
    AND?: DispatchScalarWhereWithAggregatesInput | DispatchScalarWhereWithAggregatesInput[]
    OR?: DispatchScalarWhereWithAggregatesInput[]
    NOT?: DispatchScalarWhereWithAggregatesInput | DispatchScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Dispatch"> | string
    poNumber?: StringWithAggregatesFilter<"Dispatch"> | string
    purchasePoNumber?: StringWithAggregatesFilter<"Dispatch"> | string
    vesselId?: StringWithAggregatesFilter<"Dispatch"> | string
    dispatchDate?: DateTimeWithAggregatesFilter<"Dispatch"> | Date | string
    dispatchedQuantity?: DecimalWithAggregatesFilter<"Dispatch"> | Decimal | DecimalJsLike | number | string
    lorryNumber?: StringNullableWithAggregatesFilter<"Dispatch"> | string | null
    dispatchTerms?: EnumDispatchTermsWithAggregatesFilter<"Dispatch"> | $Enums.DispatchTerms
    freight?: DecimalNullableWithAggregatesFilter<"Dispatch"> | Decimal | DecimalJsLike | number | string | null
    transporterId?: StringNullableWithAggregatesFilter<"Dispatch"> | string | null
    importerId?: StringNullableWithAggregatesFilter<"Dispatch"> | string | null
    receivingQuantity?: DecimalNullableWithAggregatesFilter<"Dispatch"> | Decimal | DecimalJsLike | number | string | null
    receiptDate?: DateTimeNullableWithAggregatesFilter<"Dispatch"> | Date | string | null
    receiptStatus?: EnumReceiptStatusWithAggregatesFilter<"Dispatch"> | $Enums.ReceiptStatus
    softCopyStatus?: BoolWithAggregatesFilter<"Dispatch"> | boolean
    entryInTally?: BoolWithAggregatesFilter<"Dispatch"> | boolean
    saleInvoiceNumber?: StringNullableWithAggregatesFilter<"Dispatch"> | string | null
    purchaseInvoiceNumber?: StringNullableWithAggregatesFilter<"Dispatch"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Dispatch"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Dispatch"> | Date | string
  }

  export type StaffCreateInput = {
    id?: string
    name: string
    role?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dealByCustomers?: CustomerCreateNestedManyWithoutDealByInput
    approachForFundsCustomers?: CustomerCreateNestedManyWithoutApproachForFundsInput
    orders?: OrderCreateNestedManyWithoutOrderByInput
    purchaseOrders?: PurchaseOrderCreateNestedManyWithoutOrderByInput
  }

  export type StaffUncheckedCreateInput = {
    id?: string
    name: string
    role?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dealByCustomers?: CustomerUncheckedCreateNestedManyWithoutDealByInput
    approachForFundsCustomers?: CustomerUncheckedCreateNestedManyWithoutApproachForFundsInput
    orders?: OrderUncheckedCreateNestedManyWithoutOrderByInput
    purchaseOrders?: PurchaseOrderUncheckedCreateNestedManyWithoutOrderByInput
  }

  export type StaffUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dealByCustomers?: CustomerUpdateManyWithoutDealByNestedInput
    approachForFundsCustomers?: CustomerUpdateManyWithoutApproachForFundsNestedInput
    orders?: OrderUpdateManyWithoutOrderByNestedInput
    purchaseOrders?: PurchaseOrderUpdateManyWithoutOrderByNestedInput
  }

  export type StaffUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dealByCustomers?: CustomerUncheckedUpdateManyWithoutDealByNestedInput
    approachForFundsCustomers?: CustomerUncheckedUpdateManyWithoutApproachForFundsNestedInput
    orders?: OrderUncheckedUpdateManyWithoutOrderByNestedInput
    purchaseOrders?: PurchaseOrderUncheckedUpdateManyWithoutOrderByNestedInput
  }

  export type StaffCreateManyInput = {
    id?: string
    name: string
    role?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StaffUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StaffUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransporterCreateInput = {
    id?: string
    name: string
    area?: string | null
    contactPersonName?: string | null
    contactNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dispatches?: DispatchCreateNestedManyWithoutTransporterInput
  }

  export type TransporterUncheckedCreateInput = {
    id?: string
    name: string
    area?: string | null
    contactPersonName?: string | null
    contactNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dispatches?: DispatchUncheckedCreateNestedManyWithoutTransporterInput
  }

  export type TransporterUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    area?: NullableStringFieldUpdateOperationsInput | string | null
    contactPersonName?: NullableStringFieldUpdateOperationsInput | string | null
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatches?: DispatchUpdateManyWithoutTransporterNestedInput
  }

  export type TransporterUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    area?: NullableStringFieldUpdateOperationsInput | string | null
    contactPersonName?: NullableStringFieldUpdateOperationsInput | string | null
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatches?: DispatchUncheckedUpdateManyWithoutTransporterNestedInput
  }

  export type TransporterCreateManyInput = {
    id?: string
    name: string
    area?: string | null
    contactPersonName?: string | null
    contactNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TransporterUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    area?: NullableStringFieldUpdateOperationsInput | string | null
    contactPersonName?: NullableStringFieldUpdateOperationsInput | string | null
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransporterUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    area?: NullableStringFieldUpdateOperationsInput | string | null
    contactPersonName?: NullableStringFieldUpdateOperationsInput | string | null
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerCreateInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dealBy?: StaffCreateNestedOneWithoutDealByCustomersInput
    approachForFunds?: StaffCreateNestedOneWithoutApproachForFundsCustomersInput
    vessels?: VesselCreateNestedManyWithoutImporterInput
    orders?: OrderCreateNestedManyWithoutCustomerInput
    purchaseOrders?: PurchaseOrderCreateNestedManyWithoutImporterInput
    dispatches?: DispatchCreateNestedManyWithoutImporterInput
  }

  export type CustomerUncheckedCreateInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    dealById?: string | null
    approachForFundsId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    vessels?: VesselUncheckedCreateNestedManyWithoutImporterInput
    orders?: OrderUncheckedCreateNestedManyWithoutCustomerInput
    purchaseOrders?: PurchaseOrderUncheckedCreateNestedManyWithoutImporterInput
    dispatches?: DispatchUncheckedCreateNestedManyWithoutImporterInput
  }

  export type CustomerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dealBy?: StaffUpdateOneWithoutDealByCustomersNestedInput
    approachForFunds?: StaffUpdateOneWithoutApproachForFundsCustomersNestedInput
    vessels?: VesselUpdateManyWithoutImporterNestedInput
    orders?: OrderUpdateManyWithoutCustomerNestedInput
    purchaseOrders?: PurchaseOrderUpdateManyWithoutImporterNestedInput
    dispatches?: DispatchUpdateManyWithoutImporterNestedInput
  }

  export type CustomerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    dealById?: NullableStringFieldUpdateOperationsInput | string | null
    approachForFundsId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vessels?: VesselUncheckedUpdateManyWithoutImporterNestedInput
    orders?: OrderUncheckedUpdateManyWithoutCustomerNestedInput
    purchaseOrders?: PurchaseOrderUncheckedUpdateManyWithoutImporterNestedInput
    dispatches?: DispatchUncheckedUpdateManyWithoutImporterNestedInput
  }

  export type CustomerCreateManyInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    dealById?: string | null
    approachForFundsId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    dealById?: NullableStringFieldUpdateOperationsInput | string | null
    approachForFundsId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VesselCreateInput = {
    id?: string
    vesselName: string
    quality?: string | null
    quantity: Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    importer: CustomerCreateNestedOneWithoutVesselsInput
    purchaseOrders?: PurchaseOrderCreateNestedManyWithoutVesselInput
    dispatches?: DispatchCreateNestedManyWithoutVesselInput
  }

  export type VesselUncheckedCreateInput = {
    id?: string
    vesselName: string
    importerId: string
    quality?: string | null
    quantity: Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    purchaseOrders?: PurchaseOrderUncheckedCreateNestedManyWithoutVesselInput
    dispatches?: DispatchUncheckedCreateNestedManyWithoutVesselInput
  }

  export type VesselUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    vesselName?: StringFieldUpdateOperationsInput | string
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    importer?: CustomerUpdateOneRequiredWithoutVesselsNestedInput
    purchaseOrders?: PurchaseOrderUpdateManyWithoutVesselNestedInput
    dispatches?: DispatchUpdateManyWithoutVesselNestedInput
  }

  export type VesselUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    vesselName?: StringFieldUpdateOperationsInput | string
    importerId?: StringFieldUpdateOperationsInput | string
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    purchaseOrders?: PurchaseOrderUncheckedUpdateManyWithoutVesselNestedInput
    dispatches?: DispatchUncheckedUpdateManyWithoutVesselNestedInput
  }

  export type VesselCreateManyInput = {
    id?: string
    vesselName: string
    importerId: string
    quality?: string | null
    quantity: Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VesselUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    vesselName?: StringFieldUpdateOperationsInput | string
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VesselUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    vesselName?: StringFieldUpdateOperationsInput | string
    importerId?: StringFieldUpdateOperationsInput | string
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderCreateInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    orderDate?: Date | string | null
    area?: string | null
    creditDays?: number | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    customer: CustomerCreateNestedOneWithoutOrdersInput
    orderBy?: StaffCreateNestedOneWithoutOrdersInput
    dispatches?: DispatchCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    customerId: string
    orderDate?: Date | string | null
    area?: string | null
    creditDays?: number | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    orderById?: string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    dispatches?: DispatchUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    creditDays?: NullableIntFieldUpdateOperationsInput | number | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutOrdersNestedInput
    orderBy?: StaffUpdateOneWithoutOrdersNestedInput
    dispatches?: DispatchUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    customerId?: StringFieldUpdateOperationsInput | string
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    creditDays?: NullableIntFieldUpdateOperationsInput | number | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    orderById?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatches?: DispatchUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderCreateManyInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    customerId: string
    orderDate?: Date | string | null
    area?: string | null
    creditDays?: number | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    orderById?: string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    creditDays?: NullableIntFieldUpdateOperationsInput | number | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    customerId?: StringFieldUpdateOperationsInput | string
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    creditDays?: NullableIntFieldUpdateOperationsInput | number | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    orderById?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseOrderCreateInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    orderDate?: Date | string | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    importer: CustomerCreateNestedOneWithoutPurchaseOrdersInput
    vessel: VesselCreateNestedOneWithoutPurchaseOrdersInput
    orderBy?: StaffCreateNestedOneWithoutPurchaseOrdersInput
    dispatches?: DispatchCreateNestedManyWithoutPurchaseOrderInput
  }

  export type PurchaseOrderUncheckedCreateInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    importerId: string
    vesselId: string
    orderDate?: Date | string | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    orderById?: string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    dispatches?: DispatchUncheckedCreateNestedManyWithoutPurchaseOrderInput
  }

  export type PurchaseOrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    importer?: CustomerUpdateOneRequiredWithoutPurchaseOrdersNestedInput
    vessel?: VesselUpdateOneRequiredWithoutPurchaseOrdersNestedInput
    orderBy?: StaffUpdateOneWithoutPurchaseOrdersNestedInput
    dispatches?: DispatchUpdateManyWithoutPurchaseOrderNestedInput
  }

  export type PurchaseOrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    importerId?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    orderById?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatches?: DispatchUncheckedUpdateManyWithoutPurchaseOrderNestedInput
  }

  export type PurchaseOrderCreateManyInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    importerId: string
    vesselId: string
    orderDate?: Date | string | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    orderById?: string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseOrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseOrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    importerId?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    orderById?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispatchCreateInput = {
    id?: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutDispatchesInput
    purchaseOrder: PurchaseOrderCreateNestedOneWithoutDispatchesInput
    vessel: VesselCreateNestedOneWithoutDispatchesInput
    transporter?: TransporterCreateNestedOneWithoutDispatchesInput
    importer?: CustomerCreateNestedOneWithoutDispatchesInput
  }

  export type DispatchUncheckedCreateInput = {
    id?: string
    poNumber: string
    purchasePoNumber: string
    vesselId: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    transporterId?: string | null
    importerId?: string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DispatchUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutDispatchesNestedInput
    purchaseOrder?: PurchaseOrderUpdateOneRequiredWithoutDispatchesNestedInput
    vessel?: VesselUpdateOneRequiredWithoutDispatchesNestedInput
    transporter?: TransporterUpdateOneWithoutDispatchesNestedInput
    importer?: CustomerUpdateOneWithoutDispatchesNestedInput
  }

  export type DispatchUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    purchasePoNumber?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    transporterId?: NullableStringFieldUpdateOperationsInput | string | null
    importerId?: NullableStringFieldUpdateOperationsInput | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispatchCreateManyInput = {
    id?: string
    poNumber: string
    purchasePoNumber: string
    vesselId: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    transporterId?: string | null
    importerId?: string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DispatchUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispatchUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    purchasePoNumber?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    transporterId?: NullableStringFieldUpdateOperationsInput | string | null
    importerId?: NullableStringFieldUpdateOperationsInput | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CustomerListRelationFilter = {
    every?: CustomerWhereInput
    some?: CustomerWhereInput
    none?: CustomerWhereInput
  }

  export type OrderListRelationFilter = {
    every?: OrderWhereInput
    some?: OrderWhereInput
    none?: OrderWhereInput
  }

  export type PurchaseOrderListRelationFilter = {
    every?: PurchaseOrderWhereInput
    some?: PurchaseOrderWhereInput
    none?: PurchaseOrderWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CustomerOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PurchaseOrderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type StaffCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StaffMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StaffMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DispatchListRelationFilter = {
    every?: DispatchWhereInput
    some?: DispatchWhereInput
    none?: DispatchWhereInput
  }

  export type DispatchOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TransporterCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    area?: SortOrder
    contactPersonName?: SortOrder
    contactNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TransporterMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    area?: SortOrder
    contactPersonName?: SortOrder
    contactNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TransporterMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    area?: SortOrder
    contactPersonName?: SortOrder
    contactNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumCustomerCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.CustomerCategory | EnumCustomerCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.CustomerCategory[] | ListEnumCustomerCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.CustomerCategory[] | ListEnumCustomerCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumCustomerCategoryFilter<$PrismaModel> | $Enums.CustomerCategory
  }

  export type StaffNullableRelationFilter = {
    is?: StaffWhereInput | null
    isNot?: StaffWhereInput | null
  }

  export type VesselListRelationFilter = {
    every?: VesselWhereInput
    some?: VesselWhereInput
    none?: VesselWhereInput
  }

  export type VesselOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CustomerCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    contactNumber?: SortOrder
    pocName?: SortOrder
    area?: SortOrder
    industrySector?: SortOrder
    dealById?: SortOrder
    approachForFundsId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomerMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    contactNumber?: SortOrder
    pocName?: SortOrder
    area?: SortOrder
    industrySector?: SortOrder
    dealById?: SortOrder
    approachForFundsId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomerMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    contactNumber?: SortOrder
    pocName?: SortOrder
    area?: SortOrder
    industrySector?: SortOrder
    dealById?: SortOrder
    approachForFundsId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumCustomerCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CustomerCategory | EnumCustomerCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.CustomerCategory[] | ListEnumCustomerCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.CustomerCategory[] | ListEnumCustomerCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumCustomerCategoryWithAggregatesFilter<$PrismaModel> | $Enums.CustomerCategory
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCustomerCategoryFilter<$PrismaModel>
    _max?: NestedEnumCustomerCategoryFilter<$PrismaModel>
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type CustomerRelationFilter = {
    is?: CustomerWhereInput
    isNot?: CustomerWhereInput
  }

  export type VesselCountOrderByAggregateInput = {
    id?: SortOrder
    vesselName?: SortOrder
    importerId?: SortOrder
    quality?: SortOrder
    quantity?: SortOrder
    dispatchedQuantity?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VesselAvgOrderByAggregateInput = {
    quantity?: SortOrder
    dispatchedQuantity?: SortOrder
  }

  export type VesselMaxOrderByAggregateInput = {
    id?: SortOrder
    vesselName?: SortOrder
    importerId?: SortOrder
    quality?: SortOrder
    quantity?: SortOrder
    dispatchedQuantity?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VesselMinOrderByAggregateInput = {
    id?: SortOrder
    vesselName?: SortOrder
    importerId?: SortOrder
    quality?: SortOrder
    quantity?: SortOrder
    dispatchedQuantity?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VesselSumOrderByAggregateInput = {
    quantity?: SortOrder
    dispatchedQuantity?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type EnumOrderTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderType | EnumOrderTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OrderType[] | ListEnumOrderTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderType[] | ListEnumOrderTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderTypeFilter<$PrismaModel> | $Enums.OrderType
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type EnumOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusFilter<$PrismaModel> | $Enums.OrderStatus
  }

  export type OrderCountOrderByAggregateInput = {
    id?: SortOrder
    poNumber?: SortOrder
    orderType?: SortOrder
    customerId?: SortOrder
    orderDate?: SortOrder
    area?: SortOrder
    creditDays?: SortOrder
    quality?: SortOrder
    rate?: SortOrder
    quantity?: SortOrder
    orderById?: SortOrder
    dispatchedOrder?: SortOrder
    orderStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderAvgOrderByAggregateInput = {
    creditDays?: SortOrder
    rate?: SortOrder
    quantity?: SortOrder
    dispatchedOrder?: SortOrder
  }

  export type OrderMaxOrderByAggregateInput = {
    id?: SortOrder
    poNumber?: SortOrder
    orderType?: SortOrder
    customerId?: SortOrder
    orderDate?: SortOrder
    area?: SortOrder
    creditDays?: SortOrder
    quality?: SortOrder
    rate?: SortOrder
    quantity?: SortOrder
    orderById?: SortOrder
    dispatchedOrder?: SortOrder
    orderStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderMinOrderByAggregateInput = {
    id?: SortOrder
    poNumber?: SortOrder
    orderType?: SortOrder
    customerId?: SortOrder
    orderDate?: SortOrder
    area?: SortOrder
    creditDays?: SortOrder
    quality?: SortOrder
    rate?: SortOrder
    quantity?: SortOrder
    orderById?: SortOrder
    dispatchedOrder?: SortOrder
    orderStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderSumOrderByAggregateInput = {
    creditDays?: SortOrder
    rate?: SortOrder
    quantity?: SortOrder
    dispatchedOrder?: SortOrder
  }

  export type EnumOrderTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderType | EnumOrderTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OrderType[] | ListEnumOrderTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderType[] | ListEnumOrderTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderTypeWithAggregatesFilter<$PrismaModel> | $Enums.OrderType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderTypeFilter<$PrismaModel>
    _max?: NestedEnumOrderTypeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type EnumOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderStatusFilter<$PrismaModel>
    _max?: NestedEnumOrderStatusFilter<$PrismaModel>
  }

  export type VesselRelationFilter = {
    is?: VesselWhereInput
    isNot?: VesselWhereInput
  }

  export type PurchaseOrderCountOrderByAggregateInput = {
    id?: SortOrder
    poNumber?: SortOrder
    orderType?: SortOrder
    importerId?: SortOrder
    vesselId?: SortOrder
    orderDate?: SortOrder
    quality?: SortOrder
    rate?: SortOrder
    quantity?: SortOrder
    orderById?: SortOrder
    dispatchedOrder?: SortOrder
    orderStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PurchaseOrderAvgOrderByAggregateInput = {
    rate?: SortOrder
    quantity?: SortOrder
    dispatchedOrder?: SortOrder
  }

  export type PurchaseOrderMaxOrderByAggregateInput = {
    id?: SortOrder
    poNumber?: SortOrder
    orderType?: SortOrder
    importerId?: SortOrder
    vesselId?: SortOrder
    orderDate?: SortOrder
    quality?: SortOrder
    rate?: SortOrder
    quantity?: SortOrder
    orderById?: SortOrder
    dispatchedOrder?: SortOrder
    orderStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PurchaseOrderMinOrderByAggregateInput = {
    id?: SortOrder
    poNumber?: SortOrder
    orderType?: SortOrder
    importerId?: SortOrder
    vesselId?: SortOrder
    orderDate?: SortOrder
    quality?: SortOrder
    rate?: SortOrder
    quantity?: SortOrder
    orderById?: SortOrder
    dispatchedOrder?: SortOrder
    orderStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PurchaseOrderSumOrderByAggregateInput = {
    rate?: SortOrder
    quantity?: SortOrder
    dispatchedOrder?: SortOrder
  }

  export type EnumDispatchTermsFilter<$PrismaModel = never> = {
    equals?: $Enums.DispatchTerms | EnumDispatchTermsFieldRefInput<$PrismaModel>
    in?: $Enums.DispatchTerms[] | ListEnumDispatchTermsFieldRefInput<$PrismaModel>
    notIn?: $Enums.DispatchTerms[] | ListEnumDispatchTermsFieldRefInput<$PrismaModel>
    not?: NestedEnumDispatchTermsFilter<$PrismaModel> | $Enums.DispatchTerms
  }

  export type EnumReceiptStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ReceiptStatus | EnumReceiptStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReceiptStatus[] | ListEnumReceiptStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReceiptStatus[] | ListEnumReceiptStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReceiptStatusFilter<$PrismaModel> | $Enums.ReceiptStatus
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type OrderRelationFilter = {
    is?: OrderWhereInput
    isNot?: OrderWhereInput
  }

  export type PurchaseOrderRelationFilter = {
    is?: PurchaseOrderWhereInput
    isNot?: PurchaseOrderWhereInput
  }

  export type TransporterNullableRelationFilter = {
    is?: TransporterWhereInput | null
    isNot?: TransporterWhereInput | null
  }

  export type CustomerNullableRelationFilter = {
    is?: CustomerWhereInput | null
    isNot?: CustomerWhereInput | null
  }

  export type DispatchCountOrderByAggregateInput = {
    id?: SortOrder
    poNumber?: SortOrder
    purchasePoNumber?: SortOrder
    vesselId?: SortOrder
    dispatchDate?: SortOrder
    dispatchedQuantity?: SortOrder
    lorryNumber?: SortOrder
    dispatchTerms?: SortOrder
    freight?: SortOrder
    transporterId?: SortOrder
    importerId?: SortOrder
    receivingQuantity?: SortOrder
    receiptDate?: SortOrder
    receiptStatus?: SortOrder
    softCopyStatus?: SortOrder
    entryInTally?: SortOrder
    saleInvoiceNumber?: SortOrder
    purchaseInvoiceNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DispatchAvgOrderByAggregateInput = {
    dispatchedQuantity?: SortOrder
    freight?: SortOrder
    receivingQuantity?: SortOrder
  }

  export type DispatchMaxOrderByAggregateInput = {
    id?: SortOrder
    poNumber?: SortOrder
    purchasePoNumber?: SortOrder
    vesselId?: SortOrder
    dispatchDate?: SortOrder
    dispatchedQuantity?: SortOrder
    lorryNumber?: SortOrder
    dispatchTerms?: SortOrder
    freight?: SortOrder
    transporterId?: SortOrder
    importerId?: SortOrder
    receivingQuantity?: SortOrder
    receiptDate?: SortOrder
    receiptStatus?: SortOrder
    softCopyStatus?: SortOrder
    entryInTally?: SortOrder
    saleInvoiceNumber?: SortOrder
    purchaseInvoiceNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DispatchMinOrderByAggregateInput = {
    id?: SortOrder
    poNumber?: SortOrder
    purchasePoNumber?: SortOrder
    vesselId?: SortOrder
    dispatchDate?: SortOrder
    dispatchedQuantity?: SortOrder
    lorryNumber?: SortOrder
    dispatchTerms?: SortOrder
    freight?: SortOrder
    transporterId?: SortOrder
    importerId?: SortOrder
    receivingQuantity?: SortOrder
    receiptDate?: SortOrder
    receiptStatus?: SortOrder
    softCopyStatus?: SortOrder
    entryInTally?: SortOrder
    saleInvoiceNumber?: SortOrder
    purchaseInvoiceNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DispatchSumOrderByAggregateInput = {
    dispatchedQuantity?: SortOrder
    freight?: SortOrder
    receivingQuantity?: SortOrder
  }

  export type EnumDispatchTermsWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DispatchTerms | EnumDispatchTermsFieldRefInput<$PrismaModel>
    in?: $Enums.DispatchTerms[] | ListEnumDispatchTermsFieldRefInput<$PrismaModel>
    notIn?: $Enums.DispatchTerms[] | ListEnumDispatchTermsFieldRefInput<$PrismaModel>
    not?: NestedEnumDispatchTermsWithAggregatesFilter<$PrismaModel> | $Enums.DispatchTerms
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDispatchTermsFilter<$PrismaModel>
    _max?: NestedEnumDispatchTermsFilter<$PrismaModel>
  }

  export type EnumReceiptStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ReceiptStatus | EnumReceiptStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReceiptStatus[] | ListEnumReceiptStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReceiptStatus[] | ListEnumReceiptStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReceiptStatusWithAggregatesFilter<$PrismaModel> | $Enums.ReceiptStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumReceiptStatusFilter<$PrismaModel>
    _max?: NestedEnumReceiptStatusFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type CustomerCreateNestedManyWithoutDealByInput = {
    create?: XOR<CustomerCreateWithoutDealByInput, CustomerUncheckedCreateWithoutDealByInput> | CustomerCreateWithoutDealByInput[] | CustomerUncheckedCreateWithoutDealByInput[]
    connectOrCreate?: CustomerCreateOrConnectWithoutDealByInput | CustomerCreateOrConnectWithoutDealByInput[]
    createMany?: CustomerCreateManyDealByInputEnvelope
    connect?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
  }

  export type CustomerCreateNestedManyWithoutApproachForFundsInput = {
    create?: XOR<CustomerCreateWithoutApproachForFundsInput, CustomerUncheckedCreateWithoutApproachForFundsInput> | CustomerCreateWithoutApproachForFundsInput[] | CustomerUncheckedCreateWithoutApproachForFundsInput[]
    connectOrCreate?: CustomerCreateOrConnectWithoutApproachForFundsInput | CustomerCreateOrConnectWithoutApproachForFundsInput[]
    createMany?: CustomerCreateManyApproachForFundsInputEnvelope
    connect?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
  }

  export type OrderCreateNestedManyWithoutOrderByInput = {
    create?: XOR<OrderCreateWithoutOrderByInput, OrderUncheckedCreateWithoutOrderByInput> | OrderCreateWithoutOrderByInput[] | OrderUncheckedCreateWithoutOrderByInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutOrderByInput | OrderCreateOrConnectWithoutOrderByInput[]
    createMany?: OrderCreateManyOrderByInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type PurchaseOrderCreateNestedManyWithoutOrderByInput = {
    create?: XOR<PurchaseOrderCreateWithoutOrderByInput, PurchaseOrderUncheckedCreateWithoutOrderByInput> | PurchaseOrderCreateWithoutOrderByInput[] | PurchaseOrderUncheckedCreateWithoutOrderByInput[]
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutOrderByInput | PurchaseOrderCreateOrConnectWithoutOrderByInput[]
    createMany?: PurchaseOrderCreateManyOrderByInputEnvelope
    connect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
  }

  export type CustomerUncheckedCreateNestedManyWithoutDealByInput = {
    create?: XOR<CustomerCreateWithoutDealByInput, CustomerUncheckedCreateWithoutDealByInput> | CustomerCreateWithoutDealByInput[] | CustomerUncheckedCreateWithoutDealByInput[]
    connectOrCreate?: CustomerCreateOrConnectWithoutDealByInput | CustomerCreateOrConnectWithoutDealByInput[]
    createMany?: CustomerCreateManyDealByInputEnvelope
    connect?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
  }

  export type CustomerUncheckedCreateNestedManyWithoutApproachForFundsInput = {
    create?: XOR<CustomerCreateWithoutApproachForFundsInput, CustomerUncheckedCreateWithoutApproachForFundsInput> | CustomerCreateWithoutApproachForFundsInput[] | CustomerUncheckedCreateWithoutApproachForFundsInput[]
    connectOrCreate?: CustomerCreateOrConnectWithoutApproachForFundsInput | CustomerCreateOrConnectWithoutApproachForFundsInput[]
    createMany?: CustomerCreateManyApproachForFundsInputEnvelope
    connect?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
  }

  export type OrderUncheckedCreateNestedManyWithoutOrderByInput = {
    create?: XOR<OrderCreateWithoutOrderByInput, OrderUncheckedCreateWithoutOrderByInput> | OrderCreateWithoutOrderByInput[] | OrderUncheckedCreateWithoutOrderByInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutOrderByInput | OrderCreateOrConnectWithoutOrderByInput[]
    createMany?: OrderCreateManyOrderByInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type PurchaseOrderUncheckedCreateNestedManyWithoutOrderByInput = {
    create?: XOR<PurchaseOrderCreateWithoutOrderByInput, PurchaseOrderUncheckedCreateWithoutOrderByInput> | PurchaseOrderCreateWithoutOrderByInput[] | PurchaseOrderUncheckedCreateWithoutOrderByInput[]
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutOrderByInput | PurchaseOrderCreateOrConnectWithoutOrderByInput[]
    createMany?: PurchaseOrderCreateManyOrderByInputEnvelope
    connect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CustomerUpdateManyWithoutDealByNestedInput = {
    create?: XOR<CustomerCreateWithoutDealByInput, CustomerUncheckedCreateWithoutDealByInput> | CustomerCreateWithoutDealByInput[] | CustomerUncheckedCreateWithoutDealByInput[]
    connectOrCreate?: CustomerCreateOrConnectWithoutDealByInput | CustomerCreateOrConnectWithoutDealByInput[]
    upsert?: CustomerUpsertWithWhereUniqueWithoutDealByInput | CustomerUpsertWithWhereUniqueWithoutDealByInput[]
    createMany?: CustomerCreateManyDealByInputEnvelope
    set?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    disconnect?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    delete?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    connect?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    update?: CustomerUpdateWithWhereUniqueWithoutDealByInput | CustomerUpdateWithWhereUniqueWithoutDealByInput[]
    updateMany?: CustomerUpdateManyWithWhereWithoutDealByInput | CustomerUpdateManyWithWhereWithoutDealByInput[]
    deleteMany?: CustomerScalarWhereInput | CustomerScalarWhereInput[]
  }

  export type CustomerUpdateManyWithoutApproachForFundsNestedInput = {
    create?: XOR<CustomerCreateWithoutApproachForFundsInput, CustomerUncheckedCreateWithoutApproachForFundsInput> | CustomerCreateWithoutApproachForFundsInput[] | CustomerUncheckedCreateWithoutApproachForFundsInput[]
    connectOrCreate?: CustomerCreateOrConnectWithoutApproachForFundsInput | CustomerCreateOrConnectWithoutApproachForFundsInput[]
    upsert?: CustomerUpsertWithWhereUniqueWithoutApproachForFundsInput | CustomerUpsertWithWhereUniqueWithoutApproachForFundsInput[]
    createMany?: CustomerCreateManyApproachForFundsInputEnvelope
    set?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    disconnect?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    delete?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    connect?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    update?: CustomerUpdateWithWhereUniqueWithoutApproachForFundsInput | CustomerUpdateWithWhereUniqueWithoutApproachForFundsInput[]
    updateMany?: CustomerUpdateManyWithWhereWithoutApproachForFundsInput | CustomerUpdateManyWithWhereWithoutApproachForFundsInput[]
    deleteMany?: CustomerScalarWhereInput | CustomerScalarWhereInput[]
  }

  export type OrderUpdateManyWithoutOrderByNestedInput = {
    create?: XOR<OrderCreateWithoutOrderByInput, OrderUncheckedCreateWithoutOrderByInput> | OrderCreateWithoutOrderByInput[] | OrderUncheckedCreateWithoutOrderByInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutOrderByInput | OrderCreateOrConnectWithoutOrderByInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutOrderByInput | OrderUpsertWithWhereUniqueWithoutOrderByInput[]
    createMany?: OrderCreateManyOrderByInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutOrderByInput | OrderUpdateWithWhereUniqueWithoutOrderByInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutOrderByInput | OrderUpdateManyWithWhereWithoutOrderByInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type PurchaseOrderUpdateManyWithoutOrderByNestedInput = {
    create?: XOR<PurchaseOrderCreateWithoutOrderByInput, PurchaseOrderUncheckedCreateWithoutOrderByInput> | PurchaseOrderCreateWithoutOrderByInput[] | PurchaseOrderUncheckedCreateWithoutOrderByInput[]
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutOrderByInput | PurchaseOrderCreateOrConnectWithoutOrderByInput[]
    upsert?: PurchaseOrderUpsertWithWhereUniqueWithoutOrderByInput | PurchaseOrderUpsertWithWhereUniqueWithoutOrderByInput[]
    createMany?: PurchaseOrderCreateManyOrderByInputEnvelope
    set?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    disconnect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    delete?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    connect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    update?: PurchaseOrderUpdateWithWhereUniqueWithoutOrderByInput | PurchaseOrderUpdateWithWhereUniqueWithoutOrderByInput[]
    updateMany?: PurchaseOrderUpdateManyWithWhereWithoutOrderByInput | PurchaseOrderUpdateManyWithWhereWithoutOrderByInput[]
    deleteMany?: PurchaseOrderScalarWhereInput | PurchaseOrderScalarWhereInput[]
  }

  export type CustomerUncheckedUpdateManyWithoutDealByNestedInput = {
    create?: XOR<CustomerCreateWithoutDealByInput, CustomerUncheckedCreateWithoutDealByInput> | CustomerCreateWithoutDealByInput[] | CustomerUncheckedCreateWithoutDealByInput[]
    connectOrCreate?: CustomerCreateOrConnectWithoutDealByInput | CustomerCreateOrConnectWithoutDealByInput[]
    upsert?: CustomerUpsertWithWhereUniqueWithoutDealByInput | CustomerUpsertWithWhereUniqueWithoutDealByInput[]
    createMany?: CustomerCreateManyDealByInputEnvelope
    set?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    disconnect?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    delete?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    connect?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    update?: CustomerUpdateWithWhereUniqueWithoutDealByInput | CustomerUpdateWithWhereUniqueWithoutDealByInput[]
    updateMany?: CustomerUpdateManyWithWhereWithoutDealByInput | CustomerUpdateManyWithWhereWithoutDealByInput[]
    deleteMany?: CustomerScalarWhereInput | CustomerScalarWhereInput[]
  }

  export type CustomerUncheckedUpdateManyWithoutApproachForFundsNestedInput = {
    create?: XOR<CustomerCreateWithoutApproachForFundsInput, CustomerUncheckedCreateWithoutApproachForFundsInput> | CustomerCreateWithoutApproachForFundsInput[] | CustomerUncheckedCreateWithoutApproachForFundsInput[]
    connectOrCreate?: CustomerCreateOrConnectWithoutApproachForFundsInput | CustomerCreateOrConnectWithoutApproachForFundsInput[]
    upsert?: CustomerUpsertWithWhereUniqueWithoutApproachForFundsInput | CustomerUpsertWithWhereUniqueWithoutApproachForFundsInput[]
    createMany?: CustomerCreateManyApproachForFundsInputEnvelope
    set?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    disconnect?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    delete?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    connect?: CustomerWhereUniqueInput | CustomerWhereUniqueInput[]
    update?: CustomerUpdateWithWhereUniqueWithoutApproachForFundsInput | CustomerUpdateWithWhereUniqueWithoutApproachForFundsInput[]
    updateMany?: CustomerUpdateManyWithWhereWithoutApproachForFundsInput | CustomerUpdateManyWithWhereWithoutApproachForFundsInput[]
    deleteMany?: CustomerScalarWhereInput | CustomerScalarWhereInput[]
  }

  export type OrderUncheckedUpdateManyWithoutOrderByNestedInput = {
    create?: XOR<OrderCreateWithoutOrderByInput, OrderUncheckedCreateWithoutOrderByInput> | OrderCreateWithoutOrderByInput[] | OrderUncheckedCreateWithoutOrderByInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutOrderByInput | OrderCreateOrConnectWithoutOrderByInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutOrderByInput | OrderUpsertWithWhereUniqueWithoutOrderByInput[]
    createMany?: OrderCreateManyOrderByInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutOrderByInput | OrderUpdateWithWhereUniqueWithoutOrderByInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutOrderByInput | OrderUpdateManyWithWhereWithoutOrderByInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type PurchaseOrderUncheckedUpdateManyWithoutOrderByNestedInput = {
    create?: XOR<PurchaseOrderCreateWithoutOrderByInput, PurchaseOrderUncheckedCreateWithoutOrderByInput> | PurchaseOrderCreateWithoutOrderByInput[] | PurchaseOrderUncheckedCreateWithoutOrderByInput[]
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutOrderByInput | PurchaseOrderCreateOrConnectWithoutOrderByInput[]
    upsert?: PurchaseOrderUpsertWithWhereUniqueWithoutOrderByInput | PurchaseOrderUpsertWithWhereUniqueWithoutOrderByInput[]
    createMany?: PurchaseOrderCreateManyOrderByInputEnvelope
    set?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    disconnect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    delete?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    connect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    update?: PurchaseOrderUpdateWithWhereUniqueWithoutOrderByInput | PurchaseOrderUpdateWithWhereUniqueWithoutOrderByInput[]
    updateMany?: PurchaseOrderUpdateManyWithWhereWithoutOrderByInput | PurchaseOrderUpdateManyWithWhereWithoutOrderByInput[]
    deleteMany?: PurchaseOrderScalarWhereInput | PurchaseOrderScalarWhereInput[]
  }

  export type DispatchCreateNestedManyWithoutTransporterInput = {
    create?: XOR<DispatchCreateWithoutTransporterInput, DispatchUncheckedCreateWithoutTransporterInput> | DispatchCreateWithoutTransporterInput[] | DispatchUncheckedCreateWithoutTransporterInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutTransporterInput | DispatchCreateOrConnectWithoutTransporterInput[]
    createMany?: DispatchCreateManyTransporterInputEnvelope
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
  }

  export type DispatchUncheckedCreateNestedManyWithoutTransporterInput = {
    create?: XOR<DispatchCreateWithoutTransporterInput, DispatchUncheckedCreateWithoutTransporterInput> | DispatchCreateWithoutTransporterInput[] | DispatchUncheckedCreateWithoutTransporterInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutTransporterInput | DispatchCreateOrConnectWithoutTransporterInput[]
    createMany?: DispatchCreateManyTransporterInputEnvelope
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
  }

  export type DispatchUpdateManyWithoutTransporterNestedInput = {
    create?: XOR<DispatchCreateWithoutTransporterInput, DispatchUncheckedCreateWithoutTransporterInput> | DispatchCreateWithoutTransporterInput[] | DispatchUncheckedCreateWithoutTransporterInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutTransporterInput | DispatchCreateOrConnectWithoutTransporterInput[]
    upsert?: DispatchUpsertWithWhereUniqueWithoutTransporterInput | DispatchUpsertWithWhereUniqueWithoutTransporterInput[]
    createMany?: DispatchCreateManyTransporterInputEnvelope
    set?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    disconnect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    delete?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    update?: DispatchUpdateWithWhereUniqueWithoutTransporterInput | DispatchUpdateWithWhereUniqueWithoutTransporterInput[]
    updateMany?: DispatchUpdateManyWithWhereWithoutTransporterInput | DispatchUpdateManyWithWhereWithoutTransporterInput[]
    deleteMany?: DispatchScalarWhereInput | DispatchScalarWhereInput[]
  }

  export type DispatchUncheckedUpdateManyWithoutTransporterNestedInput = {
    create?: XOR<DispatchCreateWithoutTransporterInput, DispatchUncheckedCreateWithoutTransporterInput> | DispatchCreateWithoutTransporterInput[] | DispatchUncheckedCreateWithoutTransporterInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutTransporterInput | DispatchCreateOrConnectWithoutTransporterInput[]
    upsert?: DispatchUpsertWithWhereUniqueWithoutTransporterInput | DispatchUpsertWithWhereUniqueWithoutTransporterInput[]
    createMany?: DispatchCreateManyTransporterInputEnvelope
    set?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    disconnect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    delete?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    update?: DispatchUpdateWithWhereUniqueWithoutTransporterInput | DispatchUpdateWithWhereUniqueWithoutTransporterInput[]
    updateMany?: DispatchUpdateManyWithWhereWithoutTransporterInput | DispatchUpdateManyWithWhereWithoutTransporterInput[]
    deleteMany?: DispatchScalarWhereInput | DispatchScalarWhereInput[]
  }

  export type StaffCreateNestedOneWithoutDealByCustomersInput = {
    create?: XOR<StaffCreateWithoutDealByCustomersInput, StaffUncheckedCreateWithoutDealByCustomersInput>
    connectOrCreate?: StaffCreateOrConnectWithoutDealByCustomersInput
    connect?: StaffWhereUniqueInput
  }

  export type StaffCreateNestedOneWithoutApproachForFundsCustomersInput = {
    create?: XOR<StaffCreateWithoutApproachForFundsCustomersInput, StaffUncheckedCreateWithoutApproachForFundsCustomersInput>
    connectOrCreate?: StaffCreateOrConnectWithoutApproachForFundsCustomersInput
    connect?: StaffWhereUniqueInput
  }

  export type VesselCreateNestedManyWithoutImporterInput = {
    create?: XOR<VesselCreateWithoutImporterInput, VesselUncheckedCreateWithoutImporterInput> | VesselCreateWithoutImporterInput[] | VesselUncheckedCreateWithoutImporterInput[]
    connectOrCreate?: VesselCreateOrConnectWithoutImporterInput | VesselCreateOrConnectWithoutImporterInput[]
    createMany?: VesselCreateManyImporterInputEnvelope
    connect?: VesselWhereUniqueInput | VesselWhereUniqueInput[]
  }

  export type OrderCreateNestedManyWithoutCustomerInput = {
    create?: XOR<OrderCreateWithoutCustomerInput, OrderUncheckedCreateWithoutCustomerInput> | OrderCreateWithoutCustomerInput[] | OrderUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutCustomerInput | OrderCreateOrConnectWithoutCustomerInput[]
    createMany?: OrderCreateManyCustomerInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type PurchaseOrderCreateNestedManyWithoutImporterInput = {
    create?: XOR<PurchaseOrderCreateWithoutImporterInput, PurchaseOrderUncheckedCreateWithoutImporterInput> | PurchaseOrderCreateWithoutImporterInput[] | PurchaseOrderUncheckedCreateWithoutImporterInput[]
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutImporterInput | PurchaseOrderCreateOrConnectWithoutImporterInput[]
    createMany?: PurchaseOrderCreateManyImporterInputEnvelope
    connect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
  }

  export type DispatchCreateNestedManyWithoutImporterInput = {
    create?: XOR<DispatchCreateWithoutImporterInput, DispatchUncheckedCreateWithoutImporterInput> | DispatchCreateWithoutImporterInput[] | DispatchUncheckedCreateWithoutImporterInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutImporterInput | DispatchCreateOrConnectWithoutImporterInput[]
    createMany?: DispatchCreateManyImporterInputEnvelope
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
  }

  export type VesselUncheckedCreateNestedManyWithoutImporterInput = {
    create?: XOR<VesselCreateWithoutImporterInput, VesselUncheckedCreateWithoutImporterInput> | VesselCreateWithoutImporterInput[] | VesselUncheckedCreateWithoutImporterInput[]
    connectOrCreate?: VesselCreateOrConnectWithoutImporterInput | VesselCreateOrConnectWithoutImporterInput[]
    createMany?: VesselCreateManyImporterInputEnvelope
    connect?: VesselWhereUniqueInput | VesselWhereUniqueInput[]
  }

  export type OrderUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: XOR<OrderCreateWithoutCustomerInput, OrderUncheckedCreateWithoutCustomerInput> | OrderCreateWithoutCustomerInput[] | OrderUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutCustomerInput | OrderCreateOrConnectWithoutCustomerInput[]
    createMany?: OrderCreateManyCustomerInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type PurchaseOrderUncheckedCreateNestedManyWithoutImporterInput = {
    create?: XOR<PurchaseOrderCreateWithoutImporterInput, PurchaseOrderUncheckedCreateWithoutImporterInput> | PurchaseOrderCreateWithoutImporterInput[] | PurchaseOrderUncheckedCreateWithoutImporterInput[]
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutImporterInput | PurchaseOrderCreateOrConnectWithoutImporterInput[]
    createMany?: PurchaseOrderCreateManyImporterInputEnvelope
    connect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
  }

  export type DispatchUncheckedCreateNestedManyWithoutImporterInput = {
    create?: XOR<DispatchCreateWithoutImporterInput, DispatchUncheckedCreateWithoutImporterInput> | DispatchCreateWithoutImporterInput[] | DispatchUncheckedCreateWithoutImporterInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutImporterInput | DispatchCreateOrConnectWithoutImporterInput[]
    createMany?: DispatchCreateManyImporterInputEnvelope
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
  }

  export type EnumCustomerCategoryFieldUpdateOperationsInput = {
    set?: $Enums.CustomerCategory
  }

  export type StaffUpdateOneWithoutDealByCustomersNestedInput = {
    create?: XOR<StaffCreateWithoutDealByCustomersInput, StaffUncheckedCreateWithoutDealByCustomersInput>
    connectOrCreate?: StaffCreateOrConnectWithoutDealByCustomersInput
    upsert?: StaffUpsertWithoutDealByCustomersInput
    disconnect?: StaffWhereInput | boolean
    delete?: StaffWhereInput | boolean
    connect?: StaffWhereUniqueInput
    update?: XOR<XOR<StaffUpdateToOneWithWhereWithoutDealByCustomersInput, StaffUpdateWithoutDealByCustomersInput>, StaffUncheckedUpdateWithoutDealByCustomersInput>
  }

  export type StaffUpdateOneWithoutApproachForFundsCustomersNestedInput = {
    create?: XOR<StaffCreateWithoutApproachForFundsCustomersInput, StaffUncheckedCreateWithoutApproachForFundsCustomersInput>
    connectOrCreate?: StaffCreateOrConnectWithoutApproachForFundsCustomersInput
    upsert?: StaffUpsertWithoutApproachForFundsCustomersInput
    disconnect?: StaffWhereInput | boolean
    delete?: StaffWhereInput | boolean
    connect?: StaffWhereUniqueInput
    update?: XOR<XOR<StaffUpdateToOneWithWhereWithoutApproachForFundsCustomersInput, StaffUpdateWithoutApproachForFundsCustomersInput>, StaffUncheckedUpdateWithoutApproachForFundsCustomersInput>
  }

  export type VesselUpdateManyWithoutImporterNestedInput = {
    create?: XOR<VesselCreateWithoutImporterInput, VesselUncheckedCreateWithoutImporterInput> | VesselCreateWithoutImporterInput[] | VesselUncheckedCreateWithoutImporterInput[]
    connectOrCreate?: VesselCreateOrConnectWithoutImporterInput | VesselCreateOrConnectWithoutImporterInput[]
    upsert?: VesselUpsertWithWhereUniqueWithoutImporterInput | VesselUpsertWithWhereUniqueWithoutImporterInput[]
    createMany?: VesselCreateManyImporterInputEnvelope
    set?: VesselWhereUniqueInput | VesselWhereUniqueInput[]
    disconnect?: VesselWhereUniqueInput | VesselWhereUniqueInput[]
    delete?: VesselWhereUniqueInput | VesselWhereUniqueInput[]
    connect?: VesselWhereUniqueInput | VesselWhereUniqueInput[]
    update?: VesselUpdateWithWhereUniqueWithoutImporterInput | VesselUpdateWithWhereUniqueWithoutImporterInput[]
    updateMany?: VesselUpdateManyWithWhereWithoutImporterInput | VesselUpdateManyWithWhereWithoutImporterInput[]
    deleteMany?: VesselScalarWhereInput | VesselScalarWhereInput[]
  }

  export type OrderUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<OrderCreateWithoutCustomerInput, OrderUncheckedCreateWithoutCustomerInput> | OrderCreateWithoutCustomerInput[] | OrderUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutCustomerInput | OrderCreateOrConnectWithoutCustomerInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutCustomerInput | OrderUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: OrderCreateManyCustomerInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutCustomerInput | OrderUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutCustomerInput | OrderUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type PurchaseOrderUpdateManyWithoutImporterNestedInput = {
    create?: XOR<PurchaseOrderCreateWithoutImporterInput, PurchaseOrderUncheckedCreateWithoutImporterInput> | PurchaseOrderCreateWithoutImporterInput[] | PurchaseOrderUncheckedCreateWithoutImporterInput[]
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutImporterInput | PurchaseOrderCreateOrConnectWithoutImporterInput[]
    upsert?: PurchaseOrderUpsertWithWhereUniqueWithoutImporterInput | PurchaseOrderUpsertWithWhereUniqueWithoutImporterInput[]
    createMany?: PurchaseOrderCreateManyImporterInputEnvelope
    set?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    disconnect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    delete?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    connect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    update?: PurchaseOrderUpdateWithWhereUniqueWithoutImporterInput | PurchaseOrderUpdateWithWhereUniqueWithoutImporterInput[]
    updateMany?: PurchaseOrderUpdateManyWithWhereWithoutImporterInput | PurchaseOrderUpdateManyWithWhereWithoutImporterInput[]
    deleteMany?: PurchaseOrderScalarWhereInput | PurchaseOrderScalarWhereInput[]
  }

  export type DispatchUpdateManyWithoutImporterNestedInput = {
    create?: XOR<DispatchCreateWithoutImporterInput, DispatchUncheckedCreateWithoutImporterInput> | DispatchCreateWithoutImporterInput[] | DispatchUncheckedCreateWithoutImporterInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutImporterInput | DispatchCreateOrConnectWithoutImporterInput[]
    upsert?: DispatchUpsertWithWhereUniqueWithoutImporterInput | DispatchUpsertWithWhereUniqueWithoutImporterInput[]
    createMany?: DispatchCreateManyImporterInputEnvelope
    set?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    disconnect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    delete?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    update?: DispatchUpdateWithWhereUniqueWithoutImporterInput | DispatchUpdateWithWhereUniqueWithoutImporterInput[]
    updateMany?: DispatchUpdateManyWithWhereWithoutImporterInput | DispatchUpdateManyWithWhereWithoutImporterInput[]
    deleteMany?: DispatchScalarWhereInput | DispatchScalarWhereInput[]
  }

  export type VesselUncheckedUpdateManyWithoutImporterNestedInput = {
    create?: XOR<VesselCreateWithoutImporterInput, VesselUncheckedCreateWithoutImporterInput> | VesselCreateWithoutImporterInput[] | VesselUncheckedCreateWithoutImporterInput[]
    connectOrCreate?: VesselCreateOrConnectWithoutImporterInput | VesselCreateOrConnectWithoutImporterInput[]
    upsert?: VesselUpsertWithWhereUniqueWithoutImporterInput | VesselUpsertWithWhereUniqueWithoutImporterInput[]
    createMany?: VesselCreateManyImporterInputEnvelope
    set?: VesselWhereUniqueInput | VesselWhereUniqueInput[]
    disconnect?: VesselWhereUniqueInput | VesselWhereUniqueInput[]
    delete?: VesselWhereUniqueInput | VesselWhereUniqueInput[]
    connect?: VesselWhereUniqueInput | VesselWhereUniqueInput[]
    update?: VesselUpdateWithWhereUniqueWithoutImporterInput | VesselUpdateWithWhereUniqueWithoutImporterInput[]
    updateMany?: VesselUpdateManyWithWhereWithoutImporterInput | VesselUpdateManyWithWhereWithoutImporterInput[]
    deleteMany?: VesselScalarWhereInput | VesselScalarWhereInput[]
  }

  export type OrderUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<OrderCreateWithoutCustomerInput, OrderUncheckedCreateWithoutCustomerInput> | OrderCreateWithoutCustomerInput[] | OrderUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutCustomerInput | OrderCreateOrConnectWithoutCustomerInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutCustomerInput | OrderUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: OrderCreateManyCustomerInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutCustomerInput | OrderUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutCustomerInput | OrderUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type PurchaseOrderUncheckedUpdateManyWithoutImporterNestedInput = {
    create?: XOR<PurchaseOrderCreateWithoutImporterInput, PurchaseOrderUncheckedCreateWithoutImporterInput> | PurchaseOrderCreateWithoutImporterInput[] | PurchaseOrderUncheckedCreateWithoutImporterInput[]
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutImporterInput | PurchaseOrderCreateOrConnectWithoutImporterInput[]
    upsert?: PurchaseOrderUpsertWithWhereUniqueWithoutImporterInput | PurchaseOrderUpsertWithWhereUniqueWithoutImporterInput[]
    createMany?: PurchaseOrderCreateManyImporterInputEnvelope
    set?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    disconnect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    delete?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    connect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    update?: PurchaseOrderUpdateWithWhereUniqueWithoutImporterInput | PurchaseOrderUpdateWithWhereUniqueWithoutImporterInput[]
    updateMany?: PurchaseOrderUpdateManyWithWhereWithoutImporterInput | PurchaseOrderUpdateManyWithWhereWithoutImporterInput[]
    deleteMany?: PurchaseOrderScalarWhereInput | PurchaseOrderScalarWhereInput[]
  }

  export type DispatchUncheckedUpdateManyWithoutImporterNestedInput = {
    create?: XOR<DispatchCreateWithoutImporterInput, DispatchUncheckedCreateWithoutImporterInput> | DispatchCreateWithoutImporterInput[] | DispatchUncheckedCreateWithoutImporterInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutImporterInput | DispatchCreateOrConnectWithoutImporterInput[]
    upsert?: DispatchUpsertWithWhereUniqueWithoutImporterInput | DispatchUpsertWithWhereUniqueWithoutImporterInput[]
    createMany?: DispatchCreateManyImporterInputEnvelope
    set?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    disconnect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    delete?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    update?: DispatchUpdateWithWhereUniqueWithoutImporterInput | DispatchUpdateWithWhereUniqueWithoutImporterInput[]
    updateMany?: DispatchUpdateManyWithWhereWithoutImporterInput | DispatchUpdateManyWithWhereWithoutImporterInput[]
    deleteMany?: DispatchScalarWhereInput | DispatchScalarWhereInput[]
  }

  export type CustomerCreateNestedOneWithoutVesselsInput = {
    create?: XOR<CustomerCreateWithoutVesselsInput, CustomerUncheckedCreateWithoutVesselsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutVesselsInput
    connect?: CustomerWhereUniqueInput
  }

  export type PurchaseOrderCreateNestedManyWithoutVesselInput = {
    create?: XOR<PurchaseOrderCreateWithoutVesselInput, PurchaseOrderUncheckedCreateWithoutVesselInput> | PurchaseOrderCreateWithoutVesselInput[] | PurchaseOrderUncheckedCreateWithoutVesselInput[]
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutVesselInput | PurchaseOrderCreateOrConnectWithoutVesselInput[]
    createMany?: PurchaseOrderCreateManyVesselInputEnvelope
    connect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
  }

  export type DispatchCreateNestedManyWithoutVesselInput = {
    create?: XOR<DispatchCreateWithoutVesselInput, DispatchUncheckedCreateWithoutVesselInput> | DispatchCreateWithoutVesselInput[] | DispatchUncheckedCreateWithoutVesselInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutVesselInput | DispatchCreateOrConnectWithoutVesselInput[]
    createMany?: DispatchCreateManyVesselInputEnvelope
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
  }

  export type PurchaseOrderUncheckedCreateNestedManyWithoutVesselInput = {
    create?: XOR<PurchaseOrderCreateWithoutVesselInput, PurchaseOrderUncheckedCreateWithoutVesselInput> | PurchaseOrderCreateWithoutVesselInput[] | PurchaseOrderUncheckedCreateWithoutVesselInput[]
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutVesselInput | PurchaseOrderCreateOrConnectWithoutVesselInput[]
    createMany?: PurchaseOrderCreateManyVesselInputEnvelope
    connect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
  }

  export type DispatchUncheckedCreateNestedManyWithoutVesselInput = {
    create?: XOR<DispatchCreateWithoutVesselInput, DispatchUncheckedCreateWithoutVesselInput> | DispatchCreateWithoutVesselInput[] | DispatchUncheckedCreateWithoutVesselInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutVesselInput | DispatchCreateOrConnectWithoutVesselInput[]
    createMany?: DispatchCreateManyVesselInputEnvelope
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type CustomerUpdateOneRequiredWithoutVesselsNestedInput = {
    create?: XOR<CustomerCreateWithoutVesselsInput, CustomerUncheckedCreateWithoutVesselsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutVesselsInput
    upsert?: CustomerUpsertWithoutVesselsInput
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutVesselsInput, CustomerUpdateWithoutVesselsInput>, CustomerUncheckedUpdateWithoutVesselsInput>
  }

  export type PurchaseOrderUpdateManyWithoutVesselNestedInput = {
    create?: XOR<PurchaseOrderCreateWithoutVesselInput, PurchaseOrderUncheckedCreateWithoutVesselInput> | PurchaseOrderCreateWithoutVesselInput[] | PurchaseOrderUncheckedCreateWithoutVesselInput[]
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutVesselInput | PurchaseOrderCreateOrConnectWithoutVesselInput[]
    upsert?: PurchaseOrderUpsertWithWhereUniqueWithoutVesselInput | PurchaseOrderUpsertWithWhereUniqueWithoutVesselInput[]
    createMany?: PurchaseOrderCreateManyVesselInputEnvelope
    set?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    disconnect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    delete?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    connect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    update?: PurchaseOrderUpdateWithWhereUniqueWithoutVesselInput | PurchaseOrderUpdateWithWhereUniqueWithoutVesselInput[]
    updateMany?: PurchaseOrderUpdateManyWithWhereWithoutVesselInput | PurchaseOrderUpdateManyWithWhereWithoutVesselInput[]
    deleteMany?: PurchaseOrderScalarWhereInput | PurchaseOrderScalarWhereInput[]
  }

  export type DispatchUpdateManyWithoutVesselNestedInput = {
    create?: XOR<DispatchCreateWithoutVesselInput, DispatchUncheckedCreateWithoutVesselInput> | DispatchCreateWithoutVesselInput[] | DispatchUncheckedCreateWithoutVesselInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutVesselInput | DispatchCreateOrConnectWithoutVesselInput[]
    upsert?: DispatchUpsertWithWhereUniqueWithoutVesselInput | DispatchUpsertWithWhereUniqueWithoutVesselInput[]
    createMany?: DispatchCreateManyVesselInputEnvelope
    set?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    disconnect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    delete?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    update?: DispatchUpdateWithWhereUniqueWithoutVesselInput | DispatchUpdateWithWhereUniqueWithoutVesselInput[]
    updateMany?: DispatchUpdateManyWithWhereWithoutVesselInput | DispatchUpdateManyWithWhereWithoutVesselInput[]
    deleteMany?: DispatchScalarWhereInput | DispatchScalarWhereInput[]
  }

  export type PurchaseOrderUncheckedUpdateManyWithoutVesselNestedInput = {
    create?: XOR<PurchaseOrderCreateWithoutVesselInput, PurchaseOrderUncheckedCreateWithoutVesselInput> | PurchaseOrderCreateWithoutVesselInput[] | PurchaseOrderUncheckedCreateWithoutVesselInput[]
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutVesselInput | PurchaseOrderCreateOrConnectWithoutVesselInput[]
    upsert?: PurchaseOrderUpsertWithWhereUniqueWithoutVesselInput | PurchaseOrderUpsertWithWhereUniqueWithoutVesselInput[]
    createMany?: PurchaseOrderCreateManyVesselInputEnvelope
    set?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    disconnect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    delete?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    connect?: PurchaseOrderWhereUniqueInput | PurchaseOrderWhereUniqueInput[]
    update?: PurchaseOrderUpdateWithWhereUniqueWithoutVesselInput | PurchaseOrderUpdateWithWhereUniqueWithoutVesselInput[]
    updateMany?: PurchaseOrderUpdateManyWithWhereWithoutVesselInput | PurchaseOrderUpdateManyWithWhereWithoutVesselInput[]
    deleteMany?: PurchaseOrderScalarWhereInput | PurchaseOrderScalarWhereInput[]
  }

  export type DispatchUncheckedUpdateManyWithoutVesselNestedInput = {
    create?: XOR<DispatchCreateWithoutVesselInput, DispatchUncheckedCreateWithoutVesselInput> | DispatchCreateWithoutVesselInput[] | DispatchUncheckedCreateWithoutVesselInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutVesselInput | DispatchCreateOrConnectWithoutVesselInput[]
    upsert?: DispatchUpsertWithWhereUniqueWithoutVesselInput | DispatchUpsertWithWhereUniqueWithoutVesselInput[]
    createMany?: DispatchCreateManyVesselInputEnvelope
    set?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    disconnect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    delete?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    update?: DispatchUpdateWithWhereUniqueWithoutVesselInput | DispatchUpdateWithWhereUniqueWithoutVesselInput[]
    updateMany?: DispatchUpdateManyWithWhereWithoutVesselInput | DispatchUpdateManyWithWhereWithoutVesselInput[]
    deleteMany?: DispatchScalarWhereInput | DispatchScalarWhereInput[]
  }

  export type CustomerCreateNestedOneWithoutOrdersInput = {
    create?: XOR<CustomerCreateWithoutOrdersInput, CustomerUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutOrdersInput
    connect?: CustomerWhereUniqueInput
  }

  export type StaffCreateNestedOneWithoutOrdersInput = {
    create?: XOR<StaffCreateWithoutOrdersInput, StaffUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: StaffCreateOrConnectWithoutOrdersInput
    connect?: StaffWhereUniqueInput
  }

  export type DispatchCreateNestedManyWithoutOrderInput = {
    create?: XOR<DispatchCreateWithoutOrderInput, DispatchUncheckedCreateWithoutOrderInput> | DispatchCreateWithoutOrderInput[] | DispatchUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutOrderInput | DispatchCreateOrConnectWithoutOrderInput[]
    createMany?: DispatchCreateManyOrderInputEnvelope
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
  }

  export type DispatchUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<DispatchCreateWithoutOrderInput, DispatchUncheckedCreateWithoutOrderInput> | DispatchCreateWithoutOrderInput[] | DispatchUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutOrderInput | DispatchCreateOrConnectWithoutOrderInput[]
    createMany?: DispatchCreateManyOrderInputEnvelope
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
  }

  export type EnumOrderTypeFieldUpdateOperationsInput = {
    set?: $Enums.OrderType
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type EnumOrderStatusFieldUpdateOperationsInput = {
    set?: $Enums.OrderStatus
  }

  export type CustomerUpdateOneRequiredWithoutOrdersNestedInput = {
    create?: XOR<CustomerCreateWithoutOrdersInput, CustomerUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutOrdersInput
    upsert?: CustomerUpsertWithoutOrdersInput
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutOrdersInput, CustomerUpdateWithoutOrdersInput>, CustomerUncheckedUpdateWithoutOrdersInput>
  }

  export type StaffUpdateOneWithoutOrdersNestedInput = {
    create?: XOR<StaffCreateWithoutOrdersInput, StaffUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: StaffCreateOrConnectWithoutOrdersInput
    upsert?: StaffUpsertWithoutOrdersInput
    disconnect?: StaffWhereInput | boolean
    delete?: StaffWhereInput | boolean
    connect?: StaffWhereUniqueInput
    update?: XOR<XOR<StaffUpdateToOneWithWhereWithoutOrdersInput, StaffUpdateWithoutOrdersInput>, StaffUncheckedUpdateWithoutOrdersInput>
  }

  export type DispatchUpdateManyWithoutOrderNestedInput = {
    create?: XOR<DispatchCreateWithoutOrderInput, DispatchUncheckedCreateWithoutOrderInput> | DispatchCreateWithoutOrderInput[] | DispatchUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutOrderInput | DispatchCreateOrConnectWithoutOrderInput[]
    upsert?: DispatchUpsertWithWhereUniqueWithoutOrderInput | DispatchUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: DispatchCreateManyOrderInputEnvelope
    set?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    disconnect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    delete?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    update?: DispatchUpdateWithWhereUniqueWithoutOrderInput | DispatchUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: DispatchUpdateManyWithWhereWithoutOrderInput | DispatchUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: DispatchScalarWhereInput | DispatchScalarWhereInput[]
  }

  export type DispatchUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<DispatchCreateWithoutOrderInput, DispatchUncheckedCreateWithoutOrderInput> | DispatchCreateWithoutOrderInput[] | DispatchUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutOrderInput | DispatchCreateOrConnectWithoutOrderInput[]
    upsert?: DispatchUpsertWithWhereUniqueWithoutOrderInput | DispatchUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: DispatchCreateManyOrderInputEnvelope
    set?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    disconnect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    delete?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    update?: DispatchUpdateWithWhereUniqueWithoutOrderInput | DispatchUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: DispatchUpdateManyWithWhereWithoutOrderInput | DispatchUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: DispatchScalarWhereInput | DispatchScalarWhereInput[]
  }

  export type CustomerCreateNestedOneWithoutPurchaseOrdersInput = {
    create?: XOR<CustomerCreateWithoutPurchaseOrdersInput, CustomerUncheckedCreateWithoutPurchaseOrdersInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutPurchaseOrdersInput
    connect?: CustomerWhereUniqueInput
  }

  export type VesselCreateNestedOneWithoutPurchaseOrdersInput = {
    create?: XOR<VesselCreateWithoutPurchaseOrdersInput, VesselUncheckedCreateWithoutPurchaseOrdersInput>
    connectOrCreate?: VesselCreateOrConnectWithoutPurchaseOrdersInput
    connect?: VesselWhereUniqueInput
  }

  export type StaffCreateNestedOneWithoutPurchaseOrdersInput = {
    create?: XOR<StaffCreateWithoutPurchaseOrdersInput, StaffUncheckedCreateWithoutPurchaseOrdersInput>
    connectOrCreate?: StaffCreateOrConnectWithoutPurchaseOrdersInput
    connect?: StaffWhereUniqueInput
  }

  export type DispatchCreateNestedManyWithoutPurchaseOrderInput = {
    create?: XOR<DispatchCreateWithoutPurchaseOrderInput, DispatchUncheckedCreateWithoutPurchaseOrderInput> | DispatchCreateWithoutPurchaseOrderInput[] | DispatchUncheckedCreateWithoutPurchaseOrderInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutPurchaseOrderInput | DispatchCreateOrConnectWithoutPurchaseOrderInput[]
    createMany?: DispatchCreateManyPurchaseOrderInputEnvelope
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
  }

  export type DispatchUncheckedCreateNestedManyWithoutPurchaseOrderInput = {
    create?: XOR<DispatchCreateWithoutPurchaseOrderInput, DispatchUncheckedCreateWithoutPurchaseOrderInput> | DispatchCreateWithoutPurchaseOrderInput[] | DispatchUncheckedCreateWithoutPurchaseOrderInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutPurchaseOrderInput | DispatchCreateOrConnectWithoutPurchaseOrderInput[]
    createMany?: DispatchCreateManyPurchaseOrderInputEnvelope
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
  }

  export type CustomerUpdateOneRequiredWithoutPurchaseOrdersNestedInput = {
    create?: XOR<CustomerCreateWithoutPurchaseOrdersInput, CustomerUncheckedCreateWithoutPurchaseOrdersInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutPurchaseOrdersInput
    upsert?: CustomerUpsertWithoutPurchaseOrdersInput
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutPurchaseOrdersInput, CustomerUpdateWithoutPurchaseOrdersInput>, CustomerUncheckedUpdateWithoutPurchaseOrdersInput>
  }

  export type VesselUpdateOneRequiredWithoutPurchaseOrdersNestedInput = {
    create?: XOR<VesselCreateWithoutPurchaseOrdersInput, VesselUncheckedCreateWithoutPurchaseOrdersInput>
    connectOrCreate?: VesselCreateOrConnectWithoutPurchaseOrdersInput
    upsert?: VesselUpsertWithoutPurchaseOrdersInput
    connect?: VesselWhereUniqueInput
    update?: XOR<XOR<VesselUpdateToOneWithWhereWithoutPurchaseOrdersInput, VesselUpdateWithoutPurchaseOrdersInput>, VesselUncheckedUpdateWithoutPurchaseOrdersInput>
  }

  export type StaffUpdateOneWithoutPurchaseOrdersNestedInput = {
    create?: XOR<StaffCreateWithoutPurchaseOrdersInput, StaffUncheckedCreateWithoutPurchaseOrdersInput>
    connectOrCreate?: StaffCreateOrConnectWithoutPurchaseOrdersInput
    upsert?: StaffUpsertWithoutPurchaseOrdersInput
    disconnect?: StaffWhereInput | boolean
    delete?: StaffWhereInput | boolean
    connect?: StaffWhereUniqueInput
    update?: XOR<XOR<StaffUpdateToOneWithWhereWithoutPurchaseOrdersInput, StaffUpdateWithoutPurchaseOrdersInput>, StaffUncheckedUpdateWithoutPurchaseOrdersInput>
  }

  export type DispatchUpdateManyWithoutPurchaseOrderNestedInput = {
    create?: XOR<DispatchCreateWithoutPurchaseOrderInput, DispatchUncheckedCreateWithoutPurchaseOrderInput> | DispatchCreateWithoutPurchaseOrderInput[] | DispatchUncheckedCreateWithoutPurchaseOrderInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutPurchaseOrderInput | DispatchCreateOrConnectWithoutPurchaseOrderInput[]
    upsert?: DispatchUpsertWithWhereUniqueWithoutPurchaseOrderInput | DispatchUpsertWithWhereUniqueWithoutPurchaseOrderInput[]
    createMany?: DispatchCreateManyPurchaseOrderInputEnvelope
    set?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    disconnect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    delete?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    update?: DispatchUpdateWithWhereUniqueWithoutPurchaseOrderInput | DispatchUpdateWithWhereUniqueWithoutPurchaseOrderInput[]
    updateMany?: DispatchUpdateManyWithWhereWithoutPurchaseOrderInput | DispatchUpdateManyWithWhereWithoutPurchaseOrderInput[]
    deleteMany?: DispatchScalarWhereInput | DispatchScalarWhereInput[]
  }

  export type DispatchUncheckedUpdateManyWithoutPurchaseOrderNestedInput = {
    create?: XOR<DispatchCreateWithoutPurchaseOrderInput, DispatchUncheckedCreateWithoutPurchaseOrderInput> | DispatchCreateWithoutPurchaseOrderInput[] | DispatchUncheckedCreateWithoutPurchaseOrderInput[]
    connectOrCreate?: DispatchCreateOrConnectWithoutPurchaseOrderInput | DispatchCreateOrConnectWithoutPurchaseOrderInput[]
    upsert?: DispatchUpsertWithWhereUniqueWithoutPurchaseOrderInput | DispatchUpsertWithWhereUniqueWithoutPurchaseOrderInput[]
    createMany?: DispatchCreateManyPurchaseOrderInputEnvelope
    set?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    disconnect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    delete?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    connect?: DispatchWhereUniqueInput | DispatchWhereUniqueInput[]
    update?: DispatchUpdateWithWhereUniqueWithoutPurchaseOrderInput | DispatchUpdateWithWhereUniqueWithoutPurchaseOrderInput[]
    updateMany?: DispatchUpdateManyWithWhereWithoutPurchaseOrderInput | DispatchUpdateManyWithWhereWithoutPurchaseOrderInput[]
    deleteMany?: DispatchScalarWhereInput | DispatchScalarWhereInput[]
  }

  export type OrderCreateNestedOneWithoutDispatchesInput = {
    create?: XOR<OrderCreateWithoutDispatchesInput, OrderUncheckedCreateWithoutDispatchesInput>
    connectOrCreate?: OrderCreateOrConnectWithoutDispatchesInput
    connect?: OrderWhereUniqueInput
  }

  export type PurchaseOrderCreateNestedOneWithoutDispatchesInput = {
    create?: XOR<PurchaseOrderCreateWithoutDispatchesInput, PurchaseOrderUncheckedCreateWithoutDispatchesInput>
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutDispatchesInput
    connect?: PurchaseOrderWhereUniqueInput
  }

  export type VesselCreateNestedOneWithoutDispatchesInput = {
    create?: XOR<VesselCreateWithoutDispatchesInput, VesselUncheckedCreateWithoutDispatchesInput>
    connectOrCreate?: VesselCreateOrConnectWithoutDispatchesInput
    connect?: VesselWhereUniqueInput
  }

  export type TransporterCreateNestedOneWithoutDispatchesInput = {
    create?: XOR<TransporterCreateWithoutDispatchesInput, TransporterUncheckedCreateWithoutDispatchesInput>
    connectOrCreate?: TransporterCreateOrConnectWithoutDispatchesInput
    connect?: TransporterWhereUniqueInput
  }

  export type CustomerCreateNestedOneWithoutDispatchesInput = {
    create?: XOR<CustomerCreateWithoutDispatchesInput, CustomerUncheckedCreateWithoutDispatchesInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutDispatchesInput
    connect?: CustomerWhereUniqueInput
  }

  export type EnumDispatchTermsFieldUpdateOperationsInput = {
    set?: $Enums.DispatchTerms
  }

  export type EnumReceiptStatusFieldUpdateOperationsInput = {
    set?: $Enums.ReceiptStatus
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type OrderUpdateOneRequiredWithoutDispatchesNestedInput = {
    create?: XOR<OrderCreateWithoutDispatchesInput, OrderUncheckedCreateWithoutDispatchesInput>
    connectOrCreate?: OrderCreateOrConnectWithoutDispatchesInput
    upsert?: OrderUpsertWithoutDispatchesInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutDispatchesInput, OrderUpdateWithoutDispatchesInput>, OrderUncheckedUpdateWithoutDispatchesInput>
  }

  export type PurchaseOrderUpdateOneRequiredWithoutDispatchesNestedInput = {
    create?: XOR<PurchaseOrderCreateWithoutDispatchesInput, PurchaseOrderUncheckedCreateWithoutDispatchesInput>
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutDispatchesInput
    upsert?: PurchaseOrderUpsertWithoutDispatchesInput
    connect?: PurchaseOrderWhereUniqueInput
    update?: XOR<XOR<PurchaseOrderUpdateToOneWithWhereWithoutDispatchesInput, PurchaseOrderUpdateWithoutDispatchesInput>, PurchaseOrderUncheckedUpdateWithoutDispatchesInput>
  }

  export type VesselUpdateOneRequiredWithoutDispatchesNestedInput = {
    create?: XOR<VesselCreateWithoutDispatchesInput, VesselUncheckedCreateWithoutDispatchesInput>
    connectOrCreate?: VesselCreateOrConnectWithoutDispatchesInput
    upsert?: VesselUpsertWithoutDispatchesInput
    connect?: VesselWhereUniqueInput
    update?: XOR<XOR<VesselUpdateToOneWithWhereWithoutDispatchesInput, VesselUpdateWithoutDispatchesInput>, VesselUncheckedUpdateWithoutDispatchesInput>
  }

  export type TransporterUpdateOneWithoutDispatchesNestedInput = {
    create?: XOR<TransporterCreateWithoutDispatchesInput, TransporterUncheckedCreateWithoutDispatchesInput>
    connectOrCreate?: TransporterCreateOrConnectWithoutDispatchesInput
    upsert?: TransporterUpsertWithoutDispatchesInput
    disconnect?: TransporterWhereInput | boolean
    delete?: TransporterWhereInput | boolean
    connect?: TransporterWhereUniqueInput
    update?: XOR<XOR<TransporterUpdateToOneWithWhereWithoutDispatchesInput, TransporterUpdateWithoutDispatchesInput>, TransporterUncheckedUpdateWithoutDispatchesInput>
  }

  export type CustomerUpdateOneWithoutDispatchesNestedInput = {
    create?: XOR<CustomerCreateWithoutDispatchesInput, CustomerUncheckedCreateWithoutDispatchesInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutDispatchesInput
    upsert?: CustomerUpsertWithoutDispatchesInput
    disconnect?: CustomerWhereInput | boolean
    delete?: CustomerWhereInput | boolean
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutDispatchesInput, CustomerUpdateWithoutDispatchesInput>, CustomerUncheckedUpdateWithoutDispatchesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumCustomerCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.CustomerCategory | EnumCustomerCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.CustomerCategory[] | ListEnumCustomerCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.CustomerCategory[] | ListEnumCustomerCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumCustomerCategoryFilter<$PrismaModel> | $Enums.CustomerCategory
  }

  export type NestedEnumCustomerCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CustomerCategory | EnumCustomerCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.CustomerCategory[] | ListEnumCustomerCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.CustomerCategory[] | ListEnumCustomerCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumCustomerCategoryWithAggregatesFilter<$PrismaModel> | $Enums.CustomerCategory
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCustomerCategoryFilter<$PrismaModel>
    _max?: NestedEnumCustomerCategoryFilter<$PrismaModel>
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedEnumOrderTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderType | EnumOrderTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OrderType[] | ListEnumOrderTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderType[] | ListEnumOrderTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderTypeFilter<$PrismaModel> | $Enums.OrderType
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedEnumOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusFilter<$PrismaModel> | $Enums.OrderStatus
  }

  export type NestedEnumOrderTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderType | EnumOrderTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OrderType[] | ListEnumOrderTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderType[] | ListEnumOrderTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderTypeWithAggregatesFilter<$PrismaModel> | $Enums.OrderType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderTypeFilter<$PrismaModel>
    _max?: NestedEnumOrderTypeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderStatusFilter<$PrismaModel>
    _max?: NestedEnumOrderStatusFilter<$PrismaModel>
  }

  export type NestedEnumDispatchTermsFilter<$PrismaModel = never> = {
    equals?: $Enums.DispatchTerms | EnumDispatchTermsFieldRefInput<$PrismaModel>
    in?: $Enums.DispatchTerms[] | ListEnumDispatchTermsFieldRefInput<$PrismaModel>
    notIn?: $Enums.DispatchTerms[] | ListEnumDispatchTermsFieldRefInput<$PrismaModel>
    not?: NestedEnumDispatchTermsFilter<$PrismaModel> | $Enums.DispatchTerms
  }

  export type NestedEnumReceiptStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ReceiptStatus | EnumReceiptStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReceiptStatus[] | ListEnumReceiptStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReceiptStatus[] | ListEnumReceiptStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReceiptStatusFilter<$PrismaModel> | $Enums.ReceiptStatus
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumDispatchTermsWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DispatchTerms | EnumDispatchTermsFieldRefInput<$PrismaModel>
    in?: $Enums.DispatchTerms[] | ListEnumDispatchTermsFieldRefInput<$PrismaModel>
    notIn?: $Enums.DispatchTerms[] | ListEnumDispatchTermsFieldRefInput<$PrismaModel>
    not?: NestedEnumDispatchTermsWithAggregatesFilter<$PrismaModel> | $Enums.DispatchTerms
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDispatchTermsFilter<$PrismaModel>
    _max?: NestedEnumDispatchTermsFilter<$PrismaModel>
  }

  export type NestedEnumReceiptStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ReceiptStatus | EnumReceiptStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReceiptStatus[] | ListEnumReceiptStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReceiptStatus[] | ListEnumReceiptStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReceiptStatusWithAggregatesFilter<$PrismaModel> | $Enums.ReceiptStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumReceiptStatusFilter<$PrismaModel>
    _max?: NestedEnumReceiptStatusFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type CustomerCreateWithoutDealByInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    approachForFunds?: StaffCreateNestedOneWithoutApproachForFundsCustomersInput
    vessels?: VesselCreateNestedManyWithoutImporterInput
    orders?: OrderCreateNestedManyWithoutCustomerInput
    purchaseOrders?: PurchaseOrderCreateNestedManyWithoutImporterInput
    dispatches?: DispatchCreateNestedManyWithoutImporterInput
  }

  export type CustomerUncheckedCreateWithoutDealByInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    approachForFundsId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    vessels?: VesselUncheckedCreateNestedManyWithoutImporterInput
    orders?: OrderUncheckedCreateNestedManyWithoutCustomerInput
    purchaseOrders?: PurchaseOrderUncheckedCreateNestedManyWithoutImporterInput
    dispatches?: DispatchUncheckedCreateNestedManyWithoutImporterInput
  }

  export type CustomerCreateOrConnectWithoutDealByInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutDealByInput, CustomerUncheckedCreateWithoutDealByInput>
  }

  export type CustomerCreateManyDealByInputEnvelope = {
    data: CustomerCreateManyDealByInput | CustomerCreateManyDealByInput[]
    skipDuplicates?: boolean
  }

  export type CustomerCreateWithoutApproachForFundsInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dealBy?: StaffCreateNestedOneWithoutDealByCustomersInput
    vessels?: VesselCreateNestedManyWithoutImporterInput
    orders?: OrderCreateNestedManyWithoutCustomerInput
    purchaseOrders?: PurchaseOrderCreateNestedManyWithoutImporterInput
    dispatches?: DispatchCreateNestedManyWithoutImporterInput
  }

  export type CustomerUncheckedCreateWithoutApproachForFundsInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    dealById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    vessels?: VesselUncheckedCreateNestedManyWithoutImporterInput
    orders?: OrderUncheckedCreateNestedManyWithoutCustomerInput
    purchaseOrders?: PurchaseOrderUncheckedCreateNestedManyWithoutImporterInput
    dispatches?: DispatchUncheckedCreateNestedManyWithoutImporterInput
  }

  export type CustomerCreateOrConnectWithoutApproachForFundsInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutApproachForFundsInput, CustomerUncheckedCreateWithoutApproachForFundsInput>
  }

  export type CustomerCreateManyApproachForFundsInputEnvelope = {
    data: CustomerCreateManyApproachForFundsInput | CustomerCreateManyApproachForFundsInput[]
    skipDuplicates?: boolean
  }

  export type OrderCreateWithoutOrderByInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    orderDate?: Date | string | null
    area?: string | null
    creditDays?: number | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    customer: CustomerCreateNestedOneWithoutOrdersInput
    dispatches?: DispatchCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutOrderByInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    customerId: string
    orderDate?: Date | string | null
    area?: string | null
    creditDays?: number | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    dispatches?: DispatchUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutOrderByInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutOrderByInput, OrderUncheckedCreateWithoutOrderByInput>
  }

  export type OrderCreateManyOrderByInputEnvelope = {
    data: OrderCreateManyOrderByInput | OrderCreateManyOrderByInput[]
    skipDuplicates?: boolean
  }

  export type PurchaseOrderCreateWithoutOrderByInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    orderDate?: Date | string | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    importer: CustomerCreateNestedOneWithoutPurchaseOrdersInput
    vessel: VesselCreateNestedOneWithoutPurchaseOrdersInput
    dispatches?: DispatchCreateNestedManyWithoutPurchaseOrderInput
  }

  export type PurchaseOrderUncheckedCreateWithoutOrderByInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    importerId: string
    vesselId: string
    orderDate?: Date | string | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    dispatches?: DispatchUncheckedCreateNestedManyWithoutPurchaseOrderInput
  }

  export type PurchaseOrderCreateOrConnectWithoutOrderByInput = {
    where: PurchaseOrderWhereUniqueInput
    create: XOR<PurchaseOrderCreateWithoutOrderByInput, PurchaseOrderUncheckedCreateWithoutOrderByInput>
  }

  export type PurchaseOrderCreateManyOrderByInputEnvelope = {
    data: PurchaseOrderCreateManyOrderByInput | PurchaseOrderCreateManyOrderByInput[]
    skipDuplicates?: boolean
  }

  export type CustomerUpsertWithWhereUniqueWithoutDealByInput = {
    where: CustomerWhereUniqueInput
    update: XOR<CustomerUpdateWithoutDealByInput, CustomerUncheckedUpdateWithoutDealByInput>
    create: XOR<CustomerCreateWithoutDealByInput, CustomerUncheckedCreateWithoutDealByInput>
  }

  export type CustomerUpdateWithWhereUniqueWithoutDealByInput = {
    where: CustomerWhereUniqueInput
    data: XOR<CustomerUpdateWithoutDealByInput, CustomerUncheckedUpdateWithoutDealByInput>
  }

  export type CustomerUpdateManyWithWhereWithoutDealByInput = {
    where: CustomerScalarWhereInput
    data: XOR<CustomerUpdateManyMutationInput, CustomerUncheckedUpdateManyWithoutDealByInput>
  }

  export type CustomerScalarWhereInput = {
    AND?: CustomerScalarWhereInput | CustomerScalarWhereInput[]
    OR?: CustomerScalarWhereInput[]
    NOT?: CustomerScalarWhereInput | CustomerScalarWhereInput[]
    id?: StringFilter<"Customer"> | string
    name?: StringFilter<"Customer"> | string
    category?: EnumCustomerCategoryFilter<"Customer"> | $Enums.CustomerCategory
    contactNumber?: StringNullableFilter<"Customer"> | string | null
    pocName?: StringNullableFilter<"Customer"> | string | null
    area?: StringNullableFilter<"Customer"> | string | null
    industrySector?: StringNullableFilter<"Customer"> | string | null
    dealById?: StringNullableFilter<"Customer"> | string | null
    approachForFundsId?: StringNullableFilter<"Customer"> | string | null
    createdAt?: DateTimeFilter<"Customer"> | Date | string
    updatedAt?: DateTimeFilter<"Customer"> | Date | string
  }

  export type CustomerUpsertWithWhereUniqueWithoutApproachForFundsInput = {
    where: CustomerWhereUniqueInput
    update: XOR<CustomerUpdateWithoutApproachForFundsInput, CustomerUncheckedUpdateWithoutApproachForFundsInput>
    create: XOR<CustomerCreateWithoutApproachForFundsInput, CustomerUncheckedCreateWithoutApproachForFundsInput>
  }

  export type CustomerUpdateWithWhereUniqueWithoutApproachForFundsInput = {
    where: CustomerWhereUniqueInput
    data: XOR<CustomerUpdateWithoutApproachForFundsInput, CustomerUncheckedUpdateWithoutApproachForFundsInput>
  }

  export type CustomerUpdateManyWithWhereWithoutApproachForFundsInput = {
    where: CustomerScalarWhereInput
    data: XOR<CustomerUpdateManyMutationInput, CustomerUncheckedUpdateManyWithoutApproachForFundsInput>
  }

  export type OrderUpsertWithWhereUniqueWithoutOrderByInput = {
    where: OrderWhereUniqueInput
    update: XOR<OrderUpdateWithoutOrderByInput, OrderUncheckedUpdateWithoutOrderByInput>
    create: XOR<OrderCreateWithoutOrderByInput, OrderUncheckedCreateWithoutOrderByInput>
  }

  export type OrderUpdateWithWhereUniqueWithoutOrderByInput = {
    where: OrderWhereUniqueInput
    data: XOR<OrderUpdateWithoutOrderByInput, OrderUncheckedUpdateWithoutOrderByInput>
  }

  export type OrderUpdateManyWithWhereWithoutOrderByInput = {
    where: OrderScalarWhereInput
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyWithoutOrderByInput>
  }

  export type OrderScalarWhereInput = {
    AND?: OrderScalarWhereInput | OrderScalarWhereInput[]
    OR?: OrderScalarWhereInput[]
    NOT?: OrderScalarWhereInput | OrderScalarWhereInput[]
    id?: StringFilter<"Order"> | string
    poNumber?: StringFilter<"Order"> | string
    orderType?: EnumOrderTypeFilter<"Order"> | $Enums.OrderType
    customerId?: StringFilter<"Order"> | string
    orderDate?: DateTimeNullableFilter<"Order"> | Date | string | null
    area?: StringNullableFilter<"Order"> | string | null
    creditDays?: IntNullableFilter<"Order"> | number | null
    quality?: StringNullableFilter<"Order"> | string | null
    rate?: DecimalNullableFilter<"Order"> | Decimal | DecimalJsLike | number | string | null
    quantity?: DecimalNullableFilter<"Order"> | Decimal | DecimalJsLike | number | string | null
    orderById?: StringNullableFilter<"Order"> | string | null
    dispatchedOrder?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
  }

  export type PurchaseOrderUpsertWithWhereUniqueWithoutOrderByInput = {
    where: PurchaseOrderWhereUniqueInput
    update: XOR<PurchaseOrderUpdateWithoutOrderByInput, PurchaseOrderUncheckedUpdateWithoutOrderByInput>
    create: XOR<PurchaseOrderCreateWithoutOrderByInput, PurchaseOrderUncheckedCreateWithoutOrderByInput>
  }

  export type PurchaseOrderUpdateWithWhereUniqueWithoutOrderByInput = {
    where: PurchaseOrderWhereUniqueInput
    data: XOR<PurchaseOrderUpdateWithoutOrderByInput, PurchaseOrderUncheckedUpdateWithoutOrderByInput>
  }

  export type PurchaseOrderUpdateManyWithWhereWithoutOrderByInput = {
    where: PurchaseOrderScalarWhereInput
    data: XOR<PurchaseOrderUpdateManyMutationInput, PurchaseOrderUncheckedUpdateManyWithoutOrderByInput>
  }

  export type PurchaseOrderScalarWhereInput = {
    AND?: PurchaseOrderScalarWhereInput | PurchaseOrderScalarWhereInput[]
    OR?: PurchaseOrderScalarWhereInput[]
    NOT?: PurchaseOrderScalarWhereInput | PurchaseOrderScalarWhereInput[]
    id?: StringFilter<"PurchaseOrder"> | string
    poNumber?: StringFilter<"PurchaseOrder"> | string
    orderType?: EnumOrderTypeFilter<"PurchaseOrder"> | $Enums.OrderType
    importerId?: StringFilter<"PurchaseOrder"> | string
    vesselId?: StringFilter<"PurchaseOrder"> | string
    orderDate?: DateTimeNullableFilter<"PurchaseOrder"> | Date | string | null
    quality?: StringNullableFilter<"PurchaseOrder"> | string | null
    rate?: DecimalNullableFilter<"PurchaseOrder"> | Decimal | DecimalJsLike | number | string | null
    quantity?: DecimalNullableFilter<"PurchaseOrder"> | Decimal | DecimalJsLike | number | string | null
    orderById?: StringNullableFilter<"PurchaseOrder"> | string | null
    dispatchedOrder?: DecimalFilter<"PurchaseOrder"> | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFilter<"PurchaseOrder"> | $Enums.OrderStatus
    createdAt?: DateTimeFilter<"PurchaseOrder"> | Date | string
    updatedAt?: DateTimeFilter<"PurchaseOrder"> | Date | string
  }

  export type DispatchCreateWithoutTransporterInput = {
    id?: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutDispatchesInput
    purchaseOrder: PurchaseOrderCreateNestedOneWithoutDispatchesInput
    vessel: VesselCreateNestedOneWithoutDispatchesInput
    importer?: CustomerCreateNestedOneWithoutDispatchesInput
  }

  export type DispatchUncheckedCreateWithoutTransporterInput = {
    id?: string
    poNumber: string
    purchasePoNumber: string
    vesselId: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    importerId?: string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DispatchCreateOrConnectWithoutTransporterInput = {
    where: DispatchWhereUniqueInput
    create: XOR<DispatchCreateWithoutTransporterInput, DispatchUncheckedCreateWithoutTransporterInput>
  }

  export type DispatchCreateManyTransporterInputEnvelope = {
    data: DispatchCreateManyTransporterInput | DispatchCreateManyTransporterInput[]
    skipDuplicates?: boolean
  }

  export type DispatchUpsertWithWhereUniqueWithoutTransporterInput = {
    where: DispatchWhereUniqueInput
    update: XOR<DispatchUpdateWithoutTransporterInput, DispatchUncheckedUpdateWithoutTransporterInput>
    create: XOR<DispatchCreateWithoutTransporterInput, DispatchUncheckedCreateWithoutTransporterInput>
  }

  export type DispatchUpdateWithWhereUniqueWithoutTransporterInput = {
    where: DispatchWhereUniqueInput
    data: XOR<DispatchUpdateWithoutTransporterInput, DispatchUncheckedUpdateWithoutTransporterInput>
  }

  export type DispatchUpdateManyWithWhereWithoutTransporterInput = {
    where: DispatchScalarWhereInput
    data: XOR<DispatchUpdateManyMutationInput, DispatchUncheckedUpdateManyWithoutTransporterInput>
  }

  export type DispatchScalarWhereInput = {
    AND?: DispatchScalarWhereInput | DispatchScalarWhereInput[]
    OR?: DispatchScalarWhereInput[]
    NOT?: DispatchScalarWhereInput | DispatchScalarWhereInput[]
    id?: StringFilter<"Dispatch"> | string
    poNumber?: StringFilter<"Dispatch"> | string
    purchasePoNumber?: StringFilter<"Dispatch"> | string
    vesselId?: StringFilter<"Dispatch"> | string
    dispatchDate?: DateTimeFilter<"Dispatch"> | Date | string
    dispatchedQuantity?: DecimalFilter<"Dispatch"> | Decimal | DecimalJsLike | number | string
    lorryNumber?: StringNullableFilter<"Dispatch"> | string | null
    dispatchTerms?: EnumDispatchTermsFilter<"Dispatch"> | $Enums.DispatchTerms
    freight?: DecimalNullableFilter<"Dispatch"> | Decimal | DecimalJsLike | number | string | null
    transporterId?: StringNullableFilter<"Dispatch"> | string | null
    importerId?: StringNullableFilter<"Dispatch"> | string | null
    receivingQuantity?: DecimalNullableFilter<"Dispatch"> | Decimal | DecimalJsLike | number | string | null
    receiptDate?: DateTimeNullableFilter<"Dispatch"> | Date | string | null
    receiptStatus?: EnumReceiptStatusFilter<"Dispatch"> | $Enums.ReceiptStatus
    softCopyStatus?: BoolFilter<"Dispatch"> | boolean
    entryInTally?: BoolFilter<"Dispatch"> | boolean
    saleInvoiceNumber?: StringNullableFilter<"Dispatch"> | string | null
    purchaseInvoiceNumber?: StringNullableFilter<"Dispatch"> | string | null
    createdAt?: DateTimeFilter<"Dispatch"> | Date | string
    updatedAt?: DateTimeFilter<"Dispatch"> | Date | string
  }

  export type StaffCreateWithoutDealByCustomersInput = {
    id?: string
    name: string
    role?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    approachForFundsCustomers?: CustomerCreateNestedManyWithoutApproachForFundsInput
    orders?: OrderCreateNestedManyWithoutOrderByInput
    purchaseOrders?: PurchaseOrderCreateNestedManyWithoutOrderByInput
  }

  export type StaffUncheckedCreateWithoutDealByCustomersInput = {
    id?: string
    name: string
    role?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    approachForFundsCustomers?: CustomerUncheckedCreateNestedManyWithoutApproachForFundsInput
    orders?: OrderUncheckedCreateNestedManyWithoutOrderByInput
    purchaseOrders?: PurchaseOrderUncheckedCreateNestedManyWithoutOrderByInput
  }

  export type StaffCreateOrConnectWithoutDealByCustomersInput = {
    where: StaffWhereUniqueInput
    create: XOR<StaffCreateWithoutDealByCustomersInput, StaffUncheckedCreateWithoutDealByCustomersInput>
  }

  export type StaffCreateWithoutApproachForFundsCustomersInput = {
    id?: string
    name: string
    role?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dealByCustomers?: CustomerCreateNestedManyWithoutDealByInput
    orders?: OrderCreateNestedManyWithoutOrderByInput
    purchaseOrders?: PurchaseOrderCreateNestedManyWithoutOrderByInput
  }

  export type StaffUncheckedCreateWithoutApproachForFundsCustomersInput = {
    id?: string
    name: string
    role?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dealByCustomers?: CustomerUncheckedCreateNestedManyWithoutDealByInput
    orders?: OrderUncheckedCreateNestedManyWithoutOrderByInput
    purchaseOrders?: PurchaseOrderUncheckedCreateNestedManyWithoutOrderByInput
  }

  export type StaffCreateOrConnectWithoutApproachForFundsCustomersInput = {
    where: StaffWhereUniqueInput
    create: XOR<StaffCreateWithoutApproachForFundsCustomersInput, StaffUncheckedCreateWithoutApproachForFundsCustomersInput>
  }

  export type VesselCreateWithoutImporterInput = {
    id?: string
    vesselName: string
    quality?: string | null
    quantity: Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    purchaseOrders?: PurchaseOrderCreateNestedManyWithoutVesselInput
    dispatches?: DispatchCreateNestedManyWithoutVesselInput
  }

  export type VesselUncheckedCreateWithoutImporterInput = {
    id?: string
    vesselName: string
    quality?: string | null
    quantity: Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    purchaseOrders?: PurchaseOrderUncheckedCreateNestedManyWithoutVesselInput
    dispatches?: DispatchUncheckedCreateNestedManyWithoutVesselInput
  }

  export type VesselCreateOrConnectWithoutImporterInput = {
    where: VesselWhereUniqueInput
    create: XOR<VesselCreateWithoutImporterInput, VesselUncheckedCreateWithoutImporterInput>
  }

  export type VesselCreateManyImporterInputEnvelope = {
    data: VesselCreateManyImporterInput | VesselCreateManyImporterInput[]
    skipDuplicates?: boolean
  }

  export type OrderCreateWithoutCustomerInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    orderDate?: Date | string | null
    area?: string | null
    creditDays?: number | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    orderBy?: StaffCreateNestedOneWithoutOrdersInput
    dispatches?: DispatchCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutCustomerInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    orderDate?: Date | string | null
    area?: string | null
    creditDays?: number | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    orderById?: string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    dispatches?: DispatchUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutCustomerInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutCustomerInput, OrderUncheckedCreateWithoutCustomerInput>
  }

  export type OrderCreateManyCustomerInputEnvelope = {
    data: OrderCreateManyCustomerInput | OrderCreateManyCustomerInput[]
    skipDuplicates?: boolean
  }

  export type PurchaseOrderCreateWithoutImporterInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    orderDate?: Date | string | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    vessel: VesselCreateNestedOneWithoutPurchaseOrdersInput
    orderBy?: StaffCreateNestedOneWithoutPurchaseOrdersInput
    dispatches?: DispatchCreateNestedManyWithoutPurchaseOrderInput
  }

  export type PurchaseOrderUncheckedCreateWithoutImporterInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    vesselId: string
    orderDate?: Date | string | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    orderById?: string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    dispatches?: DispatchUncheckedCreateNestedManyWithoutPurchaseOrderInput
  }

  export type PurchaseOrderCreateOrConnectWithoutImporterInput = {
    where: PurchaseOrderWhereUniqueInput
    create: XOR<PurchaseOrderCreateWithoutImporterInput, PurchaseOrderUncheckedCreateWithoutImporterInput>
  }

  export type PurchaseOrderCreateManyImporterInputEnvelope = {
    data: PurchaseOrderCreateManyImporterInput | PurchaseOrderCreateManyImporterInput[]
    skipDuplicates?: boolean
  }

  export type DispatchCreateWithoutImporterInput = {
    id?: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutDispatchesInput
    purchaseOrder: PurchaseOrderCreateNestedOneWithoutDispatchesInput
    vessel: VesselCreateNestedOneWithoutDispatchesInput
    transporter?: TransporterCreateNestedOneWithoutDispatchesInput
  }

  export type DispatchUncheckedCreateWithoutImporterInput = {
    id?: string
    poNumber: string
    purchasePoNumber: string
    vesselId: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    transporterId?: string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DispatchCreateOrConnectWithoutImporterInput = {
    where: DispatchWhereUniqueInput
    create: XOR<DispatchCreateWithoutImporterInput, DispatchUncheckedCreateWithoutImporterInput>
  }

  export type DispatchCreateManyImporterInputEnvelope = {
    data: DispatchCreateManyImporterInput | DispatchCreateManyImporterInput[]
    skipDuplicates?: boolean
  }

  export type StaffUpsertWithoutDealByCustomersInput = {
    update: XOR<StaffUpdateWithoutDealByCustomersInput, StaffUncheckedUpdateWithoutDealByCustomersInput>
    create: XOR<StaffCreateWithoutDealByCustomersInput, StaffUncheckedCreateWithoutDealByCustomersInput>
    where?: StaffWhereInput
  }

  export type StaffUpdateToOneWithWhereWithoutDealByCustomersInput = {
    where?: StaffWhereInput
    data: XOR<StaffUpdateWithoutDealByCustomersInput, StaffUncheckedUpdateWithoutDealByCustomersInput>
  }

  export type StaffUpdateWithoutDealByCustomersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    approachForFundsCustomers?: CustomerUpdateManyWithoutApproachForFundsNestedInput
    orders?: OrderUpdateManyWithoutOrderByNestedInput
    purchaseOrders?: PurchaseOrderUpdateManyWithoutOrderByNestedInput
  }

  export type StaffUncheckedUpdateWithoutDealByCustomersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    approachForFundsCustomers?: CustomerUncheckedUpdateManyWithoutApproachForFundsNestedInput
    orders?: OrderUncheckedUpdateManyWithoutOrderByNestedInput
    purchaseOrders?: PurchaseOrderUncheckedUpdateManyWithoutOrderByNestedInput
  }

  export type StaffUpsertWithoutApproachForFundsCustomersInput = {
    update: XOR<StaffUpdateWithoutApproachForFundsCustomersInput, StaffUncheckedUpdateWithoutApproachForFundsCustomersInput>
    create: XOR<StaffCreateWithoutApproachForFundsCustomersInput, StaffUncheckedCreateWithoutApproachForFundsCustomersInput>
    where?: StaffWhereInput
  }

  export type StaffUpdateToOneWithWhereWithoutApproachForFundsCustomersInput = {
    where?: StaffWhereInput
    data: XOR<StaffUpdateWithoutApproachForFundsCustomersInput, StaffUncheckedUpdateWithoutApproachForFundsCustomersInput>
  }

  export type StaffUpdateWithoutApproachForFundsCustomersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dealByCustomers?: CustomerUpdateManyWithoutDealByNestedInput
    orders?: OrderUpdateManyWithoutOrderByNestedInput
    purchaseOrders?: PurchaseOrderUpdateManyWithoutOrderByNestedInput
  }

  export type StaffUncheckedUpdateWithoutApproachForFundsCustomersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dealByCustomers?: CustomerUncheckedUpdateManyWithoutDealByNestedInput
    orders?: OrderUncheckedUpdateManyWithoutOrderByNestedInput
    purchaseOrders?: PurchaseOrderUncheckedUpdateManyWithoutOrderByNestedInput
  }

  export type VesselUpsertWithWhereUniqueWithoutImporterInput = {
    where: VesselWhereUniqueInput
    update: XOR<VesselUpdateWithoutImporterInput, VesselUncheckedUpdateWithoutImporterInput>
    create: XOR<VesselCreateWithoutImporterInput, VesselUncheckedCreateWithoutImporterInput>
  }

  export type VesselUpdateWithWhereUniqueWithoutImporterInput = {
    where: VesselWhereUniqueInput
    data: XOR<VesselUpdateWithoutImporterInput, VesselUncheckedUpdateWithoutImporterInput>
  }

  export type VesselUpdateManyWithWhereWithoutImporterInput = {
    where: VesselScalarWhereInput
    data: XOR<VesselUpdateManyMutationInput, VesselUncheckedUpdateManyWithoutImporterInput>
  }

  export type VesselScalarWhereInput = {
    AND?: VesselScalarWhereInput | VesselScalarWhereInput[]
    OR?: VesselScalarWhereInput[]
    NOT?: VesselScalarWhereInput | VesselScalarWhereInput[]
    id?: StringFilter<"Vessel"> | string
    vesselName?: StringFilter<"Vessel"> | string
    importerId?: StringFilter<"Vessel"> | string
    quality?: StringNullableFilter<"Vessel"> | string | null
    quantity?: DecimalFilter<"Vessel"> | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalFilter<"Vessel"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"Vessel"> | Date | string
    updatedAt?: DateTimeFilter<"Vessel"> | Date | string
  }

  export type OrderUpsertWithWhereUniqueWithoutCustomerInput = {
    where: OrderWhereUniqueInput
    update: XOR<OrderUpdateWithoutCustomerInput, OrderUncheckedUpdateWithoutCustomerInput>
    create: XOR<OrderCreateWithoutCustomerInput, OrderUncheckedCreateWithoutCustomerInput>
  }

  export type OrderUpdateWithWhereUniqueWithoutCustomerInput = {
    where: OrderWhereUniqueInput
    data: XOR<OrderUpdateWithoutCustomerInput, OrderUncheckedUpdateWithoutCustomerInput>
  }

  export type OrderUpdateManyWithWhereWithoutCustomerInput = {
    where: OrderScalarWhereInput
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyWithoutCustomerInput>
  }

  export type PurchaseOrderUpsertWithWhereUniqueWithoutImporterInput = {
    where: PurchaseOrderWhereUniqueInput
    update: XOR<PurchaseOrderUpdateWithoutImporterInput, PurchaseOrderUncheckedUpdateWithoutImporterInput>
    create: XOR<PurchaseOrderCreateWithoutImporterInput, PurchaseOrderUncheckedCreateWithoutImporterInput>
  }

  export type PurchaseOrderUpdateWithWhereUniqueWithoutImporterInput = {
    where: PurchaseOrderWhereUniqueInput
    data: XOR<PurchaseOrderUpdateWithoutImporterInput, PurchaseOrderUncheckedUpdateWithoutImporterInput>
  }

  export type PurchaseOrderUpdateManyWithWhereWithoutImporterInput = {
    where: PurchaseOrderScalarWhereInput
    data: XOR<PurchaseOrderUpdateManyMutationInput, PurchaseOrderUncheckedUpdateManyWithoutImporterInput>
  }

  export type DispatchUpsertWithWhereUniqueWithoutImporterInput = {
    where: DispatchWhereUniqueInput
    update: XOR<DispatchUpdateWithoutImporterInput, DispatchUncheckedUpdateWithoutImporterInput>
    create: XOR<DispatchCreateWithoutImporterInput, DispatchUncheckedCreateWithoutImporterInput>
  }

  export type DispatchUpdateWithWhereUniqueWithoutImporterInput = {
    where: DispatchWhereUniqueInput
    data: XOR<DispatchUpdateWithoutImporterInput, DispatchUncheckedUpdateWithoutImporterInput>
  }

  export type DispatchUpdateManyWithWhereWithoutImporterInput = {
    where: DispatchScalarWhereInput
    data: XOR<DispatchUpdateManyMutationInput, DispatchUncheckedUpdateManyWithoutImporterInput>
  }

  export type CustomerCreateWithoutVesselsInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dealBy?: StaffCreateNestedOneWithoutDealByCustomersInput
    approachForFunds?: StaffCreateNestedOneWithoutApproachForFundsCustomersInput
    orders?: OrderCreateNestedManyWithoutCustomerInput
    purchaseOrders?: PurchaseOrderCreateNestedManyWithoutImporterInput
    dispatches?: DispatchCreateNestedManyWithoutImporterInput
  }

  export type CustomerUncheckedCreateWithoutVesselsInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    dealById?: string | null
    approachForFundsId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: OrderUncheckedCreateNestedManyWithoutCustomerInput
    purchaseOrders?: PurchaseOrderUncheckedCreateNestedManyWithoutImporterInput
    dispatches?: DispatchUncheckedCreateNestedManyWithoutImporterInput
  }

  export type CustomerCreateOrConnectWithoutVesselsInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutVesselsInput, CustomerUncheckedCreateWithoutVesselsInput>
  }

  export type PurchaseOrderCreateWithoutVesselInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    orderDate?: Date | string | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    importer: CustomerCreateNestedOneWithoutPurchaseOrdersInput
    orderBy?: StaffCreateNestedOneWithoutPurchaseOrdersInput
    dispatches?: DispatchCreateNestedManyWithoutPurchaseOrderInput
  }

  export type PurchaseOrderUncheckedCreateWithoutVesselInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    importerId: string
    orderDate?: Date | string | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    orderById?: string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    dispatches?: DispatchUncheckedCreateNestedManyWithoutPurchaseOrderInput
  }

  export type PurchaseOrderCreateOrConnectWithoutVesselInput = {
    where: PurchaseOrderWhereUniqueInput
    create: XOR<PurchaseOrderCreateWithoutVesselInput, PurchaseOrderUncheckedCreateWithoutVesselInput>
  }

  export type PurchaseOrderCreateManyVesselInputEnvelope = {
    data: PurchaseOrderCreateManyVesselInput | PurchaseOrderCreateManyVesselInput[]
    skipDuplicates?: boolean
  }

  export type DispatchCreateWithoutVesselInput = {
    id?: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutDispatchesInput
    purchaseOrder: PurchaseOrderCreateNestedOneWithoutDispatchesInput
    transporter?: TransporterCreateNestedOneWithoutDispatchesInput
    importer?: CustomerCreateNestedOneWithoutDispatchesInput
  }

  export type DispatchUncheckedCreateWithoutVesselInput = {
    id?: string
    poNumber: string
    purchasePoNumber: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    transporterId?: string | null
    importerId?: string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DispatchCreateOrConnectWithoutVesselInput = {
    where: DispatchWhereUniqueInput
    create: XOR<DispatchCreateWithoutVesselInput, DispatchUncheckedCreateWithoutVesselInput>
  }

  export type DispatchCreateManyVesselInputEnvelope = {
    data: DispatchCreateManyVesselInput | DispatchCreateManyVesselInput[]
    skipDuplicates?: boolean
  }

  export type CustomerUpsertWithoutVesselsInput = {
    update: XOR<CustomerUpdateWithoutVesselsInput, CustomerUncheckedUpdateWithoutVesselsInput>
    create: XOR<CustomerCreateWithoutVesselsInput, CustomerUncheckedCreateWithoutVesselsInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutVesselsInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutVesselsInput, CustomerUncheckedUpdateWithoutVesselsInput>
  }

  export type CustomerUpdateWithoutVesselsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dealBy?: StaffUpdateOneWithoutDealByCustomersNestedInput
    approachForFunds?: StaffUpdateOneWithoutApproachForFundsCustomersNestedInput
    orders?: OrderUpdateManyWithoutCustomerNestedInput
    purchaseOrders?: PurchaseOrderUpdateManyWithoutImporterNestedInput
    dispatches?: DispatchUpdateManyWithoutImporterNestedInput
  }

  export type CustomerUncheckedUpdateWithoutVesselsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    dealById?: NullableStringFieldUpdateOperationsInput | string | null
    approachForFundsId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: OrderUncheckedUpdateManyWithoutCustomerNestedInput
    purchaseOrders?: PurchaseOrderUncheckedUpdateManyWithoutImporterNestedInput
    dispatches?: DispatchUncheckedUpdateManyWithoutImporterNestedInput
  }

  export type PurchaseOrderUpsertWithWhereUniqueWithoutVesselInput = {
    where: PurchaseOrderWhereUniqueInput
    update: XOR<PurchaseOrderUpdateWithoutVesselInput, PurchaseOrderUncheckedUpdateWithoutVesselInput>
    create: XOR<PurchaseOrderCreateWithoutVesselInput, PurchaseOrderUncheckedCreateWithoutVesselInput>
  }

  export type PurchaseOrderUpdateWithWhereUniqueWithoutVesselInput = {
    where: PurchaseOrderWhereUniqueInput
    data: XOR<PurchaseOrderUpdateWithoutVesselInput, PurchaseOrderUncheckedUpdateWithoutVesselInput>
  }

  export type PurchaseOrderUpdateManyWithWhereWithoutVesselInput = {
    where: PurchaseOrderScalarWhereInput
    data: XOR<PurchaseOrderUpdateManyMutationInput, PurchaseOrderUncheckedUpdateManyWithoutVesselInput>
  }

  export type DispatchUpsertWithWhereUniqueWithoutVesselInput = {
    where: DispatchWhereUniqueInput
    update: XOR<DispatchUpdateWithoutVesselInput, DispatchUncheckedUpdateWithoutVesselInput>
    create: XOR<DispatchCreateWithoutVesselInput, DispatchUncheckedCreateWithoutVesselInput>
  }

  export type DispatchUpdateWithWhereUniqueWithoutVesselInput = {
    where: DispatchWhereUniqueInput
    data: XOR<DispatchUpdateWithoutVesselInput, DispatchUncheckedUpdateWithoutVesselInput>
  }

  export type DispatchUpdateManyWithWhereWithoutVesselInput = {
    where: DispatchScalarWhereInput
    data: XOR<DispatchUpdateManyMutationInput, DispatchUncheckedUpdateManyWithoutVesselInput>
  }

  export type CustomerCreateWithoutOrdersInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dealBy?: StaffCreateNestedOneWithoutDealByCustomersInput
    approachForFunds?: StaffCreateNestedOneWithoutApproachForFundsCustomersInput
    vessels?: VesselCreateNestedManyWithoutImporterInput
    purchaseOrders?: PurchaseOrderCreateNestedManyWithoutImporterInput
    dispatches?: DispatchCreateNestedManyWithoutImporterInput
  }

  export type CustomerUncheckedCreateWithoutOrdersInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    dealById?: string | null
    approachForFundsId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    vessels?: VesselUncheckedCreateNestedManyWithoutImporterInput
    purchaseOrders?: PurchaseOrderUncheckedCreateNestedManyWithoutImporterInput
    dispatches?: DispatchUncheckedCreateNestedManyWithoutImporterInput
  }

  export type CustomerCreateOrConnectWithoutOrdersInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutOrdersInput, CustomerUncheckedCreateWithoutOrdersInput>
  }

  export type StaffCreateWithoutOrdersInput = {
    id?: string
    name: string
    role?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dealByCustomers?: CustomerCreateNestedManyWithoutDealByInput
    approachForFundsCustomers?: CustomerCreateNestedManyWithoutApproachForFundsInput
    purchaseOrders?: PurchaseOrderCreateNestedManyWithoutOrderByInput
  }

  export type StaffUncheckedCreateWithoutOrdersInput = {
    id?: string
    name: string
    role?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dealByCustomers?: CustomerUncheckedCreateNestedManyWithoutDealByInput
    approachForFundsCustomers?: CustomerUncheckedCreateNestedManyWithoutApproachForFundsInput
    purchaseOrders?: PurchaseOrderUncheckedCreateNestedManyWithoutOrderByInput
  }

  export type StaffCreateOrConnectWithoutOrdersInput = {
    where: StaffWhereUniqueInput
    create: XOR<StaffCreateWithoutOrdersInput, StaffUncheckedCreateWithoutOrdersInput>
  }

  export type DispatchCreateWithoutOrderInput = {
    id?: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    purchaseOrder: PurchaseOrderCreateNestedOneWithoutDispatchesInput
    vessel: VesselCreateNestedOneWithoutDispatchesInput
    transporter?: TransporterCreateNestedOneWithoutDispatchesInput
    importer?: CustomerCreateNestedOneWithoutDispatchesInput
  }

  export type DispatchUncheckedCreateWithoutOrderInput = {
    id?: string
    purchasePoNumber: string
    vesselId: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    transporterId?: string | null
    importerId?: string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DispatchCreateOrConnectWithoutOrderInput = {
    where: DispatchWhereUniqueInput
    create: XOR<DispatchCreateWithoutOrderInput, DispatchUncheckedCreateWithoutOrderInput>
  }

  export type DispatchCreateManyOrderInputEnvelope = {
    data: DispatchCreateManyOrderInput | DispatchCreateManyOrderInput[]
    skipDuplicates?: boolean
  }

  export type CustomerUpsertWithoutOrdersInput = {
    update: XOR<CustomerUpdateWithoutOrdersInput, CustomerUncheckedUpdateWithoutOrdersInput>
    create: XOR<CustomerCreateWithoutOrdersInput, CustomerUncheckedCreateWithoutOrdersInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutOrdersInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutOrdersInput, CustomerUncheckedUpdateWithoutOrdersInput>
  }

  export type CustomerUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dealBy?: StaffUpdateOneWithoutDealByCustomersNestedInput
    approachForFunds?: StaffUpdateOneWithoutApproachForFundsCustomersNestedInput
    vessels?: VesselUpdateManyWithoutImporterNestedInput
    purchaseOrders?: PurchaseOrderUpdateManyWithoutImporterNestedInput
    dispatches?: DispatchUpdateManyWithoutImporterNestedInput
  }

  export type CustomerUncheckedUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    dealById?: NullableStringFieldUpdateOperationsInput | string | null
    approachForFundsId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vessels?: VesselUncheckedUpdateManyWithoutImporterNestedInput
    purchaseOrders?: PurchaseOrderUncheckedUpdateManyWithoutImporterNestedInput
    dispatches?: DispatchUncheckedUpdateManyWithoutImporterNestedInput
  }

  export type StaffUpsertWithoutOrdersInput = {
    update: XOR<StaffUpdateWithoutOrdersInput, StaffUncheckedUpdateWithoutOrdersInput>
    create: XOR<StaffCreateWithoutOrdersInput, StaffUncheckedCreateWithoutOrdersInput>
    where?: StaffWhereInput
  }

  export type StaffUpdateToOneWithWhereWithoutOrdersInput = {
    where?: StaffWhereInput
    data: XOR<StaffUpdateWithoutOrdersInput, StaffUncheckedUpdateWithoutOrdersInput>
  }

  export type StaffUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dealByCustomers?: CustomerUpdateManyWithoutDealByNestedInput
    approachForFundsCustomers?: CustomerUpdateManyWithoutApproachForFundsNestedInput
    purchaseOrders?: PurchaseOrderUpdateManyWithoutOrderByNestedInput
  }

  export type StaffUncheckedUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dealByCustomers?: CustomerUncheckedUpdateManyWithoutDealByNestedInput
    approachForFundsCustomers?: CustomerUncheckedUpdateManyWithoutApproachForFundsNestedInput
    purchaseOrders?: PurchaseOrderUncheckedUpdateManyWithoutOrderByNestedInput
  }

  export type DispatchUpsertWithWhereUniqueWithoutOrderInput = {
    where: DispatchWhereUniqueInput
    update: XOR<DispatchUpdateWithoutOrderInput, DispatchUncheckedUpdateWithoutOrderInput>
    create: XOR<DispatchCreateWithoutOrderInput, DispatchUncheckedCreateWithoutOrderInput>
  }

  export type DispatchUpdateWithWhereUniqueWithoutOrderInput = {
    where: DispatchWhereUniqueInput
    data: XOR<DispatchUpdateWithoutOrderInput, DispatchUncheckedUpdateWithoutOrderInput>
  }

  export type DispatchUpdateManyWithWhereWithoutOrderInput = {
    where: DispatchScalarWhereInput
    data: XOR<DispatchUpdateManyMutationInput, DispatchUncheckedUpdateManyWithoutOrderInput>
  }

  export type CustomerCreateWithoutPurchaseOrdersInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dealBy?: StaffCreateNestedOneWithoutDealByCustomersInput
    approachForFunds?: StaffCreateNestedOneWithoutApproachForFundsCustomersInput
    vessels?: VesselCreateNestedManyWithoutImporterInput
    orders?: OrderCreateNestedManyWithoutCustomerInput
    dispatches?: DispatchCreateNestedManyWithoutImporterInput
  }

  export type CustomerUncheckedCreateWithoutPurchaseOrdersInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    dealById?: string | null
    approachForFundsId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    vessels?: VesselUncheckedCreateNestedManyWithoutImporterInput
    orders?: OrderUncheckedCreateNestedManyWithoutCustomerInput
    dispatches?: DispatchUncheckedCreateNestedManyWithoutImporterInput
  }

  export type CustomerCreateOrConnectWithoutPurchaseOrdersInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutPurchaseOrdersInput, CustomerUncheckedCreateWithoutPurchaseOrdersInput>
  }

  export type VesselCreateWithoutPurchaseOrdersInput = {
    id?: string
    vesselName: string
    quality?: string | null
    quantity: Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    importer: CustomerCreateNestedOneWithoutVesselsInput
    dispatches?: DispatchCreateNestedManyWithoutVesselInput
  }

  export type VesselUncheckedCreateWithoutPurchaseOrdersInput = {
    id?: string
    vesselName: string
    importerId: string
    quality?: string | null
    quantity: Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    dispatches?: DispatchUncheckedCreateNestedManyWithoutVesselInput
  }

  export type VesselCreateOrConnectWithoutPurchaseOrdersInput = {
    where: VesselWhereUniqueInput
    create: XOR<VesselCreateWithoutPurchaseOrdersInput, VesselUncheckedCreateWithoutPurchaseOrdersInput>
  }

  export type StaffCreateWithoutPurchaseOrdersInput = {
    id?: string
    name: string
    role?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dealByCustomers?: CustomerCreateNestedManyWithoutDealByInput
    approachForFundsCustomers?: CustomerCreateNestedManyWithoutApproachForFundsInput
    orders?: OrderCreateNestedManyWithoutOrderByInput
  }

  export type StaffUncheckedCreateWithoutPurchaseOrdersInput = {
    id?: string
    name: string
    role?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dealByCustomers?: CustomerUncheckedCreateNestedManyWithoutDealByInput
    approachForFundsCustomers?: CustomerUncheckedCreateNestedManyWithoutApproachForFundsInput
    orders?: OrderUncheckedCreateNestedManyWithoutOrderByInput
  }

  export type StaffCreateOrConnectWithoutPurchaseOrdersInput = {
    where: StaffWhereUniqueInput
    create: XOR<StaffCreateWithoutPurchaseOrdersInput, StaffUncheckedCreateWithoutPurchaseOrdersInput>
  }

  export type DispatchCreateWithoutPurchaseOrderInput = {
    id?: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutDispatchesInput
    vessel: VesselCreateNestedOneWithoutDispatchesInput
    transporter?: TransporterCreateNestedOneWithoutDispatchesInput
    importer?: CustomerCreateNestedOneWithoutDispatchesInput
  }

  export type DispatchUncheckedCreateWithoutPurchaseOrderInput = {
    id?: string
    poNumber: string
    vesselId: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    transporterId?: string | null
    importerId?: string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DispatchCreateOrConnectWithoutPurchaseOrderInput = {
    where: DispatchWhereUniqueInput
    create: XOR<DispatchCreateWithoutPurchaseOrderInput, DispatchUncheckedCreateWithoutPurchaseOrderInput>
  }

  export type DispatchCreateManyPurchaseOrderInputEnvelope = {
    data: DispatchCreateManyPurchaseOrderInput | DispatchCreateManyPurchaseOrderInput[]
    skipDuplicates?: boolean
  }

  export type CustomerUpsertWithoutPurchaseOrdersInput = {
    update: XOR<CustomerUpdateWithoutPurchaseOrdersInput, CustomerUncheckedUpdateWithoutPurchaseOrdersInput>
    create: XOR<CustomerCreateWithoutPurchaseOrdersInput, CustomerUncheckedCreateWithoutPurchaseOrdersInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutPurchaseOrdersInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutPurchaseOrdersInput, CustomerUncheckedUpdateWithoutPurchaseOrdersInput>
  }

  export type CustomerUpdateWithoutPurchaseOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dealBy?: StaffUpdateOneWithoutDealByCustomersNestedInput
    approachForFunds?: StaffUpdateOneWithoutApproachForFundsCustomersNestedInput
    vessels?: VesselUpdateManyWithoutImporterNestedInput
    orders?: OrderUpdateManyWithoutCustomerNestedInput
    dispatches?: DispatchUpdateManyWithoutImporterNestedInput
  }

  export type CustomerUncheckedUpdateWithoutPurchaseOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    dealById?: NullableStringFieldUpdateOperationsInput | string | null
    approachForFundsId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vessels?: VesselUncheckedUpdateManyWithoutImporterNestedInput
    orders?: OrderUncheckedUpdateManyWithoutCustomerNestedInput
    dispatches?: DispatchUncheckedUpdateManyWithoutImporterNestedInput
  }

  export type VesselUpsertWithoutPurchaseOrdersInput = {
    update: XOR<VesselUpdateWithoutPurchaseOrdersInput, VesselUncheckedUpdateWithoutPurchaseOrdersInput>
    create: XOR<VesselCreateWithoutPurchaseOrdersInput, VesselUncheckedCreateWithoutPurchaseOrdersInput>
    where?: VesselWhereInput
  }

  export type VesselUpdateToOneWithWhereWithoutPurchaseOrdersInput = {
    where?: VesselWhereInput
    data: XOR<VesselUpdateWithoutPurchaseOrdersInput, VesselUncheckedUpdateWithoutPurchaseOrdersInput>
  }

  export type VesselUpdateWithoutPurchaseOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    vesselName?: StringFieldUpdateOperationsInput | string
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    importer?: CustomerUpdateOneRequiredWithoutVesselsNestedInput
    dispatches?: DispatchUpdateManyWithoutVesselNestedInput
  }

  export type VesselUncheckedUpdateWithoutPurchaseOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    vesselName?: StringFieldUpdateOperationsInput | string
    importerId?: StringFieldUpdateOperationsInput | string
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatches?: DispatchUncheckedUpdateManyWithoutVesselNestedInput
  }

  export type StaffUpsertWithoutPurchaseOrdersInput = {
    update: XOR<StaffUpdateWithoutPurchaseOrdersInput, StaffUncheckedUpdateWithoutPurchaseOrdersInput>
    create: XOR<StaffCreateWithoutPurchaseOrdersInput, StaffUncheckedCreateWithoutPurchaseOrdersInput>
    where?: StaffWhereInput
  }

  export type StaffUpdateToOneWithWhereWithoutPurchaseOrdersInput = {
    where?: StaffWhereInput
    data: XOR<StaffUpdateWithoutPurchaseOrdersInput, StaffUncheckedUpdateWithoutPurchaseOrdersInput>
  }

  export type StaffUpdateWithoutPurchaseOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dealByCustomers?: CustomerUpdateManyWithoutDealByNestedInput
    approachForFundsCustomers?: CustomerUpdateManyWithoutApproachForFundsNestedInput
    orders?: OrderUpdateManyWithoutOrderByNestedInput
  }

  export type StaffUncheckedUpdateWithoutPurchaseOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dealByCustomers?: CustomerUncheckedUpdateManyWithoutDealByNestedInput
    approachForFundsCustomers?: CustomerUncheckedUpdateManyWithoutApproachForFundsNestedInput
    orders?: OrderUncheckedUpdateManyWithoutOrderByNestedInput
  }

  export type DispatchUpsertWithWhereUniqueWithoutPurchaseOrderInput = {
    where: DispatchWhereUniqueInput
    update: XOR<DispatchUpdateWithoutPurchaseOrderInput, DispatchUncheckedUpdateWithoutPurchaseOrderInput>
    create: XOR<DispatchCreateWithoutPurchaseOrderInput, DispatchUncheckedCreateWithoutPurchaseOrderInput>
  }

  export type DispatchUpdateWithWhereUniqueWithoutPurchaseOrderInput = {
    where: DispatchWhereUniqueInput
    data: XOR<DispatchUpdateWithoutPurchaseOrderInput, DispatchUncheckedUpdateWithoutPurchaseOrderInput>
  }

  export type DispatchUpdateManyWithWhereWithoutPurchaseOrderInput = {
    where: DispatchScalarWhereInput
    data: XOR<DispatchUpdateManyMutationInput, DispatchUncheckedUpdateManyWithoutPurchaseOrderInput>
  }

  export type OrderCreateWithoutDispatchesInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    orderDate?: Date | string | null
    area?: string | null
    creditDays?: number | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    customer: CustomerCreateNestedOneWithoutOrdersInput
    orderBy?: StaffCreateNestedOneWithoutOrdersInput
  }

  export type OrderUncheckedCreateWithoutDispatchesInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    customerId: string
    orderDate?: Date | string | null
    area?: string | null
    creditDays?: number | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    orderById?: string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderCreateOrConnectWithoutDispatchesInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutDispatchesInput, OrderUncheckedCreateWithoutDispatchesInput>
  }

  export type PurchaseOrderCreateWithoutDispatchesInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    orderDate?: Date | string | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    importer: CustomerCreateNestedOneWithoutPurchaseOrdersInput
    vessel: VesselCreateNestedOneWithoutPurchaseOrdersInput
    orderBy?: StaffCreateNestedOneWithoutPurchaseOrdersInput
  }

  export type PurchaseOrderUncheckedCreateWithoutDispatchesInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    importerId: string
    vesselId: string
    orderDate?: Date | string | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    orderById?: string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseOrderCreateOrConnectWithoutDispatchesInput = {
    where: PurchaseOrderWhereUniqueInput
    create: XOR<PurchaseOrderCreateWithoutDispatchesInput, PurchaseOrderUncheckedCreateWithoutDispatchesInput>
  }

  export type VesselCreateWithoutDispatchesInput = {
    id?: string
    vesselName: string
    quality?: string | null
    quantity: Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    importer: CustomerCreateNestedOneWithoutVesselsInput
    purchaseOrders?: PurchaseOrderCreateNestedManyWithoutVesselInput
  }

  export type VesselUncheckedCreateWithoutDispatchesInput = {
    id?: string
    vesselName: string
    importerId: string
    quality?: string | null
    quantity: Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    purchaseOrders?: PurchaseOrderUncheckedCreateNestedManyWithoutVesselInput
  }

  export type VesselCreateOrConnectWithoutDispatchesInput = {
    where: VesselWhereUniqueInput
    create: XOR<VesselCreateWithoutDispatchesInput, VesselUncheckedCreateWithoutDispatchesInput>
  }

  export type TransporterCreateWithoutDispatchesInput = {
    id?: string
    name: string
    area?: string | null
    contactPersonName?: string | null
    contactNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TransporterUncheckedCreateWithoutDispatchesInput = {
    id?: string
    name: string
    area?: string | null
    contactPersonName?: string | null
    contactNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TransporterCreateOrConnectWithoutDispatchesInput = {
    where: TransporterWhereUniqueInput
    create: XOR<TransporterCreateWithoutDispatchesInput, TransporterUncheckedCreateWithoutDispatchesInput>
  }

  export type CustomerCreateWithoutDispatchesInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dealBy?: StaffCreateNestedOneWithoutDealByCustomersInput
    approachForFunds?: StaffCreateNestedOneWithoutApproachForFundsCustomersInput
    vessels?: VesselCreateNestedManyWithoutImporterInput
    orders?: OrderCreateNestedManyWithoutCustomerInput
    purchaseOrders?: PurchaseOrderCreateNestedManyWithoutImporterInput
  }

  export type CustomerUncheckedCreateWithoutDispatchesInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    dealById?: string | null
    approachForFundsId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    vessels?: VesselUncheckedCreateNestedManyWithoutImporterInput
    orders?: OrderUncheckedCreateNestedManyWithoutCustomerInput
    purchaseOrders?: PurchaseOrderUncheckedCreateNestedManyWithoutImporterInput
  }

  export type CustomerCreateOrConnectWithoutDispatchesInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutDispatchesInput, CustomerUncheckedCreateWithoutDispatchesInput>
  }

  export type OrderUpsertWithoutDispatchesInput = {
    update: XOR<OrderUpdateWithoutDispatchesInput, OrderUncheckedUpdateWithoutDispatchesInput>
    create: XOR<OrderCreateWithoutDispatchesInput, OrderUncheckedCreateWithoutDispatchesInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutDispatchesInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutDispatchesInput, OrderUncheckedUpdateWithoutDispatchesInput>
  }

  export type OrderUpdateWithoutDispatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    creditDays?: NullableIntFieldUpdateOperationsInput | number | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutOrdersNestedInput
    orderBy?: StaffUpdateOneWithoutOrdersNestedInput
  }

  export type OrderUncheckedUpdateWithoutDispatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    customerId?: StringFieldUpdateOperationsInput | string
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    creditDays?: NullableIntFieldUpdateOperationsInput | number | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    orderById?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseOrderUpsertWithoutDispatchesInput = {
    update: XOR<PurchaseOrderUpdateWithoutDispatchesInput, PurchaseOrderUncheckedUpdateWithoutDispatchesInput>
    create: XOR<PurchaseOrderCreateWithoutDispatchesInput, PurchaseOrderUncheckedCreateWithoutDispatchesInput>
    where?: PurchaseOrderWhereInput
  }

  export type PurchaseOrderUpdateToOneWithWhereWithoutDispatchesInput = {
    where?: PurchaseOrderWhereInput
    data: XOR<PurchaseOrderUpdateWithoutDispatchesInput, PurchaseOrderUncheckedUpdateWithoutDispatchesInput>
  }

  export type PurchaseOrderUpdateWithoutDispatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    importer?: CustomerUpdateOneRequiredWithoutPurchaseOrdersNestedInput
    vessel?: VesselUpdateOneRequiredWithoutPurchaseOrdersNestedInput
    orderBy?: StaffUpdateOneWithoutPurchaseOrdersNestedInput
  }

  export type PurchaseOrderUncheckedUpdateWithoutDispatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    importerId?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    orderById?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VesselUpsertWithoutDispatchesInput = {
    update: XOR<VesselUpdateWithoutDispatchesInput, VesselUncheckedUpdateWithoutDispatchesInput>
    create: XOR<VesselCreateWithoutDispatchesInput, VesselUncheckedCreateWithoutDispatchesInput>
    where?: VesselWhereInput
  }

  export type VesselUpdateToOneWithWhereWithoutDispatchesInput = {
    where?: VesselWhereInput
    data: XOR<VesselUpdateWithoutDispatchesInput, VesselUncheckedUpdateWithoutDispatchesInput>
  }

  export type VesselUpdateWithoutDispatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    vesselName?: StringFieldUpdateOperationsInput | string
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    importer?: CustomerUpdateOneRequiredWithoutVesselsNestedInput
    purchaseOrders?: PurchaseOrderUpdateManyWithoutVesselNestedInput
  }

  export type VesselUncheckedUpdateWithoutDispatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    vesselName?: StringFieldUpdateOperationsInput | string
    importerId?: StringFieldUpdateOperationsInput | string
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    purchaseOrders?: PurchaseOrderUncheckedUpdateManyWithoutVesselNestedInput
  }

  export type TransporterUpsertWithoutDispatchesInput = {
    update: XOR<TransporterUpdateWithoutDispatchesInput, TransporterUncheckedUpdateWithoutDispatchesInput>
    create: XOR<TransporterCreateWithoutDispatchesInput, TransporterUncheckedCreateWithoutDispatchesInput>
    where?: TransporterWhereInput
  }

  export type TransporterUpdateToOneWithWhereWithoutDispatchesInput = {
    where?: TransporterWhereInput
    data: XOR<TransporterUpdateWithoutDispatchesInput, TransporterUncheckedUpdateWithoutDispatchesInput>
  }

  export type TransporterUpdateWithoutDispatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    area?: NullableStringFieldUpdateOperationsInput | string | null
    contactPersonName?: NullableStringFieldUpdateOperationsInput | string | null
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransporterUncheckedUpdateWithoutDispatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    area?: NullableStringFieldUpdateOperationsInput | string | null
    contactPersonName?: NullableStringFieldUpdateOperationsInput | string | null
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerUpsertWithoutDispatchesInput = {
    update: XOR<CustomerUpdateWithoutDispatchesInput, CustomerUncheckedUpdateWithoutDispatchesInput>
    create: XOR<CustomerCreateWithoutDispatchesInput, CustomerUncheckedCreateWithoutDispatchesInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutDispatchesInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutDispatchesInput, CustomerUncheckedUpdateWithoutDispatchesInput>
  }

  export type CustomerUpdateWithoutDispatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dealBy?: StaffUpdateOneWithoutDealByCustomersNestedInput
    approachForFunds?: StaffUpdateOneWithoutApproachForFundsCustomersNestedInput
    vessels?: VesselUpdateManyWithoutImporterNestedInput
    orders?: OrderUpdateManyWithoutCustomerNestedInput
    purchaseOrders?: PurchaseOrderUpdateManyWithoutImporterNestedInput
  }

  export type CustomerUncheckedUpdateWithoutDispatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    dealById?: NullableStringFieldUpdateOperationsInput | string | null
    approachForFundsId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vessels?: VesselUncheckedUpdateManyWithoutImporterNestedInput
    orders?: OrderUncheckedUpdateManyWithoutCustomerNestedInput
    purchaseOrders?: PurchaseOrderUncheckedUpdateManyWithoutImporterNestedInput
  }

  export type CustomerCreateManyDealByInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    approachForFundsId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomerCreateManyApproachForFundsInput = {
    id?: string
    name: string
    category: $Enums.CustomerCategory
    contactNumber?: string | null
    pocName?: string | null
    area?: string | null
    industrySector?: string | null
    dealById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderCreateManyOrderByInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    customerId: string
    orderDate?: Date | string | null
    area?: string | null
    creditDays?: number | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseOrderCreateManyOrderByInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    importerId: string
    vesselId: string
    orderDate?: Date | string | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomerUpdateWithoutDealByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    approachForFunds?: StaffUpdateOneWithoutApproachForFundsCustomersNestedInput
    vessels?: VesselUpdateManyWithoutImporterNestedInput
    orders?: OrderUpdateManyWithoutCustomerNestedInput
    purchaseOrders?: PurchaseOrderUpdateManyWithoutImporterNestedInput
    dispatches?: DispatchUpdateManyWithoutImporterNestedInput
  }

  export type CustomerUncheckedUpdateWithoutDealByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    approachForFundsId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vessels?: VesselUncheckedUpdateManyWithoutImporterNestedInput
    orders?: OrderUncheckedUpdateManyWithoutCustomerNestedInput
    purchaseOrders?: PurchaseOrderUncheckedUpdateManyWithoutImporterNestedInput
    dispatches?: DispatchUncheckedUpdateManyWithoutImporterNestedInput
  }

  export type CustomerUncheckedUpdateManyWithoutDealByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    approachForFundsId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerUpdateWithoutApproachForFundsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dealBy?: StaffUpdateOneWithoutDealByCustomersNestedInput
    vessels?: VesselUpdateManyWithoutImporterNestedInput
    orders?: OrderUpdateManyWithoutCustomerNestedInput
    purchaseOrders?: PurchaseOrderUpdateManyWithoutImporterNestedInput
    dispatches?: DispatchUpdateManyWithoutImporterNestedInput
  }

  export type CustomerUncheckedUpdateWithoutApproachForFundsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    dealById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vessels?: VesselUncheckedUpdateManyWithoutImporterNestedInput
    orders?: OrderUncheckedUpdateManyWithoutCustomerNestedInput
    purchaseOrders?: PurchaseOrderUncheckedUpdateManyWithoutImporterNestedInput
    dispatches?: DispatchUncheckedUpdateManyWithoutImporterNestedInput
  }

  export type CustomerUncheckedUpdateManyWithoutApproachForFundsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCustomerCategoryFieldUpdateOperationsInput | $Enums.CustomerCategory
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    pocName?: NullableStringFieldUpdateOperationsInput | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    industrySector?: NullableStringFieldUpdateOperationsInput | string | null
    dealById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUpdateWithoutOrderByInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    creditDays?: NullableIntFieldUpdateOperationsInput | number | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutOrdersNestedInput
    dispatches?: DispatchUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutOrderByInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    customerId?: StringFieldUpdateOperationsInput | string
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    creditDays?: NullableIntFieldUpdateOperationsInput | number | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatches?: DispatchUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateManyWithoutOrderByInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    customerId?: StringFieldUpdateOperationsInput | string
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    creditDays?: NullableIntFieldUpdateOperationsInput | number | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseOrderUpdateWithoutOrderByInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    importer?: CustomerUpdateOneRequiredWithoutPurchaseOrdersNestedInput
    vessel?: VesselUpdateOneRequiredWithoutPurchaseOrdersNestedInput
    dispatches?: DispatchUpdateManyWithoutPurchaseOrderNestedInput
  }

  export type PurchaseOrderUncheckedUpdateWithoutOrderByInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    importerId?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatches?: DispatchUncheckedUpdateManyWithoutPurchaseOrderNestedInput
  }

  export type PurchaseOrderUncheckedUpdateManyWithoutOrderByInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    importerId?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispatchCreateManyTransporterInput = {
    id?: string
    poNumber: string
    purchasePoNumber: string
    vesselId: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    importerId?: string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DispatchUpdateWithoutTransporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutDispatchesNestedInput
    purchaseOrder?: PurchaseOrderUpdateOneRequiredWithoutDispatchesNestedInput
    vessel?: VesselUpdateOneRequiredWithoutDispatchesNestedInput
    importer?: CustomerUpdateOneWithoutDispatchesNestedInput
  }

  export type DispatchUncheckedUpdateWithoutTransporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    purchasePoNumber?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    importerId?: NullableStringFieldUpdateOperationsInput | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispatchUncheckedUpdateManyWithoutTransporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    purchasePoNumber?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    importerId?: NullableStringFieldUpdateOperationsInput | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VesselCreateManyImporterInput = {
    id?: string
    vesselName: string
    quality?: string | null
    quantity: Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderCreateManyCustomerInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    orderDate?: Date | string | null
    area?: string | null
    creditDays?: number | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    orderById?: string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseOrderCreateManyImporterInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    vesselId: string
    orderDate?: Date | string | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    orderById?: string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DispatchCreateManyImporterInput = {
    id?: string
    poNumber: string
    purchasePoNumber: string
    vesselId: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    transporterId?: string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VesselUpdateWithoutImporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    vesselName?: StringFieldUpdateOperationsInput | string
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    purchaseOrders?: PurchaseOrderUpdateManyWithoutVesselNestedInput
    dispatches?: DispatchUpdateManyWithoutVesselNestedInput
  }

  export type VesselUncheckedUpdateWithoutImporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    vesselName?: StringFieldUpdateOperationsInput | string
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    purchaseOrders?: PurchaseOrderUncheckedUpdateManyWithoutVesselNestedInput
    dispatches?: DispatchUncheckedUpdateManyWithoutVesselNestedInput
  }

  export type VesselUncheckedUpdateManyWithoutImporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    vesselName?: StringFieldUpdateOperationsInput | string
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUpdateWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    creditDays?: NullableIntFieldUpdateOperationsInput | number | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderBy?: StaffUpdateOneWithoutOrdersNestedInput
    dispatches?: DispatchUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    creditDays?: NullableIntFieldUpdateOperationsInput | number | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    orderById?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatches?: DispatchUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateManyWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    area?: NullableStringFieldUpdateOperationsInput | string | null
    creditDays?: NullableIntFieldUpdateOperationsInput | number | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    orderById?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseOrderUpdateWithoutImporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vessel?: VesselUpdateOneRequiredWithoutPurchaseOrdersNestedInput
    orderBy?: StaffUpdateOneWithoutPurchaseOrdersNestedInput
    dispatches?: DispatchUpdateManyWithoutPurchaseOrderNestedInput
  }

  export type PurchaseOrderUncheckedUpdateWithoutImporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    vesselId?: StringFieldUpdateOperationsInput | string
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    orderById?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatches?: DispatchUncheckedUpdateManyWithoutPurchaseOrderNestedInput
  }

  export type PurchaseOrderUncheckedUpdateManyWithoutImporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    vesselId?: StringFieldUpdateOperationsInput | string
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    orderById?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispatchUpdateWithoutImporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutDispatchesNestedInput
    purchaseOrder?: PurchaseOrderUpdateOneRequiredWithoutDispatchesNestedInput
    vessel?: VesselUpdateOneRequiredWithoutDispatchesNestedInput
    transporter?: TransporterUpdateOneWithoutDispatchesNestedInput
  }

  export type DispatchUncheckedUpdateWithoutImporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    purchasePoNumber?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    transporterId?: NullableStringFieldUpdateOperationsInput | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispatchUncheckedUpdateManyWithoutImporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    purchasePoNumber?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    transporterId?: NullableStringFieldUpdateOperationsInput | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseOrderCreateManyVesselInput = {
    id?: string
    poNumber: string
    orderType?: $Enums.OrderType
    importerId: string
    orderDate?: Date | string | null
    quality?: string | null
    rate?: Decimal | DecimalJsLike | number | string | null
    quantity?: Decimal | DecimalJsLike | number | string | null
    orderById?: string | null
    dispatchedOrder?: Decimal | DecimalJsLike | number | string
    orderStatus?: $Enums.OrderStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DispatchCreateManyVesselInput = {
    id?: string
    poNumber: string
    purchasePoNumber: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    transporterId?: string | null
    importerId?: string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseOrderUpdateWithoutVesselInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    importer?: CustomerUpdateOneRequiredWithoutPurchaseOrdersNestedInput
    orderBy?: StaffUpdateOneWithoutPurchaseOrdersNestedInput
    dispatches?: DispatchUpdateManyWithoutPurchaseOrderNestedInput
  }

  export type PurchaseOrderUncheckedUpdateWithoutVesselInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    importerId?: StringFieldUpdateOperationsInput | string
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    orderById?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatches?: DispatchUncheckedUpdateManyWithoutPurchaseOrderNestedInput
  }

  export type PurchaseOrderUncheckedUpdateManyWithoutVesselInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    orderType?: EnumOrderTypeFieldUpdateOperationsInput | $Enums.OrderType
    importerId?: StringFieldUpdateOperationsInput | string
    orderDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    quality?: NullableStringFieldUpdateOperationsInput | string | null
    rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    orderById?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchedOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderStatus?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispatchUpdateWithoutVesselInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutDispatchesNestedInput
    purchaseOrder?: PurchaseOrderUpdateOneRequiredWithoutDispatchesNestedInput
    transporter?: TransporterUpdateOneWithoutDispatchesNestedInput
    importer?: CustomerUpdateOneWithoutDispatchesNestedInput
  }

  export type DispatchUncheckedUpdateWithoutVesselInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    purchasePoNumber?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    transporterId?: NullableStringFieldUpdateOperationsInput | string | null
    importerId?: NullableStringFieldUpdateOperationsInput | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispatchUncheckedUpdateManyWithoutVesselInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    purchasePoNumber?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    transporterId?: NullableStringFieldUpdateOperationsInput | string | null
    importerId?: NullableStringFieldUpdateOperationsInput | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispatchCreateManyOrderInput = {
    id?: string
    purchasePoNumber: string
    vesselId: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    transporterId?: string | null
    importerId?: string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DispatchUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    purchaseOrder?: PurchaseOrderUpdateOneRequiredWithoutDispatchesNestedInput
    vessel?: VesselUpdateOneRequiredWithoutDispatchesNestedInput
    transporter?: TransporterUpdateOneWithoutDispatchesNestedInput
    importer?: CustomerUpdateOneWithoutDispatchesNestedInput
  }

  export type DispatchUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    purchasePoNumber?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    transporterId?: NullableStringFieldUpdateOperationsInput | string | null
    importerId?: NullableStringFieldUpdateOperationsInput | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispatchUncheckedUpdateManyWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    purchasePoNumber?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    transporterId?: NullableStringFieldUpdateOperationsInput | string | null
    importerId?: NullableStringFieldUpdateOperationsInput | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispatchCreateManyPurchaseOrderInput = {
    id?: string
    poNumber: string
    vesselId: string
    dispatchDate: Date | string
    dispatchedQuantity: Decimal | DecimalJsLike | number | string
    lorryNumber?: string | null
    dispatchTerms?: $Enums.DispatchTerms
    freight?: Decimal | DecimalJsLike | number | string | null
    transporterId?: string | null
    importerId?: string | null
    receivingQuantity?: Decimal | DecimalJsLike | number | string | null
    receiptDate?: Date | string | null
    receiptStatus?: $Enums.ReceiptStatus
    softCopyStatus?: boolean
    entryInTally?: boolean
    saleInvoiceNumber?: string | null
    purchaseInvoiceNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DispatchUpdateWithoutPurchaseOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutDispatchesNestedInput
    vessel?: VesselUpdateOneRequiredWithoutDispatchesNestedInput
    transporter?: TransporterUpdateOneWithoutDispatchesNestedInput
    importer?: CustomerUpdateOneWithoutDispatchesNestedInput
  }

  export type DispatchUncheckedUpdateWithoutPurchaseOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    transporterId?: NullableStringFieldUpdateOperationsInput | string | null
    importerId?: NullableStringFieldUpdateOperationsInput | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispatchUncheckedUpdateManyWithoutPurchaseOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    vesselId?: StringFieldUpdateOperationsInput | string
    dispatchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dispatchedQuantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    lorryNumber?: NullableStringFieldUpdateOperationsInput | string | null
    dispatchTerms?: EnumDispatchTermsFieldUpdateOperationsInput | $Enums.DispatchTerms
    freight?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    transporterId?: NullableStringFieldUpdateOperationsInput | string | null
    importerId?: NullableStringFieldUpdateOperationsInput | string | null
    receivingQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    receiptDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiptStatus?: EnumReceiptStatusFieldUpdateOperationsInput | $Enums.ReceiptStatus
    softCopyStatus?: BoolFieldUpdateOperationsInput | boolean
    entryInTally?: BoolFieldUpdateOperationsInput | boolean
    saleInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    purchaseInvoiceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use StaffCountOutputTypeDefaultArgs instead
     */
    export type StaffCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StaffCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TransporterCountOutputTypeDefaultArgs instead
     */
    export type TransporterCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TransporterCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CustomerCountOutputTypeDefaultArgs instead
     */
    export type CustomerCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CustomerCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use VesselCountOutputTypeDefaultArgs instead
     */
    export type VesselCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = VesselCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OrderCountOutputTypeDefaultArgs instead
     */
    export type OrderCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrderCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PurchaseOrderCountOutputTypeDefaultArgs instead
     */
    export type PurchaseOrderCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PurchaseOrderCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use StaffDefaultArgs instead
     */
    export type StaffArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StaffDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TransporterDefaultArgs instead
     */
    export type TransporterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TransporterDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CustomerDefaultArgs instead
     */
    export type CustomerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CustomerDefaultArgs<ExtArgs>
    /**
     * @deprecated Use VesselDefaultArgs instead
     */
    export type VesselArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = VesselDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OrderDefaultArgs instead
     */
    export type OrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrderDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PurchaseOrderDefaultArgs instead
     */
    export type PurchaseOrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PurchaseOrderDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DispatchDefaultArgs instead
     */
    export type DispatchArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DispatchDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}