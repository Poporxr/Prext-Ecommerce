"use client";

import Image from "next/image";
import { formatMoney } from "../utils/money";
import { products, Product } from "../utils/products";
import Link from "next/link";
import { useState } from "react";

const ProductCard = () => {
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
          className="bg-[#f0f0f0] max-w-80 rounded-md m-2 shadow-lg relative"
          key={product.slug}
        >
          <Link
            href={`/productDetails/${product.slug}`}
            className="product-details"
          >
            <Image
              alt="badge"
              width={20}
              height={20}
              src={"/icons/view-details.png"}
            />
          </Link>
          <div className="w-full h-80 relative overflow-hidden rounded-t-md rounded-b- group">
            <Image
              alt={product.name}
              className="product-image"
              src={product.image}
              fill
            />
          </div>

          <div className="px-3 py-2">
            <div className="font-medium text-lg line-clamp-1">
              {product.name}
            </div>
            <div className="font-bold text-xl mb-2 mt-2">
              {formatMoney({
                // Total price = base price * quantity
                priceCents:
                  product.priceCents * product.quantity,
              })}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-3">
                <Image
                  alt="minus"
                  className="cursor-pointer"
                  width={15}
                  height={20}
                  src={"/icons/Minus.svg"}
                  onClick={() => decrement(product.id)}
                />

                <span className="px-3 py-1 rounded-sm bg-[#d9d9d9]">
                  {product.quantity}
                </span>

                <Image
                  alt="plus"
                  className="cursor-pointer"
                  width={15}
                  height={20}
                  src={"/icons/Plus.svg"}
                  onClick={() => increment(product.id)}
                />
              </div>
              <button className="cart-btn">Add to Cart</button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductCard;
