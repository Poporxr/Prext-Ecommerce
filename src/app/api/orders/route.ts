// src/app/api/orders/route.ts
// Firestore-backed collection handlers for `/api/orders`.
// - GET    /api/orders      -> list all orders
// - POST   /api/orders      -> create a new order

import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { connectDB } from "../../../lib/firebase";

interface OrderItem {
  productId: string; // Firestore document ID for the product
  title: string; // Snapshot of product title at time of purchase
  qty: number; // Quantity purchased
  price: number; // Price per unit (same unit as `amount`)
}

interface OrderDoc {
  // Auto-generated Firestore document ID is returned as `id` in responses.
  customerEmail: string;
  amount: number; // Total order amount (derived from items)
  status: "pending" | "successful" | "shipped";
  paystackReference: string;
  items: OrderItem[];
  createdAt: string; // ISO timestamp string
  updatedAt: string; // ISO timestamp string
  [key: string]: unknown;
}

// GET /api/orders
// Returns all orders from the Firestore `orders` collection.
export async function GET(_request: NextRequest) {
  try {
    const colRef = collection(connectDB, "orders");
    const snapshot = await getDocs(colRef);

    const orders = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as OrderDoc),
    }));

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("GET /api/orders error", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

interface CreateOrderBody {
  customerEmail: string;
  paystackReference: string;
  items: { productId: string; qty: number }[];
  status?: "pending" | "successful" | "shipped";
  // Optional metadata bag for future fields (e.g. shipping info).
  [key: string]: unknown;
}

// POST /api/orders
// Creates a new order document in Firestore.
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CreateOrderBody> | null;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { customerEmail, paystackReference, items, status, ...rest } =
      body as CreateOrderBody;

    if (!customerEmail || typeof customerEmail !== "string") {
      return NextResponse.json(
        { error: "'customerEmail' is required and must be a string" },
        { status: 400 }
      );
    }

    if (!paystackReference || typeof paystackReference !== "string") {
      return NextResponse.json(
        { error: "'paystackReference' is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate items array.
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid request body: 'items' must be a non-empty array" },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        typeof item.qty !== "number" ||
        item.qty <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Each item must include a valid 'productId' (string) and 'qty' (positive number)",
          },
          { status: 400 }
        );
      }
    }

    // Ensure all referenced products exist and compute total amount.
    const orderItems: OrderItem[] = [];
    let amount = 0;

    for (const item of items) {
      const productRef = doc(connectDB, "products", item.productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        return NextResponse.json(
          { error: `Product not found for productId ${item.productId}` },
          { status: 400 }
        );
      }

      const productData = productSnap.data() as {
        name?: string;
        priceCents?: number;
      };

      if (typeof productData.priceCents !== "number") {
        return NextResponse.json(
          { error: `Product ${item.productId} is missing 'priceCents'` },
          { status: 500 }
        );
      }

      const title =
        typeof productData.name === "string"
          ? productData.name
          : item.productId;
      const price = productData.priceCents;

      const snapshotItem: OrderItem = {
        productId: item.productId,
        title,
        qty: item.qty,
        price,
      };

      orderItems.push(snapshotItem);
      amount += price * item.qty;
    }

    // Validate and normalize status.
    const validStatuses: OrderDoc["status"][] = [
      "pending",
      "successful",
      "shipped",
    ];

    const resolvedStatus: OrderDoc["status"] = validStatuses.includes(
      status as OrderDoc["status"]
    )
      ? (status as OrderDoc["status"])
      : "pending";

    const now = new Date().toISOString();

    const data: OrderDoc = {
      customerEmail,
      paystackReference,
      items: orderItems,
      amount,
      status: resolvedStatus,
      ...(rest as Omit<
        OrderDoc,
        | "customerEmail"
        | "paystackReference"
        | "items"
        | "amount"
        | "status"
        | "createdAt"
        | "updatedAt"
      >),
      createdAt: now,
      updatedAt: now,
    };

    const colRef = collection(connectDB, "orders");
    const docRef = await addDoc(colRef, data);

    return NextResponse.json({ id: docRef.id, ...data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
