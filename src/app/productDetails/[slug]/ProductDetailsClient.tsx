"use client";

import Image from "next/image";
import { useState } from "react";
import { formatMoney } from "../../../../utils/money";
import type { Product } from "./page";

const sizes = ["S", "M", "L", "XL", "XXL"] as const;

interface Props {
  product: Product;
}

export default function ProductDetailsClient({ product }: Props) {
  const [quantity, setQuantity] = useState<number>(product.quantity ?? 1);

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const totalPriceCents = product.priceCents * quantity;

  return (
    <div className="mt-28 font-serif">
      <div className="mx-auto flex max-w-6xl gap-20 px-6 max-[446px]:flex-col">
        {/* Image */}
        <div className="relative w-[48%] h-[560px] max-[446px]:w-full max-[446px]:h-[420px]">
          <Image
            alt={product.name}
            src={product.image}
            fill
            priority
            className="rounded-[28px] object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex max-w-[42%] flex-col max-[446px]:max-w-full">
          {/* Category */}
          <span className="mb-4 text-xs uppercase tracking-[0.32em] text-gray-400">
            Designed for Everyday Use
          </span>

          {/* Title */}
          <h1 className="text-[32px] font-medium leading-tight text-[#0b0b0b]">
            {product.name}
          </h1>

          {/* Description */}
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-gray-600">
            {product.description}
          </p>

          {/* Divider */}
          <div className="my-8 h-px w-full bg-gray-200" />

          {/* Sizes */}
          <div>
            <p className="mb-4 text-sm text-gray-500">Select size</p>

            <div className="flex gap-4">
              {sizes.map((size) => (
                <button
                  key={size}
                  className="
                h-12 w-12 rounded-full
                border border-gray-300
                text-sm font-medium text-gray-700
                hover:border-[#0b0b0b] hover:text-[#0b0b0b]
                transition
              "
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price + Quantity */}
          <div className="mt-12 flex items-center justify-between">
            {/* Price */}
            <span className="text-2xl font-medium text-[#0b0b0b]">
              {formatMoney({ priceCents: totalPriceCents })}
            </span>

            {/* Quantity */}
            <div className="flex items-center gap-4 rounded-full border border-gray-300 px-5 py-2">
              <Image
                src="/icons/Minus.svg"
                alt="Decrease"
                width={14}
                height={14}
                className="cursor-pointer opacity-50 hover:opacity-100 transition"
                onClick={decrement}
              />

              <span className="min-w-[22px] text-center text-sm font-medium">
                {quantity}
              </span>

              <Image
                src="/icons/Plus.svg"
                alt="Increase"
                width={14}
                height={14}
                className="cursor-pointer opacity-50 hover:opacity-100 transition"
                onClick={increment}
              />
            </div>
          </div>

          {/* CTA */}
          <button
            className="
          mt-12 w-full rounded-full
          bg-[#0b0b0b] py-4 text-sm font-medium text-white
          hover:bg-black transition
        "
          >
            Add to Cart
          </button>

          {/* Micro trust text */}
          <p className="mt-4 text-center text-xs text-gray-400">
            Free shipping · 30-day returns
          </p>
        </div>
      </div>
    </div>
  );
}
