// src/app/api/Cart/[id]/route.ts
// - PUT    /api/Cart/:id -> update cart item quantity (by cart doc id or productId)
// - DELETE /api/Cart/:id -> delete cart item (by cart doc id or productId)

import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase/firebaseAdmins";

export const runtime = "nodejs";

interface CartItemDoc {
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

type CartItem = { id: string } & CartItemDoc;

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: string;
  details?: string;
}

interface RouteParams {
  id: string;
}

// Helper to resolve a cart document by:
// 1) Firestore document id (fast path)
// 2) productId == id (fallback)
// NOTE: For now this ignores userId; later you should scope by user.
async function resolveCartDocByIdOrProductId(
  idOrProductId: string
): Promise<FirebaseFirestore.DocumentSnapshot | null> {
  const clean = idOrProductId.trim();
  if (!clean) return null;

  const collectionRef = adminDB.collection("cart");

  // Try as document id
  const docRef = collectionRef.doc(clean);
  const docSnap = await docRef.get();
  if (docSnap.exists) return docSnap;

  // Fallback: try as productId
  const snapshot = await collectionRef
    .where("productId", "==", clean)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  return snapshot.docs[0];
}

// PUT /api/Cart/:id
// Body: { quantity: number }
export async function PUT(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  let quantity: number;

  try {
    const json = await req.json();

    if (!json || typeof json !== "object") {
      const body: ApiError = {
        success: false,
        error: "Invalid JSON body. Expected { quantity }.",
      };
      return NextResponse.json(body, { status: 400 });
    }

    const rawQuantity = Number(json.quantity);
    if (!Number.isFinite(rawQuantity) || rawQuantity <= 0) {
      const body: ApiError = {
        success: false,
        error: "Field 'quantity' is required and must be a positive number.",
      };
      return NextResponse.json(body, { status: 400 });
    }

    quantity = rawQuantity;
  } catch (error) {
    console.error("Failed to parse JSON body in PUT /api/Cart/:id", error);
    const body: ApiError = {
      success: false,
      error: "Invalid JSON body. Expected { quantity }.",
    };
    return NextResponse.json(body, { status: 400 });
  }

  const rawId = (params?.id ?? "").trim();
  if (!rawId) {
    const body: ApiError = {
      success: false,
      error:
        "Invalid path parameter. Expected /api/Cart/{cartDocId} or /api/Cart/{productId}.",
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const docSnap = await resolveCartDocByIdOrProductId(rawId);
    if (!docSnap) {
      const body: ApiError = {
        success: false,
        error: "Cart item not found.",
      };
      return NextResponse.json(body, { status: 404 });
    }

    const now = new Date().toISOString();

    await docSnap.ref.update({
      quantity,
      updatedAt: now,
    });

    const updatedSnap = await docSnap.ref.get();
    const updatedData = updatedSnap.data() as CartItemDoc;

    const body: ApiSuccess<CartItem> = {
      success: true,
      data: {
        id: updatedSnap.id,
        ...updatedData,
      },
    };

    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/Cart/${rawId} Firestore error`, error);
    const body: ApiError = {
      success: false,
      error: "Failed to update cart item.",
    };
    return NextResponse.json(body, { status: 500 });
  }
}

// DELETE /api/Cart/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: RouteParams }
) {
  const rawId = (params?.id ?? "").trim();
  if (!rawId) {
    const body: ApiError = {
      success: false,
      error:
        "Invalid path parameter. Expected /api/Cart/{cartDocId} or /api/Cart/{productId}.",
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const docSnap = await resolveCartDocByIdOrProductId(rawId);
    if (!docSnap) {
      const body: ApiError = {
        success: false,
        error: "Cart item not found.",
      };
      return NextResponse.json(body, { status: 404 });
    }

    const existingData = docSnap.data() as CartItemDoc;

    await docSnap.ref.delete();

    const body: ApiSuccess<CartItem> = {
      success: true,
      data: {
        id: docSnap.id,
        ...existingData,
      },
    };

    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/Cart/${rawId} Firestore error`, error);
    const body: ApiError = {
      success: false,
      error: "Failed to delete cart item.",
    };
    return NextResponse.json(body, { status: 500 });
  }
}
