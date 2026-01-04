"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useParams } from "next/navigation";
import { formatMoney } from "@/utils/money";
import Loading from "@/app/loading";

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
    <div className="order-summary w-[95%] m-auto p-1.5 bg-[#c4c2c2] rounded-[50px] shadow-2xl mt-10 flex h-[400px]">
      <div className="w-[100%] h-[100%] bg-[#eae8e8] rounded-[45px] p-5 flex flex-col  shadow-2xl">
        <h2 className="font-bold text-lg mb-7 text-center">Payment Summary</h2>
        <div className="flex font-semibold justify-between mb-3">
          <span>Subtotal</span>
          <span className="font-bold">
            {formatMoney({ priceCents: summary.subtotalCents })}
          </span>
        </div>
        <div className="flex font-semibold justify-between mb-3">
          <span>Shipping</span>
          <span className="font-bold">
            {formatMoney({priceCents: summary.shippingCents})}
          </span>
        </div>
        <div className="flex font-semibold justify-between mb-3">
          <span>Discount(-{summary.discount.percent}%)</span>
          <span className="font-bold">
            -{formatMoney({priceCents: summary.discount.amountCents})}
          </span>
        </div>
        <div className="flex font-semibold justify-between mb-10">
          <span>Delivery Fee</span>
          <span className="font-bold">
            {formatMoney({priceCents: summary.deliveryFeeCents})}
          </span>
        </div>
        <hr />
        <div className="flex justify-between font-bold text-lg mt-4">
          <span>Total</span>
          <span>{formatMoney({ priceCents: summary.totalCents })}</span>
        </div>
        <button className="bg-[#000] text-white py-2 px-4 rounded-[20px] mt-[10%] cursor-pointer hover:bg-gray-800 transition-colors">
          Pay and Checkout
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
