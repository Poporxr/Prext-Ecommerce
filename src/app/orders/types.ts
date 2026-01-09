// types/orders.ts

export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface ProductSizes {
  defaultSize: string;
  small?: string;
  medium?: string;
  large?: string;
  xl?: string;
  xxl?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  priceCents: number;
  quantity: number;
  firestoreId: string;
  createdAt: string;
  updatedAt: string;
  sizes: ProductSizes;
}

export interface OrderItem {
  id: string;
  userId: string;
  productId: string | number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export interface Order {
  id: string;
  reference: string;
  status: string;
  subtotalCents: number;
  discountedSubtotal: number;
  shippingCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  userId: string;
  createdAt: FirestoreTimestamp;
  items: OrderItem[];
}

export interface OrdersApiResponse {
  success: boolean;
  orders: Order[];
}
