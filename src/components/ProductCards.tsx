"use client";

import Image from "next/image";
import { formatMoney } from "../../utils/money";
import Link from "next/link";
import { useState } from "react";
import { ProductsCardsprops, Product } from "@/app/page";

const ProductCard = ({ products }: ProductsCardsprops) => {
  const [productItems, setProductItems] = useState(
    products.map((product) => ({
      ...product,
      quantity: 1, // each item gets its own quantity
    }))
  );

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

  return (
    <>
      {productItems.map((product: Product) => (
        <div
          key={product.slug}
          className="
        group relative max-w-80 m-2 overflow-hidden rounded-2xl
        bg-white shadow-sm hover:shadow-lg transition-shadow duration-300
        max-[446px]:max-w-[97%] font-serif
      "
        >
          {/* View details icon (hidden until hover) */}
          <Link
            href={`/productDetails/${product.slug}`}
            className="
          absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          rounded-full bg-white/90 p-2 shadow
        "
          >
            <Image
              alt="View details"
              width={16}
              height={16}
              src={"/icons/view-details.png"}
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
                  src={"/icons/Minus.svg"}
                  onClick={() => decrement(product.id)}
                />

                <span className="min-w-[20px] text-center text-sm font-medium">
                  {product.quantity}
                </span>

                <Image
                  alt="plus"
                  className="cursor-pointer opacity-70 hover:opacity-100 transition"
                  width={14}
                  height={14}
                  src={"/icons/Plus.svg"}
                  onClick={() => increment(product.id)}
                />
              </div>

              {/* Add to cart */}
              <button
                className="
              rounded-full bg-[#070e1a] px-4 py-2 text-sm font-medium text-white
              hover:bg-[#070e1a]/90 transition
            "
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductCard;
