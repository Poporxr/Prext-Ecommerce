// src/app/api/products/[id]/route.ts
// Firestore-backed item handlers for `/api/products/:id` using Firebase Admin.
// - GET    /api/products/:id  -> get a single product
// - PUT    /api/products/:id  -> update a product
// - DELETE /api/products/:id  -> delete a product

import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase/firebaseAdmins";

// Ensure Node.js runtime so we can use the Admin SDK.
export const runtime = "nodejs";

// Route params shape for this dynamic route.
// `id` can be either:
// - the Firestore document id, OR
// - the numeric product id stored in the document's `id` field.
// The handlers will try numeric id first and, if that fails, fall back to doc id.
interface ProductRouteParams {
  id: string;
}

// Sizes structure matching the main products route.
interface Sizes {
  small: "S";
  medium: "M";
  large: "L";
  xl: "XL";
  xxl: "XXL";
  defaultSize: "S" | "M" | "L" | "XL" | "XXL";
}

// Shape of a product document stored in Firestore.
// This matches the structure used in `src/app/api/products/route.ts`.
interface ProductDoc {
  id: number; // numeric product id (separate from Firestore doc id)
  image: string; // image URL (Cloudinary)
  name: string;
  slug: string;
  description: string;
  sizes: Sizes;
  priceCents: number;
  quantity: number;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  [key: string]: unknown;
}

// GET /api/products/:id
// Looks up a product by either:
// - its numeric `id` field (if the path segment is numeric), OR
// - its Firestore document id (fallback).
export async function GET(
  _request: NextRequest,
  { params }: { params: ProductRouteParams | Promise<ProductRouteParams> }
) {
  try {
    // Handle params as either sync or async (Next.js 16 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;

    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json(
        {
          error:
            "Invalid product id in path. Expected /api/products/{firestoreId} or /api/products/{numericId}.",
        },
        { status: 400 }
      );
    }

    const rawId = String(resolvedParams.id).trim();
    if (!rawId) {
      return NextResponse.json(
        {
          error:
            "Invalid product id in path. Expected /api/products/{firestoreId} or /api/products/{numericId}.",
        },
        { status: 400 }
      );
    }

    const numericId = Number(rawId);

    let docSnap;
    // Prefer lookup by numeric `id` field when the path looks like a number.
    if (Number.isFinite(numericId)) {
      const snapshot = await adminDB
        .collection("products")
        .where("id", "==", numericId)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        docSnap = snapshot.docs[0];
      }
    }

    // Fallback: treat rawId as Firestore document id.
    if (!docSnap) {
      const ref = adminDB.collection("products").doc(rawId);
      const snap = await ref.get();
      if (!snap.exists) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
      docSnap = snap;
    }

    const data = docSnap.data() as ProductDoc;

    return NextResponse.json({ id: docSnap.id, ...data }, { status: 200 });
  } catch (error) {
    const resolvedParams = params instanceof Promise ? await params : params;
    console.error(`GET /api/products/${resolvedParams?.id} error`, error);

    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Unknown error";

    return NextResponse.json(
      { error: "Failed to fetch product", details: message },
      { status: 500 }
    );
  }
}

// PUT /api/products/:id
// Partially updates a product looked up by either numeric `id` or Firestore doc id.
export async function PUT(
  request: NextRequest,
  { params }: { params: ProductRouteParams | Promise<ProductRouteParams> }
) {
  try {
    // Handle params as either sync or async (Next.js 16 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;

    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json(
        {
          error:
            "Invalid product id in path. Expected /api/products/{firestoreId} or /api/products/{numericId}.",
        },
        { status: 400 }
      );
    }

    const rawId = String(resolvedParams.id).trim();
    if (!rawId) {
      return NextResponse.json(
        {
          error:
            "Invalid product id in path. Expected /api/products/{firestoreId} or /api/products/{numericId}.",
        },
        { status: 400 }
      );
    }

    const numericId = Number(rawId);

    const body = (await request.json()) as Partial<ProductDoc> | null;

    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      return NextResponse.json(
        {
          error:
            "Invalid request body: must include at least one field to update",
        },
        { status: 400 }
      );
    }

    let ref;

    // Prefer lookup by numeric `id` when possible.
    if (Number.isFinite(numericId)) {
      const snapshot = await adminDB
        .collection("products")
        .where("id", "==", numericId)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        ref = snapshot.docs[0].ref;
      }
    }

    // Fallback to Firestore document id if numeric lookup failed.
    if (!ref) {
      ref = adminDB.collection("products").doc(rawId);
      const snap = await ref.get();
      if (!snap.exists) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
    }
    const now = new Date().toISOString();

    await ref.update({
      ...body,
      updatedAt: now,
    });

    const updatedSnap = await ref.get();
    const updated = updatedSnap.data() as ProductDoc;

    return NextResponse.json(
      { id: updatedSnap.id, ...updated },
      { status: 200 }
    );
  } catch (error) {
    const resolvedParams = params instanceof Promise ? await params : params;
    console.error(`PUT /api/products/${resolvedParams?.id} error`, error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/:id
// Deletes a product looked up by either numeric `id` or Firestore doc id.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: ProductRouteParams | Promise<ProductRouteParams> }
) {
  try {
    // Handle params as either sync or async (Next.js 16 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;

    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json(
        {
          error:
            "Invalid product id in path. Expected /api/products/{firestoreId} or /api/products/{numericId}.",
        },
        { status: 400 }
      );
    }

    const rawId = String(resolvedParams.id).trim();
    if (!rawId) {
      return NextResponse.json(
        {
          error:
            "Invalid product id in path. Expected /api/products/{firestoreId} or /api/products/{numericId}.",
        },
        { status: 400 }
      );
    }

    const numericId = Number(rawId);

    let docSnap;

    // Prefer lookup by numeric `id` when possible.
    if (Number.isFinite(numericId)) {
      const snapshot = await adminDB
        .collection("products")
        .where("id", "==", numericId)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        docSnap = snapshot.docs[0];
      }
    }

    // Fallback to Firestore document id if numeric lookup failed.
    if (!docSnap) {
      const ref = adminDB.collection("products").doc(rawId);
      const snap = await ref.get();
      if (!snap.exists) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
      docSnap = snap;
    }

    const data = docSnap.data() as ProductDoc;

    await docSnap.ref.delete();

    return NextResponse.json(
      { message: "Product deleted", product: { id: docSnap.id, ...data } },
      { status: 200 }
    );
  } catch (error) {
    const resolvedParams = params instanceof Promise ? await params : params;
    console.error(`DELETE /api/products/${resolvedParams?.id} error`, error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
