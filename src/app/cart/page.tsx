import CartPageClient from "./CartPageClient";




interface SizesShape {
  small: "S";
  medium: "M";
  large: "L";
  xl: "XL";
  xxl: "XXL";
  defaultSize: "S" | "M" | "L" | "XL" | "XXL";
}
export interface CartItems{
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  product: Product
}
export interface Product {
  firestoreId?: string;
  id: number;
  image: string;
  name: string;
  slug: string;
  description: string;
  sizes: SizesShape;
  priceCents: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}



const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {
  const data = await fetch(`${BASE_URL}/api/cart`, { cache: "no-store" });
  const result = await data.json();

  const cartItems = Array.isArray(result.data)
    ? result.data
    : Object.values(result.data ?? {});

  return <CartPageClient  cartItems={cartItems} />;
};
export default Page;