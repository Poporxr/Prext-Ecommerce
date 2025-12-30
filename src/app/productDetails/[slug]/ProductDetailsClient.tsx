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
    <div className="mt-30">
      <div className="flex p-6 gap-10 max-[446px]:flex-col max-[446px]:ml-2 ">
        <div className="relative w-[40%] h-[470px] max-[446px]:w-[92%] max-[446px]:h-[350px]">
          <Image
            alt={product.name}
            className="w-full rounded-md object-center"
            fill
            src={product.image}
          />
        </div>
        <div className="max-w-[45%] flex flex-col gap-5 max-[446px]:max-w-[92%]">
          <h2 className="text-2xl font-semibold">{product.name}</h2>

          <p className="text-l ">{product.description}</p>

          <div className="max-[446px]:flex flex">
            {sizes.map((size) => (
              <button
                key={size}
                className="border w-12 h-12 m-1 p-3 rounded-full cursor-pointer max-[446px]:w-10 max-[446px]:h-10 flex items-center justify-center"
              >
                {size}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-10 max-[446px]:flex-col max-[446px]:items-start mt-4">
            <div className="flex gap-10 ">
              <span className="font-bold text-xl">
                {formatMoney({
                  priceCents: totalPriceCents,
                })}
              </span>
            </div>
            <div className="flex gap-3 items-center">
              <Image
                alt="minus"
                className="cursor-pointer"
                width={15}
                height={20}
                src={"/icons/Minus.svg"}
                onClick={decrement}
              />

              <span className="px-3 py-1 rounded-sm bg-[#d9d9d9]">
                {quantity}
              </span>

              <Image
                alt="plus"
                className="cursor-pointer"
                width={15}
                height={20}
                src={"/icons/Plus.svg"}
                onClick={increment}
              />
            </div>
          </div>
          <button className="cart-btn">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
