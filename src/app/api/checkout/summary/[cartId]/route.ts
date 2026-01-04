// src/app/api/checkout/summary/[cartId]/route.ts
// Checkout summary API for cart items
// - POST: Create a checkout summary from cart items
// - GET: Retrieve a checkout summary by cartId

import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase/firebaseAdmins";
import {
  verifyFirebaseToken,
  createAuthErrorResponse,
} from "@/lib/auth/verifyToken";

export const runtime = "nodejs";

// --- Constants ---
const DISCOUNT_PERCENT = 10;
const SHIPPING_THRESHOLD_CENTS = 10000; // $100
const SHIPPING_LOW_CENTS = 3000; // $30
const SHIPPING_HIGH_CENTS = 1000; // $10
const DELIVERY_FEE_CENTS = 1500; // $15

// --- Interfaces ---
interface RouteParams {
  cartId: string;
}

interface CheckoutItemRequest {
  productId: string;
  quantity: number;
}

interface ProductDoc {
  id: number;
  priceCents: number;
  name: string;
  image: string;
  [key: string]: unknown;
}

interface SummaryItem {
  productId: string;
  name: string;
  quantity: number;
  priceCents: number;
  lineTotalCents: number;
}

interface Discount {
  percent: number;
  amountCents: number;
}

interface SummaryResponse {
  items: SummaryItem[];
  subtotalCents: number;
  discount: Discount;
  shippingCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}

interface SummaryDoc extends SummaryResponse {
  createdAt: string;
  updatedAt: string;
}

// --- Helpers ---

// Fetch product by productId (numeric id or Firestore doc id)
async function fetchProduct(
  productId: string
): Promise<(ProductDoc & { firestoreId?: string }) | null> {
  try {
    const numericId = Number(productId);

    // Try numeric id first
    if (Number.isFinite(numericId)) {
      const snapshot = await adminDB
        .collection("products")
        .where("id", "==", numericId)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          ...(doc.data() as ProductDoc),
          firestoreId: doc.id,
        };
      }
    }

    // Fallback to Firestore document id
    const docRef = adminDB.collection("products").doc(productId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return {
        ...(docSnap.data() as ProductDoc),
        firestoreId: docSnap.id,
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return null;
  }
}

// --- Route Handlers ---

// POST /api/checkout/summary/[cartId]
// Creates a checkout summary from cart items
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> | RouteParams }
) {
  // 1. Verify authentication
  const verifiedToken = await verifyFirebaseToken(request);
  if (!verifiedToken) {
    return createAuthErrorResponse(
      "Authentication required. Please log in to create checkout summary."
    );
  }

  const userId = verifiedToken.userId;

  // 2. Handle params
  const resolvedParams = await Promise.resolve(params);
  const cartId = resolvedParams.cartId?.trim();

  if (!cartId) {
    return NextResponse.json(
      { error: "Invalid cartId parameter" },
      { status: 400 }
    );
  }

  // 3. Parse and validate request body
  let itemsRequest: CheckoutItemRequest[];
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body. Expected { items: [...] }" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.items)) {
      return NextResponse.json(
        { error: "Field 'items' must be an array" },
        { status: 400 }
      );
    }

    if (body.items.length === 0) {
      return NextResponse.json(
        { error: "Field 'items' must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of body.items) {
      if (!item || typeof item !== "object") {
        return NextResponse.json(
          { error: "Each item must be an object with productId and quantity" },
          { status: 400 }
        );
      }

      if (typeof item.productId !== "string" || !item.productId.trim()) {
        return NextResponse.json(
          { error: "Each item must have a valid 'productId' (string)" },
          { status: 400 }
        );
      }

      const quantity = Number(item.quantity);
      if (
        !Number.isFinite(quantity) ||
        quantity < 1 ||
        quantity > 100 ||
        !Number.isInteger(quantity)
      ) {
        return NextResponse.json(
          { error: "Each item must have 'quantity' between 1 and 100" },
          { status: 400 }
        );
      }
    }

    itemsRequest = body.items as CheckoutItemRequest[];
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  // 4. Fetch products and calculate subtotal
  const summaryItems: SummaryItem[] = [];
  let subtotalCents = 0;

  for (const item of itemsRequest) {
    const product = await fetchProduct(item.productId);

    if (!product) {
      return NextResponse.json(
        { error: `Product with id "${item.productId}" not found` },
        { status: 404 }
      );
    }

    const lineTotalCents = product.priceCents * item.quantity;
    subtotalCents += lineTotalCents;

    summaryItems.push({
      productId: item.productId,
      name: product.name,
      quantity: item.quantity,
      priceCents: product.priceCents,
      lineTotalCents,
    });
  }

  // 5. Apply Pricing Rules
  
  // Discount: 10% on subtotal
  const discountAmountCents = Math.round(subtotalCents * (DISCOUNT_PERCENT / 100));
  const discountedSubtotal = subtotalCents - discountAmountCents;

  // Shipping
  // If discounted subtotal < $100 -> $30, else $10
  const shippingCents =
    discountedSubtotal < SHIPPING_THRESHOLD_CENTS
      ? SHIPPING_LOW_CENTS
      : SHIPPING_HIGH_CENTS;

  // Delivery Fee: Flat $15
  const deliveryFeeCents = DELIVERY_FEE_CENTS;

  // Final Total
  const totalCents = discountedSubtotal + shippingCents + deliveryFeeCents;

  // 6. Construct Response Object
  const summaryResponse: SummaryResponse = {
    items: summaryItems,
    subtotalCents,
    discount: {
      percent: DISCOUNT_PERCENT,
      amountCents: discountAmountCents,
    },
    shippingCents,
    deliveryFeeCents,
    totalCents,
  };

  // 7. Store summary in Firestore
  try {
    const now = new Date().toISOString();
    const summaryDoc: SummaryDoc = {
      ...summaryResponse,
      createdAt: now,
      updatedAt: now,
    };

    const summaryRef = adminDB
      .collection("users")
      .doc(userId)
      .collection("summaries")
      .doc(cartId);

    await summaryRef.set(summaryDoc);

    return NextResponse.json(summaryResponse, { status: 201 });
  } catch (error) {
    console.error("Failed to save checkout summary:", error);
    return NextResponse.json(
      { error: "Failed to create checkout summary" },
      { status: 500 }
    );
  }
}

// GET /api/checkout/summary/[cartId]
// Retrieves a checkout summary for the authenticated user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> | RouteParams }
) {
  // 1. Verify authentication
  const verifiedToken = await verifyFirebaseToken(request);
  if (!verifiedToken) {
    return createAuthErrorResponse(
      "Authentication required. Please log in to view checkout summary."
    );
  }

  const userId = verifiedToken.userId;

  // 2. Handle params
  const resolvedParams = await Promise.resolve(params);
  const cartId = resolvedParams.cartId?.trim();

  if (!cartId) {
    return NextResponse.json(
      { error: "Invalid cartId parameter" },
      { status: 400 }
    );
  }

  try {
    const summaryRef = adminDB
      .collection("users")
      .doc(userId)
      .collection("summaries")
      .doc(cartId);

    const summarySnap = await summaryRef.get();

    if (!summarySnap.exists) {
      return NextResponse.json(
        { error: "Checkout summary not found" },
        { status: 404 }
      );
    }

    const summaryData = summarySnap.data() as SummaryDoc;

    // Construct response matching the shape (excluding internal timestamps if strict, 
    // but usually returning them is fine. However, to match "Response shape (must match exactly)"
    // I will extract only the required fields).
    
    const response: SummaryResponse = {
      items: summaryData.items,
      subtotalCents: summaryData.subtotalCents,
      discount: summaryData.discount,
      shippingCents: summaryData.shippingCents,
      deliveryFeeCents: summaryData.deliveryFeeCents,
      totalCents: summaryData.totalCents,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch checkout summary:", error);
    return NextResponse.json(
      { error: "Failed to retrieve checkout summary" },
      { status: 500 }
    );
  }
}
