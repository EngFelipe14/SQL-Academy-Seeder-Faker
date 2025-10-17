interface ICustomers {
  id: number,
  email: string,
  password_hash: string,
  first_name: string,
  last_name: string,
  phone: string,
  is_active: boolean,
  created_at: Date,
  updated_at: Date
};

interface IAddresses {
  id: number,
  customer_id: number,
  country: string,
  state: string,
  city: string,
  street: string,
  label: string,
  postal_code: string,
  is_default_shipping: boolean,
  is_default_billing: boolean,
  created_at: Date
};

interface IWarehouses {
  id: number,
  name: string,
  country: string,
  city: string,
  street: string,
  phone: string,
  created_at: Date
};

interface ISuppliers {
  id: number,
  name: string,
  contact_name: string,
  email: string,
  phone: string,
  address: string
  created_at: Date
};

interface IPaymentMethods {  //Se puede refactorizar provider y name para que sea un ENUM con los nombres de las opciones existentes.
  id: number,
  name: string,
  provider: string,
  details: JSON,
  is_active: boolean,
  created_at: Date
};

interface ICategories {
  id: number,
  name: string,
  slug: string,
  created_at: Date
};

interface IProducts {
  id: number,
  sku: string,
  name: string,
  description: string,
  base_price: number,
  is_active: boolean,
  created_at: Date,
  updated_at: Date
};

interface IProductVariants {
  id: number,
  product_id: number,
  sku: string,
  name: string,
  price_override: number | null,
  barcode: string,
  metadata: JSON,
  created_at: Date
};

interface IProductCategories {
  product_id: number,
  category_id: number,
};

interface IInventory {
  id: number,
  product_variant_id: number,
  warehouse_id: number,
  quantity_available: number,
  quantity_reserved: number,
  updated_at: Date,
}

export interface IInventoryMovements {
  id: number;
  product_variant_id: number;
  warehouse_id: number;
  change_qty: number;
  movement_type: 'PURCHASE_ORDER' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER' | 'RESERVATION' | 'RELEASE';
  reference_id?: number | null;
  notes?: string | null;
  created_at: Date;
}


interface IPurchaseOrdersToSuppliers {
  id: number,
  supplier_id: number,
  po_number: string,
  status: 'created' | 'sent' | 'received' | 'partially_received' | 'cancelled',
  total_amount: number,
  expected_delivery_date: Date | null,
  created_at: Date
};

interface IPurchaseOrderItems {
  id: number,
  purchase_order_id: number,
  product_variant_id: number,
  quantity_ordered: number,
  quantity_received: number,
  unit_cost: number
};

interface IShoppingBag {
  id: number,
  customer_id: number,
  session_id: string,
  status: 'active' | 'converted' |'abandoned',
  created_at: Date,
  updated_at: Date
};

interface IShoppingBagItems {
  id: number,
  shopping_bag_id: number,
  product_variant_id: number,
  quantity: number,
  unit_price_snapshot: number,
  added_at: Date
};

interface IOrders {
  id: number,
  order_number: string,
  customer_id: number,
  billing_address_id: number,
  shipping_address_id: number,
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
  subtotal: number,
  shipping_cost: number,
  tax_amount: number,
  total: number,
  payment_method_id: number,
  created_at: Date,
  updated_at: Date,
};

interface IOrderItems {
  id: number,
  order_id: number,
  product_variant_id: number,
  quantity: number,
  unit_price: number,
  line_total: number,
  sku_snapshot: string
};

interface IPay {
  id: number,
  order_id: number,
  payment_method_id: number,
  amount: number,
  currency: 'USD' | 'EUR' | 'COP' | 'MXN',
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded',
  transaction_id: string,
  paid_at: Date,
  created_at: Date
};

interface Ireceipt {
  id: number,
  order_id: number,
  payment_id: number,
  receipt_number: string,
  issued_at: Date,
  metadata: JSON
};

interface IShipment {
  id: number,
  order_id: number,
  shipment_number: string,
  carrier: string,
  tracking_number: string,
  status: 'created' | 'in_transit' | 'delivered' | 'returned',
  from_warehouse_id: number,
  shipped_at: Date,
  delivered_at: Date
}


interface IShipmentItems {
  id: number,
  shipment_id: number,
  order_item_id: number,
  quantity: number
};

interface IPurchaseHistory {
  id: number,
  order_id: number,
  customer_id: number,
  snapshot: JSON,
  created_at: Date
};

interface IReviews {
  id: number,
  customer_id: number,
  product_variant_id: number,
  product_id: number,
  rating: 1 | 2 | 3 | 4 | 5,
  title: string,
  comment: string,
  created_at: Date
};

interface ICoupons {
  id: number,
  code: string,
  discount_type: 'percentage' | 'fixed',
  discount_value: number,
  min_order_amount: number,
  expires_at: Date,
  usage_limit: number,
  created_at: Date
};

export {
  ICustomers,
  IAddresses,
  IWarehouses,
  ISuppliers,
  IPaymentMethods,
  ICategories,
  IProducts,
  IProductVariants,
  IProductCategories,
  IInventory,
  IPurchaseOrdersToSuppliers,
  IPurchaseOrderItems,
  IShoppingBag,
  IShoppingBagItems,
  IOrders,
  IOrderItems,
  IPay,
  Ireceipt,
  IShipment,
  IShipmentItems,
  IPurchaseHistory,
  IReviews,
  ICoupons
}
