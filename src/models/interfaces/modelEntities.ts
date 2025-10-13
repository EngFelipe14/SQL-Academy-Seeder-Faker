interface ICustomers {
  id: string,
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
  id: string,
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
  id: string,
  name: string,
  country: string,
  city: string,
  street: string,
  phone: string,
  created_at: Date
};

interface ISuppliers {
  id: string,
  name: string,
  contact_name: string,
  email: string,
  phone: string,
  address: string
  created_at: Date
};

interface IPaymentMethods {
  id: string,
  customer_id?: number,
  name: string,
  provider: string,
  datails: JSON,
  is_active: boolean
};

interface ICategories {
  id: string,
  name: string,
  slug: string,
  created_at: Date,
  updated_at: Date
};

interface IProducts {
  id: string,
  sku: string,
  name: string,
  description: string,
  base_price: number,
  is_active: boolean,
  created_at: Date,
  updated_at: Date
};

interface IProductVariants {
  id: string,
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
  id: string,
  product_variant_id: number,
  warehouse_id: number,
  quantity_available: number,
  quantity_reserved: number,
  update_at: Date,
}

interface IPurchaseOrdersToSuppliers {
  id: string,
  supplier_id: number,
  po_number: string,
  status: 'created' | 'send' | 'received' | 'partially_received' | 'cancelled',
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
  id: string,
  customer_id: number,
  session_id: number,
  status: 'active' | 'converted' |'abandoned',
  created_at: Date,
  updated_at: Date
};

interface IShoppingBagItems {
  id: string,
  shopping_bag_id: number,
  product_variant_id: number,
  quantity: number,
  unit_price_snapshot: number,
  added_at: Date
};

interface IOrders {
  id: string,
  order_number: number,
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
  id: string,
  order_id: number,
  product_variant_id: number,
  quantity: number,
  unit_price: number,
  line_total: number,
  sku_snapshot: string
};

interface IPay {
  id: string,
  order_id: number,
  payment_method_id: number,
  amount: number,
  currency: string,
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded',
  transaction_id: number,
  paid_at: Date,
  created_at: Date
};

interface Ireceipt {
  id: string,
  order_id: number,
  payment_id: number,
  receipt_number: string,
  issued_at: Date,
  metadata: JSON
};

interface IShipmentItems {
  id: string,
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
  id: string,
  customer_id: number,
  product_variant_id: number,
  product_id: number,
  rating: boolean,
  title: string,
  comment: string,
  created_at: Date
};

interface ICoupons {
  id: string,
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
  IShipmentItems,
  IPurchaseHistory,
  IReviews,
  ICoupons
}
