import { cache } from "react";
import { adminDB } from "@/lib/firebaseAdmins";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";

// Keep this in sync with the ProductDoc interface used in the /api/products route.
interface SizesShape {
  small: "S";
  medium: "M";
  large: "L";
  xl: "XL";
  xxl: "XXL";
  defaultSize: "S" | "M" | "L" | "XL" | "XXL";
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

const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    const cleanSlug = (slug ?? "").trim();
    if (!cleanSlug) {
      return null;
    }

    const snapshot = await adminDB
      .collection("products")
      .where("slug", "==", cleanSlug)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    const data = docSnap.data() as Product;

    // Attach Firestore document id as firestoreId, preserving all other fields.
    return { ...data, firestoreId: docSnap.id };
  }
);

interface PageProps {
  // In Next.js 16 with the App Router, `params` may be a Promise.
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function ProductDetails({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const slug = (resolvedParams?.slug ?? "").trim();
  if (!slug) {
    notFound();
  }

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
