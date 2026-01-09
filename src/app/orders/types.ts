// app/orders/types.ts

export type FirestoreTimestamp = {
  _seconds: number;
  _nanoseconds: number;
};

export type Product = {
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
  sizes: Record<string, string>;
};

export type OrderItem = {
  productId: number;
  quantity: number;
  priceCents: number;
  product: Product;
};

export type Order = {
  id: string;
  userId: string;
  status: string;
  reference: string;
  totalCents: number;
  createdAt: FirestoreTimestamp;
  items: OrderItem[];
};
