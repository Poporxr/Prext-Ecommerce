// src/app/api/orders/[id]/route.ts
// Firestore-backed item handlers for `/api/orders/:id`.
// - GET    /api/orders/:id  -> get a single order
// - PUT    /api/orders/:id  -> update an order
// - DELETE /api/orders/:id  -> delete an order

import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { connectDB } from "../../../../lib/firebase/firebase";

interface OrderItem {
  productId: string;
  title: string;
  qty: number;
  price: number;
}

interface OrderDoc {
  customerEmail: string;
  amount: number;
  status: "pending" | "successful" | "shipped";
  paystackReference: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// Route params shape for this dynamic route.
interface OrderRouteParams {
  id: string; // Firestore document ID
}

// GET /api/orders/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<OrderRouteParams> | OrderRouteParams }
) {
  // Handle async params (Next.js 15+)
  const resolvedParams = await Promise.resolve(params);
  
  try {
    const ref = doc(connectDB, "orders", resolvedParams.id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const data = snap.data() as OrderDoc;

    return NextResponse.json({ id: snap.id, ...data }, { status: 200 });
  } catch (error) {
    console.error(`GET /api/orders/${resolvedParams.id} error`, error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT /api/orders/:id
// Partially updates an order in Firestore. If `items` is updated,
// the total price is recomputed based on current product prices.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<OrderRouteParams> | OrderRouteParams }
) {
  // Handle async params (Next.js 15+)
  const resolvedParams = await Promise.resolve(params);
  
  try {
    const body = (await request.json()) as Partial<OrderDoc> | null;

    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      return NextResponse.json(
        {
          error:
            "Invalid request body: must include at least one field to update",
        },
        { status: 400 }
      );
    }

    const ref = doc(connectDB, "orders", resolvedParams.id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedFields: Partial<OrderDoc> = { ...body };

    // If items are updated, validate they are not empty. Here we assume
    // the client sends fully-formed snapshot items with `title`, `qty`,
    // and `price` already set, since the canonical snapshot logic lives
    // in the POST handler.
    if (Array.isArray((updatedFields as { items?: OrderItem[] }).items)) {
      const items = (updatedFields as { items: OrderItem[] }).items;

      if (items.length === 0) {
        return NextResponse.json(
          { error: "'items' must be a non-empty array" },
          { status: 400 }
        );
      }

      for (const item of items) {
        if (
          !item ||
          typeof item.productId !== "string" ||
          typeof item.qty !== "number" ||
          item.qty <= 0 ||
          typeof item.price !== "number"
        ) {
          return NextResponse.json(
            {
              error:
                "Each item must include 'productId' (string), 'qty' (positive number) and 'price' (number)",
            },
            { status: 400 }
          );
        }
      }
    }

    const now = new Date().toISOString();

    await updateDoc(ref, {
      ...updatedFields,
      updatedAt: now,
    });

    const updatedSnap = await getDoc(ref);
    const updated = updatedSnap.data() as OrderDoc;

    return NextResponse.json(
      { id: updatedSnap.id, ...updated },
      { status: 200 }
    );
  } catch (error) {
    console.error(`PUT /api/orders/${resolvedParams.id} error`, error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<OrderRouteParams> | OrderRouteParams }
) {
  // Handle async params (Next.js 15+)
  const resolvedParams = await Promise.resolve(params);
  
  try {
    const ref = doc(connectDB, "orders", resolvedParams.id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const data = snap.data() as OrderDoc;

    await deleteDoc(ref);

    return NextResponse.json(
      { message: "Order deleted", order: { id: snap.id, ...data } },
      { status: 200 }
    );
  } catch (error) {
    console.error(`DELETE /api/orders/${resolvedParams.id} error`, error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
