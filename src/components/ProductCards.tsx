"use client";

import Image from "next/image";
import { formatMoney } from "@/utils/money";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/firebase";
import { ProductsCardsprops, Product } from "@/app/page";
import { showToast } from "@/components/Toast";

const ProductCard = ({ products }: ProductsCardsprops) => {
  const router = useRouter();
  const [productItems, setProductItems] = useState(
    products.map((product) => ({
      ...product,
      quantity: 1, // each item gets its own quantity
    }))
  );


  const [addingItems, setAddingItems] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, string | null>>({});

  const increment = (id: number) =>
    setProductItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  const decrement = (id: number) =>
    setProductItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );

  const addToCart = async (product: Product) => {
    const productId = product.id;
    setAddingItems((prev) => ({ ...prev, [productId]: true }));
    setErrors((prev) => ({ ...prev, [productId]: null }));

    try {
      const user = auth.currentUser;
      if (!user) {
        // Redirect to login
        router.push("/signup");
        return;
      }

      const token = await user.getIdToken();

      const productItem = productItems.find((item) => item.id === productId);
      const quantity = productItem?.quantity || 1;

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: String(productId),
          quantity: quantity,
          // Remove userId - it's derived from token
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          router.push("/signup");
          return;
        }
        throw new Error(data.error || "Failed to add item to cart");
      }

      // Success - show toast notification
      showToast("Added to cart successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add item to cart";
      setErrors((prev) => ({ ...prev, [productId]: errorMessage }));
      alert(`Error: ${errorMessage}`);
    } finally {
      setAddingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <>
      {productItems.map((product: Product) => (
        <div
          key={product.slug}
          className="
        group relative max-w-80 m-2 overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 max-[446px]:max-w-[97%] font-serif
      "
        >
          {/* View details icon (hidden until hover) */}
          <Link
            href={`/productDetails/${product.slug}`}
            className="
          absolute top-3 right-3 z-10 rounded-full bg-white/90 p-2 shadow
        "
          >
            <Image
              alt="View details"
              width={16}
              height={16}
              src={"/images/view-details.png"}
            />
          </Link>

          {/* Image */}
          <div className="relative h-80 w-full overflow-hidden">
            <Image
              alt={product.name}
              src={product.image}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            <div className="text-base font-medium text-[#070e1a] line-clamp-1 font-body">
              {product.name}
            </div>

            <div className="mt-2 text-lg font-semibold text-[#070e1a]">
              {formatMoney({
                priceCents: product.priceCents * product.quantity,
              })}
            </div>

            <div className="mt-4 flex items-center justify-between">
              {/* Quantity */}
              <div className="flex items-center gap-2 rounded-full border px-3 py-1">
                <Image
                  alt="minus"
                  className="cursor-pointer opacity-70 hover:opacity-100 transition"
                  width={14}
                  height={14}
                  src={"/images/Minus.svg"}
                  onClick={() => decrement(product.id)}
                />

                <span className="min-w-5 text-center text-sm font-medium">
                  {product.quantity}
                </span>

                <Image
                  alt="plus"
                  className="cursor-pointer opacity-70 hover:opacity-100 transition"
                  width={14}
                  height={14}
                  src={"/images/Plus.svg"}
                  onClick={() => increment(product.id)}
                />
              </div>

              {/* Add to cart */}
              <button
                onClick={() => addToCart(product)}
                disabled={addingItems[product.id]}
                className="rounded-full bg-[#070e1a] px-4 py-2 text-sm font-medium text-white hover:bg-[#070e1a]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingItems[product.id] ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductCard;
