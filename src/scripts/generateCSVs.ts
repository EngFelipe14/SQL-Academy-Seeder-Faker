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

export async function generateCSV(config: ISeed): Promise<void> {
  const s = config;
  try {
   await new RepositoryCustomers().generateCSV(s.customers);
    await new RepositoryAddresses().generateCSV(s.addresses, { customers: s.customers });
    await new RepositoryWarehouses().generateCSV(s.warehouses);
    await new RepositorySuppliers().generateCSV(s.suppliers);
    await new RepositoryPaymentMethods().generateCSV(s.paymentMethods);
    await new RepositoryCategories().generateCSV(s.categories);
    await new RepositoryProducts().generateCSV(s.products);
    await new RepositoryProductVariants().generateCSV(s.productVariants, { products: s.products });
    await new RepositoryProductCategories().generateCSV(s.productCategories, { products: s.products, categories: s.categories });
    await new RepositoryInventory().generateCSV(s.inventory, { productVariants: s.productVariants, warehouses: s.warehouses });
    await new RepositoryInventoryMovements().generateCSV(s.inventoryMovements, { productVariants: s.productVariants, warehouses: s.warehouses });
    await new RepositoryPurchaseOrdersToSuppliers().generateCSV(s.purchaseOrdersToSuppliers, { suppliers: s.suppliers });
    await new RepositoryPurchaseOrderItems().generateCSV(s.purchaseOrderItems, { purchaseOrdersToSuppliers: s.purchaseOrdersToSuppliers, productVariants: s.productVariants });
    await new RepositoryShoppingBag().generateCSV(s.shoppingBags, { customers: s.customers });
    await new RepositoryShoppingBagItems().generateCSV(s.shoppingBagItems, { shoppingBags: s.shoppingBags, productVariants: s.productVariants });
    await new RepositoryOrders().generateCSV(s.orders, { customers: s.customers, addresses: s.addresses, paymentMethods: s.paymentMethods });
    await new RepositoryOrderItems().generateCSV(s.orderItems, { orders: s.orders, productVariants: s.productVariants });
    await new RepositoryPay().generateCSV(s.pays, { orders: s.orders, paymentMethods: s.paymentMethods });
    await new RepositoryReceipt().generateCSV(s.receipts, { orders: s.orders, pays: s.pays });
    await new RepositoryShipment().generateCSV(s.shipment, { orders: s.orders, warehouses: s.warehouses });
    await new RepositoryShipmentItems().generateCSV(s.shipmentItems, {shipment: s.shipment, orderItems: s.orderItems});
    await new RepositoryPurchaseHistory().generateCSV(s.purchaseHistory, { orders: s.orders, customers: s.customers });
    await new RepositoryReviews().generateCSV(s.reviews, { customers: s.customers, productVariants: s.productVariants, products: s.products });
    await new RepositoryCoupons().generateCSV(s.coupons);

    console.log(`CSV creados en src/CSV con la configuración "${s.name}"`);
  } catch (error) {
    console.error(`Error durante la creación de los CSV:`, error);
    throw error;
  }
}

/*
export async function generateCSVs(): Promise<void> {
  try {
    console.log(`Generando CSV de: CUSTOMERS (${standard.customers} registros)...`);
    await new RepositoryCustomers().generateCSV(standard.customers);
    console.log('CSV de CUSTOMERS generado correctamente.');

    console.log(`Generando CSV de: ADDRESSES (${standard.addresses} registros)...`);
    await new RepositoryAddresses().generateCSV(standard.addresses, { customers: standard.customers });
    console.log('CSV de ADDRESSES generado correctamente.');

    console.log(`Generando CSV de: WAREHOUSES (${standard.warehouses} registros)...`);
    await new RepositoryWarehouses().generateCSV(standard.warehouses);
    console.log('CSV de WAREHOUSES generado correctamente.');

    console.log(`Generando CSV de: SUPPLIERS (${standard.suppliers} registros)...`);
    await new RepositorySuppliers().generateCSV(standard.suppliers);
    console.log('CSV de SUPPLIERS generado correctamente.');

    console.log(`Generando CSV de: PAYMENT_METHODS (${standard.paymentMethods} registros)...`);
    await new RepositoryPaymentMethods().generateCSV(standard.paymentMethods);
    console.log('CSV de PAYMENT_METHODS generado correctamente.');

    console.log(`Generando CSV de: CATEGORIES (${standard.categories} registros)...`);
    await new RepositoryCategories().generateCSV(standard.categories);
    console.log('CSV de CATEGORIES generado correctamente.');

    console.log(`Generando CSV de: PRODUCTS (${standard.products} registros)...`);
    await new RepositoryProducts().generateCSV(standard.products);
    console.log('CSV de PRODUCTS generado correctamente.');

    console.log(`Generando CSV de: PRODUCT_VARIANTS (${standard.productVariants} registros)...`);
    await new RepositoryProductVariants().generateCSV(standard.productVariants, { products: standard.products });
    console.log('CSV de PRODUCT_VARIANTS generado correctamente.');

    console.log(`Generando CSV de: PRODUCT_CATEGORIES (${standard.productCategories} registros)...`);
    await new RepositoryProductCategories().generateCSV(standard.productCategories, { products: standard.products, categories: standard.categories });
    console.log('CSV de PRODUCT_CATEGORIES generado correctamente.');

    console.log(`Generando CSV de: INVENTORY (${standard.inventory} registros)...`);
    await new RepositoryInventory().generateCSV(standard.inventory, { productVariants: standard.productVariants, warehouses: standard.warehouses });
    console.log('CSV de INVENTORY generado correctamente.');

    console.log(`Generando CSV de: PURCHASE_ORDERS_TO_SUPPLIERS (${standard.purchaseOrdersToSuppliers} registros)...`);
    await new RepositoryPurchaseOrdersToSuppliers().generateCSV(standard.purchaseOrdersToSuppliers, { suppliers: standard.suppliers });
    console.log('CSV de PURCHASE_ORDERS_TO_SUPPLIERS generado correctamente.');

    console.log(`Generando CSV de: PURCHASE_ORDER_ITEMS (${standard.purchaseOrderItems} registros)...`);
    await new RepositoryPurchaseOrderItems().generateCSV(standard.purchaseOrderItems, { purchaseOrdersToSuppliers: standard.purchaseOrdersToSuppliers, productVariants: standard.productVariants });
    console.log('CSV de PURCHASE_ORDER_ITEMS generado correctamente.');

    console.log(`Generando CSV de: SHOPPING_BAG (${standard.shoppingBags} registros)...`);
    await new RepositoryShoppingBag().generateCSV(standard.shoppingBags, { customers: standard.customers });
    console.log('CSV de SHOPPING_BAG generado correctamente.');

    console.log(`Generando CSV de: SHOPPING_BAG_ITEMS (${standard.shoppingBagItems} registros)...`);
    await new RepositoryShoppingBagItems().generateCSV(standard.shoppingBagItems, { shoppingBags: standard.shoppingBags, productVariants: standard.productVariants });
    console.log('CSV de SHOPPING_BAG_ITEMS generado correctamente.');

    console.log(`Generando CSV de: ORDERS (${standard.orders} registros)...`);
    await new RepositoryOrders().generateCSV(standard.orders, { customers: standard.customers, addresses: standard.addresses, paymentMethods: standard.paymentMethods });
    console.log('CSV de ORDERS generado correctamente.');

    console.log(`Generando CSV de: ORDER_ITEMS (${standard.orderItems} registros)...`);
    await new RepositoryOrderItems().generateCSV(standard.orderItems, { orders: standard.orders, productVariants: standard.productVariants });
    console.log('CSV de ORDER_ITEMS generado correctamente.');

    console.log(`Generando CSV de: PAY (${standard.pays} registros)...`);
    await new RepositoryPay().generateCSV(standard.pays, { orders: standard.orders, paymentMethods: standard.paymentMethods });
    console.log('CSV de PAY generado correctamente.');

    console.log(`Generando CSV de: RECEIPT (${standard.receipts} registros)...`);
    await new RepositoryReceipt().generateCSV(standard.receipts, { orders: standard.orders, pays: standard.pays });
    console.log('CSV de RECEIPT generado correctamente.');

    console.log(`Generando CSV de: SHIPMENT_ITEMS (${standard.shipmentItems} registros)...`);
    await new RepositoryShipmentItems().generateCSV(standard.shipmentItems, { orderItems: standard.orderItems, shipment: options.shipment });
    console.log('CSV de SHIPMENT_ITEMS generado correctamente.');

    console.log(`Generando CSV de: PURCHASE_HISTORY (${standard.purchaseHistory} registros)...`);
    await new RepositoryPurchaseHistory().generateCSV(standard.purchaseHistory, { orders: standard.orders, customers: standard.customers });
    console.log('CSV de PURCHASE_HISTORY generado correctamente.');

    console.log(`Generando CSV de: REVIEWS (${standard.reviews} registros)...`);
    await new RepositoryReviews().generateCSV(standard.reviews, { customers: standard.customers, productVariants: standard.productVariants, products: standard.products });
    console.log('CSV de REVIEWS generado correctamente.');

    console.log(`Generando CSV de: COUPONS (${standard.coupons} registros)...`);
    await new RepositoryCoupons().generateCSV(standard.coupons);
    console.log('CSV de COUPONS generado correctamente.');
  } catch (error) {
    const message = (error instanceof Error) ? error.message : String(error);
    console.error(` Error durante la generación de CSVs: ${message}`);
    throw error;
  }
}
*/