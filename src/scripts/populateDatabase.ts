import {
  RepositoryCustomers,
  RepositoryAddresses,
  RepositoryWarehouses,
  RepositorySuppliers,
  RepositoryPaymentMethods,
  RepositoryCategories,
  RepositoryProducts,
  RepositoryProductVariants,
  RepositoryProductCategories,
  RepositoryInventory,
  RepositoryInventoryMovements,
  RepositoryPurchaseOrdersToSuppliers,
  RepositoryPurchaseOrderItems,
  RepositoryShoppingBag,
  RepositoryShoppingBagItems,
  RepositoryOrders,
  RepositoryOrderItems,
  RepositoryPay,
  RepositoryReceipt,
  RepositoryShipment,
  RepositoryShipmentItems,
  RepositoryPurchaseHistory,
  RepositoryReviews,
  RepositoryCoupons,
} from '../entities/index.ts';
import type { ISeed } from '../config/seedConfig/seedConfig.ts';

export async function populateDatabase(config: ISeed): Promise<void> {
  const s = config;
  try {
    await new RepositoryCustomers().insertData(s.customers);
    await new RepositoryAddresses().insertData(s.addresses, { customers: s.customers });
    await new RepositoryWarehouses().insertData(s.warehouses);
    await new RepositorySuppliers().insertData(s.suppliers);
    await new RepositoryPaymentMethods().insertData(s.paymentMethods);
    await new RepositoryCategories().insertData(s.categories);
    await new RepositoryProducts().insertData(s.products);
    await new RepositoryProductVariants().insertData(s.productVariants, { products: s.products });
    await new RepositoryProductCategories().insertData(s.productCategories, { products: s.products, categories: s.categories });
    await new RepositoryInventory().insertData(s.inventory, { productVariants: s.productVariants, warehouses: s.warehouses });
    await new RepositoryInventoryMovements().insertData(s.inventoryMovements, { productVariants: s.productVariants, warehouses: s.warehouses });
    await new RepositoryPurchaseOrdersToSuppliers().insertData(s.purchaseOrdersToSuppliers, { suppliers: s.suppliers });
    await new RepositoryPurchaseOrderItems().insertData(s.purchaseOrderItems, { purchaseOrdersToSuppliers: s.purchaseOrdersToSuppliers, productVariants: s.productVariants });
    await new RepositoryShoppingBag().insertData(s.shoppingBags, { customers: s.customers });
    await new RepositoryShoppingBagItems().insertData(s.shoppingBagItems, { shoppingBags: s.shoppingBags, productVariants: s.productVariants });
    await new RepositoryOrders().insertData(s.orders, { customers: s.customers, addresses: s.addresses, paymentMethods: s.paymentMethods });
    await new RepositoryOrderItems().insertData(s.orderItems, { orders: s.orders, productVariants: s.productVariants });
    await new RepositoryPay().insertData(s.pays, { orders: s.orders, paymentMethods: s.paymentMethods });
    await new RepositoryReceipt().insertData(s.receipts, { orders: s.orders, pays: s.pays });
    await new RepositoryShipment().insertData(s.shipment, { orders: s.orders, warehouses: s.warehouses });
    await new RepositoryShipmentItems().insertData(s.shipmentItems, {shipment: s.shipment, orderItems: s.orderItems});
    await new RepositoryPurchaseHistory().insertData(s.purchaseHistory, { orders: s.orders, customers: s.customers });
    await new RepositoryReviews().insertData(s.reviews, { customers: s.customers, productVariants: s.productVariants, products: s.products });
    await new RepositoryCoupons().insertData(s.coupons);

    console.log(`Base de datos poblada con la configuración "${s.name}"`);
  } catch (error) {
    console.error(`Error durante la insercción de los datos:`, error);
    throw error;
  }
}

/*
export async function populateDatabase(): Promise<void> {
  try {
    console.log(`Poblando tabla: CUSTOMERS (${standard.customers} registros)...`);
    await new RepositoryCustomers().insertData(standard.customers);
    console.log('CUSTOMERS insertados correctamente.');

    console.log(`Poblando tabla: ADDRESSES (${standard.addresses} registros)...`);
    await new RepositoryAddresses().insertData(standard.addresses, { customers: standard.customers });
    console.log('ADDRESSES insertados correctamente.');

    console.log(`Poblando tabla: WAREHOUSES (${standard.warehouses} registros)...`);
    await new RepositoryWarehouses().insertData(standard.warehouses);
    console.log('WAREHOUSES insertados correctamente.');

    console.log(`Poblando tabla: SUPPLIERS (${standard.suppliers} registros)...`);
    await new RepositorySuppliers().insertData(standard.suppliers);
    console.log('SUPPLIERS insertados correctamente.');

    console.log(`Poblando tabla: PAYMENT_METHODS (${standard.paymentMethods} registros)...`);
    await new RepositoryPaymentMethods().insertData(standard.paymentMethods);
    console.log('PAYMENT_METHODS insertados correctamente.');

    console.log(`Poblando tabla: CATEGORIES (${standard.categories} registros)...`);
    await new RepositoryCategories().insertData(standard.categories);
    console.log('CATEGORIES insertados correctamente.');

    console.log(`Poblando tabla: PRODUCTS (${standard.products} registros)...`);
    await new RepositoryProducts().insertData(standard.products);
    console.log('PRODUCTS insertados correctamente.');

    console.log(`Poblando tabla: PRODUCT_VARIANTS (${standard.productVariants} registros)...`);
    await new RepositoryProductVariants().insertData(standard.productVariants, { products: standard.products });
    console.log('PRODUCT_VARIANTS insertados correctamente.');

    console.log(`Poblando tabla: PRODUCT_CATEGORIES (${standard.productCategories} registros)...`);
    await new RepositoryProductCategories().insertData(standard.productCategories, { products: standard.products, categories: standard.categories });
    console.log('PRODUCT_CATEGORIES insertados correctamente.');

    console.log(`Poblando tabla: INVENTORY (${standard.inventory} registros)...`);
    await new RepositoryInventory().insertData(standard.inventory, { productVariants: standard.productVariants, warehouses: standard.warehouses });
    console.log('INVENTORY insertados correctamente.');

    console.log(`Poblando tabla: PURCHASE_ORDERS_TO_SUPPLIERS (${standard.purchaseOrdersToSuppliers} registros)...`);
    await new RepositoryPurchaseOrdersToSuppliers().insertData(standard.purchaseOrdersToSuppliers, { suppliers: standard.suppliers });
    console.log('PURCHASE_ORDERS_TO_SUPPLIERS insertados correctamente.');

    console.log(`Poblando tabla: PURCHASE_ORDER_ITEMS (${standard.purchaseOrderItems} registros)...`);
    await new RepositoryPurchaseOrderItems().insertData(standard.purchaseOrderItems, { purchaseOrdersToSuppliers: standard.purchaseOrdersToSuppliers, productVariants: standard.productVariants });
    console.log('PURCHASE_ORDER_ITEMS insertados correctamente.');

    console.log(`Poblando tabla: SHOPPING_BAG (${standard.shoppingBags} registros)...`);
    await new RepositoryShoppingBag().insertData(standard.shoppingBags, { customers: standard.customers });
    console.log('SHOPPING_BAG insertados correctamente.');

    console.log(`Poblando tabla: SHOPPING_BAG_ITEMS (${standard.shoppingBagItems} registros)...`);
    await new RepositoryShoppingBagItems().insertData(standard.shoppingBagItems, { shoppingBags: standard.shoppingBags, productVariants: standard.productVariants });
    console.log('SHOPPING_BAG_ITEMS insertados correctamente.');

    console.log(`Poblando tabla: ORDERS (${standard.orders} registros)...`);
    await new RepositoryOrders().insertData(standard.orders, { customers: standard.customers, addresses: standard.addresses, paymentMethods: standard.paymentMethods });
    console.log('ORDERS insertados correctamente.');

    console.log(`Poblando tabla: ORDER_ITEMS (${standard.orderItems} registros)...`);
    await new RepositoryOrderItems().insertData(standard.orderItems, { orders: standard.orders, productVariants: standard.productVariants });
    console.log('ORDER_ITEMS insertados correctamente.');

    console.log(`Poblando tabla: PAY (${standard.pays} registros)...`);
    await new RepositoryPay().insertData(standard.pays, { orders: standard.orders, paymentMethods: standard.paymentMethods });
    console.log('PAY insertados correctamente.');

    console.log(`Poblando tabla: RECEIPT (${standard.receipts} registros)...`);
    await new RepositoryReceipt().insertData(standard.receipts, { orders: standard.orders, pays: standard.pays });
    console.log('RECEIPT insertados correctamente.');

    console.log(`Poblando tabla: SHIPMENT_ITEMS (${standard.shipmentItems} registros)...`);
    await new RepositoryShipmentItems().insertData(standard.shipmentItems, { orderItems: standard.orderItems, shipment: standard.shipment });
    console.log('SHIPMENT_ITEMS insertados correctamente.');

    console.log(`Poblando tabla: PURCHASE_HISTORY (${standard.purchaseHistory} registros)...`);
    await new RepositoryPurchaseHistory().insertData(standard.purchaseHistory, { orders: standard.orders, customers: standard.customers });
    console.log('PURCHASE_HISTORY insertados correctamente.');

    console.log(`Poblando tabla: REVIEWS (${standard.reviews} registros)...`);
    await new RepositoryReviews().insertData(standard.reviews, { customers: standard.customers, productVariants: standard.productVariants, products: standard.products });
    console.log('REVIEWS insertados correctamente.');

    console.log(`Poblando tabla: COUPONS (${standard.coupons} registros)...`);
    await new RepositoryCoupons().insertData(standard.coupons);
    console.log('COUPONS insertados correctamente.');
  } catch (error) {
    const message = (error instanceof Error) ? error.message : String(error);
    console.error(` Error durante el proceso de poblado: ${message}`);
    throw error;
  }
}
*/