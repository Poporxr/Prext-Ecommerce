"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import CartPageClient from "./CartPageClient";
import { CartItems } from "./CartPageClient";
import Loading from "../loading";
import Image from "next/image";

const Page = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError(null);

      try {
        if (authLoading) return;
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
  }, [router, user, authLoading]);

  if (loading) {
    return (
      <Loading />
    );
  }

  if (error) {
    return (
      <div className="mt-20 pl-20 font-serif">
        <div className="flex w-[100%] flex-col">
          <h3 className="font-semibold text-4xl mb-5">...</h3>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="font-serif">
        <div className="flex h-screen justify-center items-center w-[100%] flex-col">
          <div className="flex flex-col items-center">
            <Image src={'/images/empty-cart.svg'} width={70} height={70} alt="empty-cart"/>
            <p>Your Cart is Empty</p>
          </div>
         
        </div>
      </div>
    );
  }

  return <CartPageClient cartItems={cartItems} setCartItems={setCartItems} />;
};

export default Page;