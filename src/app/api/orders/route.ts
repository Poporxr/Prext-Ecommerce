import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase/firebaseAdmins";

/* -------------------- HELPERS -------------------- */

// Fetch all cart items for a user
async function getUserCartItems(userId: string) {
  const snap = await adminDB
    .collection("carts")
    .where("userId", "==", userId)
    .get();

  if (snap.empty) return [];

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Calculate cart total (kobo)
function calculateCartTotal(cartItems: any[]) {
  return cartItems.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );
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

    // 1️⃣ Verify Paystack payment
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

    //const amountPaid = paystackData.data.amount; // kobo

    // 2️⃣ Get cart items
    const cartItems = await getUserCartItems(userId);
    if (!cartItems.length) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Calculate cart total
    const cartTotal = calculateCartTotal(cartItems);

    /*if (amountPaid !== cartTotal) {
      return NextResponse.json(
        {
          success: false,
          message: "Paid amount does not match cart total",
        },
        { status: 400 }
      );
    }*/

    // 4️⃣ Create order
    const orderData = {
      userId,
      reference,
      items: cartItems,
      totalCents: cartTotal,
      status: "paid",
      createdAt: new Date(),
    };

    const orderRef = await adminDB.collection("orders").add(orderData);

    // 5️⃣ Clear user's cart
    const batch = adminDB.batch();
    cartItems.forEach((item) => {
      batch.delete(adminDB.collection("carts").doc(item.id));
    });
    await batch.commit();

    return NextResponse.json({
      success: true,
      order: {
        id: orderRef.id,
        ...orderData,
      },
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
