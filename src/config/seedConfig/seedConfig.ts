export interface ISeed {
  name: string,
  customers: number,
  addresses: number,
  warehouses: number,
  suppliers: number,
  paymentMethods: number,
  categories: number,
  products: number,
  productVariants: number,
  productCategories: number,
  inventory: number,
  inventoryMovements: number
  purchaseOrdersToSuppliers: number,
  purchaseOrderItems: number,
  shoppingBags: number,
  shoppingBagItems: number,
  orders: number,
  orderItems: number,
  pays: number,
  receipts: number,
  shipment: number,
  shipmentItems: number,
  purchaseHistory: number,
  reviews: number,
  coupons: number,
}

export const standardSeedConfig: ISeed = {
  name: 'Max',
  customers: 1000,
  addresses: 1500,
  warehouses: 5,
  suppliers: 20,
  paymentMethods: 1000,
  categories: 15,
  products: 200,
  productVariants: 400,
  productCategories: 250,
  inventory: 1000,
  inventoryMovements: 1000,
  purchaseOrdersToSuppliers: 100,
  purchaseOrderItems: 300,
  shoppingBags: 800,
  shoppingBagItems: 1600,
  orders: 5000,
  orderItems: 7500,
  pays: 5000,
  receipts: 5000,
  shipment:5000,
  shipmentItems: 7500,
  purchaseHistory: 5000,
  reviews: 1500,
  coupons: 50
  };

    
export const minimalSeedConfig: ISeed = {
  name: 'Min',
  customers: 10,
  addresses: 15,
  warehouses: 1,
  suppliers: 2,
  paymentMethods: 10,
  categories: 2,
  products: 5,
  productVariants: 10,
  productCategories: 10,
  inventory: 10,
  inventoryMovements: 10,
  purchaseOrdersToSuppliers: 2,
  purchaseOrderItems: 5,
  shoppingBags: 10,
  shoppingBagItems: 20,
  orders: 20,
  orderItems: 30,
  pays: 20,
  receipts: 20,
  shipment: 20,
  shipmentItems: 30,
  purchaseHistory: 20,
  reviews: 5,
  coupons: 2,
};


/*
  SELECT * FROM CUSTOMERS;
  SELECT * FROM ADDRESSES;
  SELECT * FROM WAREHOUSES;
  SELECT * FROM SUPPLIERS;
  SELECT * FROM PAYMENT_METHODS;
  SELECT * FROM PRODUCTS;
  SELECT * FROM PRODUCT_VARIANTS;
  SELECT * FROM CATEGORIES;
  SELECT * FROM PRODUCT_CATEGORIES;
  SELECT * FROM INVENTORY;
  SELECT * FROM INVENTORY_MOVEMENTS;
  SELECT * FROM PURCHASE_ORDERS_TO_SUPPLIERS;
  SELECT * FROM PURCHASE_ORDER_ITEMS;
  SELECT * FROM SHOPPING_BAG;
  SELECT * FROM SHOPPING_BAG_ITEMS;
  SELECT * FROM ORDERS;
  SELECT * FROM ORDER_ITEMS;
  SELECT * FROM PAY;
  SELECT * FROM RECEIPT;
  SELECT * FROM SHIPMENTS;
  SELECT * FROM SHIPMENT_ITEMS;
  SELECT * FROM PURCHASE_HISTORY;
  SELECT * FROM REVIEWS;
  SELECT * FROM COUPONS;
*/