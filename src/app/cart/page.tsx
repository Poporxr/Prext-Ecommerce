"use client";

import Image from "next/image";
import { products } from "../../../utils/products";
import { useState } from "react";
import { formatMoney } from "../../../utils/money";

const CartPage = () => {
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
    <div className="mt-30 pl-20 font-serif">
      <h3 className="font-semibold text-4xl mb-5">Your Shopping Cart...</h3>
      <div className="flex gap-12">
      <div className="w-[50%] p-1.5 bg-[#c4c2c2]  flex  flex-col items-center justify-center rounded-[50px] shadow-2xl mt-10 ">
        <div
          className="cart-items  w-[100%] rounded-[45px] shadow-2xl bg-[#eae8e8] p-5"
          key={9}
        >
          {productItems.map((product) => (
            <>
              <div
                key={product.slug}
                className="flex gap-6 justify-between  max-w-[550px]  p-2.5"
              >
                <div className="flex ">
                  <div className="flex gap-2">
                    <Image
                      width={120}
                      height={120}
                      src={product.image}
                      alt={product.name}
                      className="rounded-lg"
                    />
                    <div className="flex flex-col justify-between max-w-[200px] wr">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p>{product.sizes.large}</p>
                      <h3 className="font-bold">
                        {formatMoney({
                          // Total price = base price * quantity
                          priceCents: product.priceCents * product.quantity,
                        })}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end py-1.5 px-2">
                  <div>
                    <Image
                      src="/icons/delete.svg"
                      alt="Remove item"
                      width={20}
                      height={20}
                      className="cursor-pointer "
                    />
                  </div>

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
                </div>
              </div>
              <hr className="w-[100%] border-gray-400" />
            </>
          ))}
        </div>
      </div>

      <div className="order-summary w-[30%] p-1.5 bg-[#c4c2c2] rounded-[50px] shadow-2xl mt-10 mr-10 flex h-[400px]">
        <div className="w-[100%] h-[100%] bg-[#eae8e8] rounded-[45px] p-5 flex flex-col  shadow-2xl">
          <h2 className="font-bold text-lg mb-7 text-center">Payment Sumary</h2>
          <div className="flex font-semibold justify-between mb-3">
            <span>Subtotal</span>
            <span className="font-bold">$567</span>
          </div>
          <div className="flex font-semibold justify-between mb-3">
            <span>Shipping</span>
            <span className="font-bold">$567</span>
          </div>
          <div className="flex font-semibold justify-between mb-3">
            <span>Discount(-20%)</span>
            <span className="font-bold">-$42</span>
          </div>
          <div className="flex font-semibold justify-between mb-10">
            <span>Delivery Fee</span>
            <span className="font-bold">$26</span>
          </div>
          <hr />
          <div className="flex justify-between font-bold text-lg mt-4">
            <span>Total</span>
            <span>$502</span>
          </div>
          <button className="bg-[#000] text-white py-2 px-4 rounded-[20px] mt-[10%] cursor-pointer">
            Pay and Checkout
          </button>
        </div>
      </div>
    </div>
    </div>

  );
};

export default CartPage;
