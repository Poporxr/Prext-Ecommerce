"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useParams } from "next/navigation";
import { formatMoney } from "@/utils/money";
import Loading from "@/app/loading";
import CheckoutNav from "./CheckoutNav";
import PaystackButton from "@/components/PaystackButton";



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

interface SummaryData {
  items: SummaryItem[];
  subtotalCents: number;
  discount: Discount;
  shippingCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}

const CheckoutPage = () => {
  const params = useParams();
  const cartId = params?.cartId as string;
  const { user, loading: authLoading } = useAuth();
  
  
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/checkout/summary/${cartId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Checkout summary not found");
          }
          if (response.status === 401) {
            throw new Error("Authentication required");
          }
          throw new Error("Failed to fetch checkout summary");
        }

        const data = await response.json();
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user, authLoading, cartId]);

  if (authLoading || (loading && !error)) {
    return (
     <Loading />
    );
  }

  if (!user) {
    return (
      <div className="w-[95%] m-auto mt-10 flex justify-center">
        <p>Please log in to view checkout.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[95%] m-auto mt-10 flex justify-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <>
      <CheckoutNav />
      <div className="pt-20 pb-10 font-serif  px-6">
        {/* RIGHT: summary */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 max-w-3xl m-auto">
          <h3 className="text-lg font-semibold mb-6 text-center">
            Payment Summary
          </h3>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">
                {formatMoney({ priceCents: summary.subtotalCents })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium">
                {formatMoney({ priceCents: summary.shippingCents })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Discount (-{summary.discount.percent}%)
              </span>
              <span className="font-medium text-green-600">
                -{formatMoney({ priceCents: summary.discount.amountCents })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="font-medium">
                {formatMoney({ priceCents: summary.deliveryFeeCents })}
              </span>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatMoney({ priceCents: summary.totalCents })}</span>
            </div>
          </div>
        
          <PaystackButton email={user.email!} totalCents={summary.totalCents} />
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
