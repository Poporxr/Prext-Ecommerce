"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/firebase";
import CartPageClient from "./CartPageClient";
import { CartItems } from "./CartPageClient";

const Page = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError(null);

      try {
        const user = auth.currentUser;
        if (!user) {
          // User not authenticated - redirect to signup
          router.push("/signup");
          return;
        }

        const token = await user.getIdToken();

        const response = await fetch("/api/cart", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid - redirect to signup
            router.push("/signup");
            return;
          }
          throw new Error(result.error || "Failed to fetch cart items");
        }

        if (result.success && result.data) {
          const items = Array.isArray(result.data)
            ? result.data
            : Object.values(result.data ?? {});
          setCartItems(items);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load cart";
        setError(errorMessage);
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [router]);

  if (loading) {
    return (
      <div className="mt-20 pl-20 font-serif">
        <div className="flex w-[100%] flex-col">
          <h3 className="font-semibold text-4xl mb-5">Your Shopping Cart...</h3>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 pl-20 font-serif">
        <div className="flex w-[100%] flex-col">
          <h3 className="font-semibold text-4xl mb-5">Your Shopping Cart...</h3>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="mt-20 pl-20 font-serif">
        <div className="flex w-[100%] flex-col">
          <h3 className="font-semibold text-4xl mb-5">Your Shopping Cart...</h3>
          <p className="text-gray-600">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return <CartPageClient cartItems={cartItems} setCartItems={setCartItems} />;
};

export default Page;