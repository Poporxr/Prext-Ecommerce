import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase/firebaseAdmins";

interface CartItem {
  productId: string;
  quantity: number;
  priceCents: number;
  userId: string;
}

const DISCOUNT_PERCENT = 10;
const SHIPPING_THRESHOLD_CENTS = 10000; // $100
const SHIPPING_LOW_CENTS = 3000; // $30
const SHIPPING_HIGH_CENTS = 1000; // $10
const DELIVERY_FEE_CENTS = 1500; // $15

export async function POST(req: Request) {
  const { reference, userId } = await req.json();

  if (!reference || !userId) {
    return NextResponse.json(
      { success: false, message: "Missing reference or userId" },
      { status: 400 }
    );
  }

  // 1️⃣ Verify Paystack payment
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const data = await res.json();

  if (!data.status || data.data.status !== "success") {
    return NextResponse.json(
      { success: false, message: "Payment not verified" },
      { status: 400 }
    );
  }

  //const amountPaid = data.data.amount; // kobo

  // 2️⃣ Get all cart items for this user
  const cartSnap = await adminDB
    .collection("cart")
    .where("userId", "==", userId)
    .get();

  if (cartSnap.empty) {
    return NextResponse.json(
      { success: false, message: "Cart not found" },
      { status: 404 }
    );
  }
  // inside POST
  const items: CartItem[] = cartSnap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as CartItem), // cast to CartItem
  }));
  const subtotalCents = items.reduce(
    (sum, item) => sum + (item.priceCents || 0) * (item.quantity || 0),
    0
  );

  const discountAmountCents = Math.round(
    subtotalCents * (DISCOUNT_PERCENT / 100)
  );
  const discountedSubtotal = subtotalCents - discountAmountCents;
  const shippingCents =
    discountedSubtotal < SHIPPING_THRESHOLD_CENTS
      ? SHIPPING_LOW_CENTS
      : SHIPPING_HIGH_CENTS;

  // Delivery Fee: Flat $15
  const deliveryFeeCents = DELIVERY_FEE_CENTS;

  // Final Total
  const totalCents = discountedSubtotal + shippingCents + deliveryFeeCents;
  // 3️⃣ Compare amount paid
  {
    /*if (amountPaid !== totalCents) {
    return NextResponse.json(
      { success: false, message: "Paid amount does not match cart total. you will be refunded shortly" },
      { status: 400 }
    );
  }*/
  }

  // 4️⃣ Create order
  const orderRef = await adminDB.collection("orders").add({
    userId,
    items,
    subtotalCents,
    discountedSubtotal,
    shippingCents,
    deliveryFeeCents,
    totalCents,
    reference,
    status: "paid",
    createdAt: new Date(),
  });

  // 5️⃣ Delete all cart items for this user
  const batch = adminDB.batch();
  cartSnap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  return NextResponse.json({ success: true, orderId: orderRef.id });
}




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