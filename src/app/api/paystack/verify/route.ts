import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { reference } = await req.json();

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const data = await res.json();

  if (data.status && data.data.status === "success") {
    // TODO:
    // - Save order
    // - Mark cart paid
    // - Prevent duplicate reference usage

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false }, { status: 400 });
}
