"use client";

import { products } from "../../../../utils/products";
import Image from "next/image";
import { formatMoney } from "../../../../utils/money";
import { useState } from "react";

const sizes = ["S", "M", "L", "XL", "XXL"];

const ProductDetails = (/*{ params }*/) => {
  // const {slug} = params;

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
          ? { ...item, quantity: Math.max(0, item.quantity - 1) }
          : item
      )
    );


  return (
    <div className="mt-30">
      <div className="flex p-6 gap-10 max-[446px]:flex-col max-[446px]:ml-2 ">
        <div className="relative w-[40%] h-[470px] max-[446px]:w-[92%] max-[446px]:h-[350px]">
          <Image
            alt="maA"
            className="w-full rounded-md object-center"
            fill
            src={productItems[2].image}
          />
        </div>
        <div className="max-w-[45%] flex flex-col gap-5 max-[446px]:max-w-[92%]">
          <h2 className="text-2xl font-semibold">{productItems[5].name}</h2>

          <p className="text-l ">{productItems[6].description}</p>

          <div className="max-[446px]:flex">
            {sizes.map((size) => (
              <button
                key={size}
                className="border w-12 h-12 m-1 p-3 rounded-full cursor-pointer max-[446px]:w-10 max-[446px]:h-10 flex items-center justify-center"
              >
                {size}
              </button>
            ))}
          </div>
          <div className="flex gap-10 mt-5">
            <span className="font-bold text-xl">
              {formatMoney({ priceCents: productItems[9].priceCents })}
            </span>
            <div className="flex gap-3">
              <Image
                alt="minus"
                width={15}
                height={20}
                src={"/icons/Minus.svg"}
                onClick={() => decrement(productItems[4].id)}
              />

              <span className="px-3 py-1 rounded-sm bg-[#d9d9d9]">
                {productItems[4].quantity}
              </span>

              <Image
                alt="plus"
                className="cursor-pointer"
                width={15}
                height={20}
                src={"/icons/Plus.svg"}
                onClick={() => increment(productItems[4].id)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
