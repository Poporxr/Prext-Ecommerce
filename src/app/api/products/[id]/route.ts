// src/app/api/products/[id]/route.ts
// Firestore-backed item handlers for `/api/products/:id`.
// - GET    /api/products/:id  -> get a single product
// - PUT    /api/products/:id  -> update a product
// - DELETE /api/products/:id  -> delete a product

import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { connectDB } from "../../../../lib/firebase";

// Route params shape for this dynamic route.
interface ProductRouteParams {
  id: string; // Firestore document ID
}

// Shape of a product document stored in Firestore.
interface ProductDoc {
  name: string;
  priceCents: number;
  image: string;
  slug: string;
  quantity?: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// GET /api/products/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: ProductRouteParams }
) {
  try {
    const ref = doc(connectDB, "products", params.id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = snap.data() as ProductDoc;

    return NextResponse.json({ id: snap.id, ...data }, { status: 200 });
  } catch (error) {
    console.error(`GET /api/products/${params.id} error`, error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/:id
// Partially updates a product document in Firestore.
export async function PUT(
  request: NextRequest,
  { params }: { params: ProductRouteParams }
) {
  try {
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

    const ref = doc(connectDB, "products", params.id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const now = new Date().toISOString();

    await updateDoc(ref, {
      ...body,
      updatedAt: now,
    });

    const updatedSnap = await getDoc(ref);
    const updated = updatedSnap.data() as ProductDoc;

    return NextResponse.json(
      { id: updatedSnap.id, ...updated },
      { status: 200 }
    );
  } catch (error) {
    console.error(`PUT /api/products/${params.id} error`, error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: ProductRouteParams }
) {
  try {
    const ref = doc(connectDB, "products", params.id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = snap.data() as ProductDoc;

    await deleteDoc(ref);

    return NextResponse.json(
      { message: "Product deleted", product: { id: snap.id, ...data } },
      { status: 200 }
    );
  } catch (error) {
    console.error(`DELETE /api/products/${params.id} error`, error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
