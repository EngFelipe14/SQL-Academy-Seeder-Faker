interface Customers {
  id: number,
  email: string,
  password: string,
  first_name: string,
  last_name: string,
  phone: string,
  is_active: boolean,
  created_at: Date,
  update_at: Date
};

interface Addresses {
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
  create_at: Date
};

interface Warehouses {
  id: number,
  name: string,
  country: string,
  city: string,
  street: string,
  phone: string,
  created_at: Date
};

interface Suppliers {
  id: number,
  name: string,
  contact_name: string,
  email: string,
  phone: string,
  address: string
  created_at: Date
};

interface PaymentMethods {
  id: number,
  customer_id?: number,
  name: string,
  provider: string,
  datails: JSON,
  is_active: boolean
};

interface Categories {
  id: number,
  name: string,
  slug: string,
  created_at: Date,
  updated_at: Date
};

interface Products {
  id: number,
  sku: string,
  name: string,
  description: string,
  base_price: number,
  is_active: boolean,
  created_at: Date,
  updated_at: Date
};

interface ProductVariants {
  id: number,
  product_id: number,
  sku: string,
  name: string,
  price_override: number | null,
  barcode: string,
  metadata: JSON,
  created_at: Date
};

interface ProductCategories {
  product_id: number,
  category_id: number,
};

interface Inventory {
  id: number,
  product_variant_id: number,
  warehouse_id: number,
  quantity_available: number,
  quantity_reserved: number,
  update_at: Date,
}

interface PurchaseOrdersToSuppliers {
  id: number,
  supplier_id: number,
  po_number: string,
  status: 'created' | 'send' | 'received' | 'partially_received' | 'cancelled',
  total_amount: number,
  expected_delivery_date: Date | null,
  created_at: Date
};

interface PurchaseOrderItems {
  id: number,
  purchase_order_id: number,
  product_variant_id: number,
  quantity_ordered: number,
  quantity_received: number,
  unit_cost: number
};

interface ShoppingBag {
  id: number,
  customer_id: number,
  session_id: number,
  status: 'active' | 'converted' |'abandoned',
  created_at: Date,
  updated_at: Date
};

interface ShoppingBagItems {
  id: number,
  shopping_bag_id: number,
  product_variant_id: number,
  quantity: number,
  unit_price_snapshot: number,
  added_at: Date
};

interface Orders {
  id: number,
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

interface OrderItems {
  id: number,
  order_id: number,
  product_variant_id: number,
  quantity: number,
  unit_price: number,
  line_total: number,
  sku_snapshot: string
};

interface Pay {
  id: number,
  order_id: number,
  payment_method_id: number,
  amount: number,
  currency: string,
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded',
  transaction_id: number,
  paid_at: Date,
  created_at: Date
};

interface receipt {
  id: number,
  order_id: number,
  payment_id: number,
  receipt_number: string,
  issued_at: Date,
  metadata: JSON
};

interface ShipmentItems {
  id: number,
  shipment_id: number,
  order_item_id: number,
  quantity: number
};

interface PurchaseHistory {
  id: number,
  order_id: number,
  customer_id: number,
  snapshot: JSON,
  created_at: Date
};

interface Reviews {
  id: number,
  customer_id: number,
  product_variant_id: number,
  product_id: number,
  rating: boolean,
  title: string,
  comment: string,
  created_at: Date
};

interface Coupons {
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
  Customers, 
  Addresses, 
  Warehouses, 
  Suppliers, 
  PaymentMethods, 
  Categories, 
  Products, 
  ProductVariants, 
  ProductCategories, 
  Inventory, 
  PurchaseOrdersToSuppliers,
  PurchaseOrderItems,
  ShoppingBag,
  ShoppingBagItems,
  Orders,
  OrderItems,
  Pay,
  receipt,
  ShipmentItems,
  PurchaseHistory,
  Reviews,
  Coupons
}