"use client";

import { useEffect, useState } from "react";
import { showToast } from "./Toast";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export default function PaystackButton({
  email,
  totalCents,
}: {
  email: string;
  totalCents: number;
}) {
  const [ready, setReady] = useState(false);
    const { user } = useAuth();
      const router = useRouter();

  useEffect(() => {
    if (window.PaystackPop) {
      setTimeout(() => setReady(true), 0);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js"; // ✅ v1 inline
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);

  const pay = (e: React.FormEvent) => {
    e.preventDefault();

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_KEY!, // TEST PUBLIC KEY
      email,
      amount: totalCents, // kobo
      currency: "NGN",
      ref: `demo_${Date.now()}`,

      callback: function (response) {
        if (!response || !response.reference) {
          showToast("⚠️ Payment callback invalid");
          return;
        }

        showToast("✅ Payment successful");

        (async () => {
          try {
            const res = await fetch('/api/orders', {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reference: response.reference,
                userId: user?.uid,
              }),
            });

            const data = await res.json();

            if (data.success) {
              showToast(`✅ Order Sucessfull`);
            } else {
              showToast(
                `⚠️ Payment verified but order not created: ${data.message}`
              );
            }
          } catch (err) {
            console.error(err);
            showToast("❌ Something went wrong while creating the order.");
          }
          router.push(`/orders?userId=${user?.uid}`)
        })();
      },

      onClose: () => {
        showToast("❌ Payment cancelled");
      },
    });

    handler.openIframe();
  };

  return (
    <form onSubmit={pay}>
      <button
        type="submit"
        disabled={!ready}
        className="mt-6 w-full rounded-full bg-black py-3 text-white disabled:bg-gray-400"
      >
        {ready ? "Pay & Checkout" : "Loading Paystack..."}
      </button>
    </form>
  );
}
