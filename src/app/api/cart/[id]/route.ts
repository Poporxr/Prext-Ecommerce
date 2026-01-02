// src/app/api/Cart/[id]/route.ts
// - PUT    /api/Cart/:id -> update cart item quantity (by cart doc id or productId)
// - DELETE /api/Cart/:id -> delete cart item (by cart doc id or productId)

import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase/firebaseAdmins";
import { verifyFirebaseToken, createAuthErrorResponse } from "@/lib/auth/verifyToken";

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
// 1) Firestore document id (fast path) - must belong to userId
// 2) productId == id (fallback) - must belong to userId
// Ensures users can only access their own cart items
async function resolveCartDocByIdOrProductId(
  idOrProductId: string,
  userId: string
): Promise<FirebaseFirestore.DocumentSnapshot | null> {
  const clean = idOrProductId.trim();
  if (!clean) return null;

  const collectionRef = adminDB.collection("cart");

  // Try as document id first
  const docRef = collectionRef.doc(clean);
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    const data = docSnap.data() as CartItemDoc;
    // Verify it belongs to the authenticated user
    if (data.userId === userId) {
      return docSnap;
    }
    // If userId doesn't match, return null (don't reveal existence)
    return null;
  }

  // Fallback: try as productId, scoped to userId
  const snapshot = await collectionRef
    .where("userId", "==", userId)
    .where("productId", "==", clean)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  return snapshot.docs[0];
}

// PUT /api/Cart/:id
// Requires: Authorization header with Firebase ID token
// Body: { quantity: number }
// Updates cart item quantity - only for items belonging to the authenticated user
export async function PUT(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  // Verify authentication
  const verifiedToken = await verifyFirebaseToken(req);
  if (!verifiedToken) {
    return createAuthErrorResponse(
      "Authentication required. Please log in to update your cart."
    );
  }

  const userId = verifiedToken.userId;
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
    const docSnap = await resolveCartDocByIdOrProductId(rawId, userId);
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
// Requires: Authorization header with Firebase ID token
// Deletes cart item - only for items belonging to the authenticated user
export async function DELETE(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  // Verify authentication
  const verifiedToken = await verifyFirebaseToken(req);
  if (!verifiedToken) {
    return createAuthErrorResponse(
      "Authentication required. Please log in to delete items from your cart."
    );
  }

  const userId = verifiedToken.userId;
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
    const docSnap = await resolveCartDocByIdOrProductId(rawId, userId);
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
