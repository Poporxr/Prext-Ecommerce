import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase/firebaseAdmins";

/* -------------------- HELPERS -------------------- */
/* -------------------- PRODUCT -------------------- */

export interface ProductSizes {
  small?: string;
  medium?: string;
  large?: string;
  xl?: string;
  xxl?: string;
  defaultSize?: string;
}

export interface Product {
  id: number;
  firestoreId: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  priceCents: number;
  quantity: number;
  sizes?: ProductSizes;
  createdAt: string;
  updatedAt: string;
}

/* -------------------- CART -------------------- */

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: Product;
  createdAt?: string;
  updatedAt?: string;
}

/* -------------------- ORDER -------------------- */

export interface OrderItem {
  productId: number;
  quantity: number;
  priceCents: number;
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  reference: string;
  items: OrderItem[];
  totalCents: number;
  status: "paid" | "pending" | "failed";
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

/* -------------------- API RESPONSES -------------------- */

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
}

export interface OrderPostResponse {
  success: boolean;
  order: Order;
}

// Fetch all cart items for a user
async function getUserCartItems(userId: string): Promise<CartItem[]> {
  const snap = await adminDB
    .collection("cart")
    .where("userId", "==", userId)
    .get();

  if (snap.empty) return [];

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<CartItem, "id">),
  }));
}


// Calculate cart total (kobo)
function calculateCartTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}



/* -------------------- POST: CREATE ORDER -------------------- */

export async function POST(req: Request) {
  try {
    const { reference, userId } = await req.json();

    if (!reference || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing reference or userId" },
        { status: 400 }
      );
    }

    // 1️⃣ Verify Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json(
        { success: false, message: "Payment not verified" },
        { status: 400 }
      );
    }

    // 2️⃣ Get cart items
    const cartItems = await getUserCartItems(userId);
    if (!cartItems.length) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Normalize items
    const orderItems = cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      priceCents: item.product.priceCents,
      product: item.product,
    }));

    // 4️⃣ Calculate total
    const totalCents = orderItems.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0
    );

    // 5️⃣ Create order
    const orderData = {
      userId,
      reference,
      items: orderItems,
      totalCents,
      status: "paid",
      createdAt: new Date(),
    };

    const orderRef = await adminDB.collection("orders").add(orderData);

    // 6️⃣ Clear cart
    const batch = adminDB.batch();
    cartItems.forEach((item) => {
      batch.delete(adminDB.collection("cart").doc(item.id));
    });
    await batch.commit();

    return NextResponse.json({
      success: true,
      order: { id: orderRef.id, ...orderData },
    });
  } catch (error) {
    console.error("ORDER POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}


/* -------------------- GET: FETCH ORDERS -------------------- */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    const snap = await adminDB
      .collection("orders")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const orders = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("ORDER GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
