import type { ResultSetHeader, FieldPacket } from "mysql2";

export interface SeederOptions {
  customers?: number;
  addresses?: number;
  warehouses?: number;
  suppliers?: number;
  paymentMethods?: number;
  categories?: number;
  products?: number;
  productVariants?: number;
  productCategories?: number;
  inventory?: number;
  InventoryMovements?: number;
  purchaseOrdersToSuppliers?: number;
  purchaseOrderItems?: number;
  shoppingBags?: number;
  shoppingBagItems?: number;
  orders?: number;
  orderItems?: number;
  pays?: number;
  receipts?: number;
  shipment?: number,
  shipmentItems?: number;
  purchaseHistory?: number;
  reviews?: number;
  coupons?: number;
}

export interface IRepoClass<T> {
  generateData: (amount: number, options?: SeederOptions) => Array<T>,
  insertData: (amount: number, options?: SeederOptions) => Promise<[ResultSetHeader, FieldPacket[]] | void>,
  generateCSV: (amount: number, options?: SeederOptions) => Promise<void>
}