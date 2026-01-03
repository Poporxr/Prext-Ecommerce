/* import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase/firebaseAdmins";








interface ProductDoc {
  id: number;
  image: string;
  name: string;
  slug: string;
  description: string;
  sizes: {
    small: "S";
    medium: "M";
    large: "L";
    xl: "XL";
    xxl: "XXL";
    defaultSize: "S" | "M" | "L" | "XL" | "XXL";
  };
  priceCents: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface CartItemDoc {
  userId: string; // for now, can be "anonymous"; later: Firebase Auth uid
  productId: string;
  quantity: number;
  product: ProductDoc & { firestoreId?: string }; // Full product details stored in cart
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  [key: string]: unknown;
}


export async function GET (request: NextRequest) {
  try {
      const snapshot = await adminDB
        .collection("cart")
        .where("userId", "==", userId)
        .get();
  } catch (error) {
    
  }
} */