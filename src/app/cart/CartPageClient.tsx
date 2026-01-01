"use client";

import Image from "next/image";
import { Fragment, useState } from "react";
import { formatMoney } from "../../../utils/money";
import {CartItems} from "./page"

export interface Totals {
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}

export interface Props {
  cartItems: CartItems[];
  totals: Totals;
}

const CartPageClient = ( {cartItems, totals} : Props) => {

const [quantities, setQuantities] = useState<Record<string, number>>({});

const increment = (id: string) => {
  setQuantities((prev) => ({
    ...prev,
    [id]: (prev[id] ?? 1) + 1,
  }));
};

const decrement = (id: string) => {
  setQuantities((prev) => ({
    ...prev,
    [id]: Math.max(1, (prev[id] ?? 1) - 1),
  }));
};


 

  return (
    <>
      <div className="mt-20 pl-20 font-serif ">
        <div className="flex w-[100%] flex-col ">
          <h3 className="font-semibold text-4xl mb-5">Your Shopping Cart...</h3>
          <div className="w-[90%] p-1.5 bg-[#c4c2c2]  flex  flex-col items-center justify-center rounded-[50px] shadow-2xl mt-10 ">
            <div
              className="cart-items  w-[100%] rounded-[45px] shadow-2xl bg-[#eae8e8] p-5"
              key={9}
            >
              {cartItems.map((cartItem) => {
                const quantity =
                  quantities[cartItem.productId] ?? cartItem.quantity ?? 1;
                return (
                  <Fragment key={crypto.getRandomValues(new Uint32Array(1))[0]}>
                    <div className="flex gap-6 justify-between    p-2.5">
                      <div className="flex ">
                        <div className="flex gap-2">
                          <div className="relative overflow-hidden w-[150px]  h-[120px]">
                            <Image
                              fill
                              src={cartItem.product.image}
                              alt={cartItem.product.slug}
                              className="rounded-lg object-cover"
                            />
                          </div>

                          <div className="flex flex-col justify-between ">
                            <h3 className="font-semibold">
                              {cartItem.product.name}
                            </h3>
                            <p></p>
                            <h3 className="font-bold">
                              {formatMoney({
                                priceCents:
                                  cartItem.product.priceCents * quantity,
                              })}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between py-1.5 px-2">
                        {/* delete icon stays */}
                        <Image
                          src="/icons/delete.svg"
                          alt="Remove item"
                          width={18}
                          height={18}
                          className="cursor-pointer opacity-70 hover:opacity-100 transition mb-2"
                        />

                        {/* quantity control – now matches product page */}
                        <div className="flex items-center gap-2 rounded-full border px-3 py-1">
                          <Image
                            alt="minus"
                            className="cursor-pointer opacity-70 hover:opacity-100 transition"
                            width={14}
                            height={14}
                            src="/icons/Minus.svg"
                            onClick={() => decrement(cartItem.productId)}
                          />

                          <span className="min-w-[20px] text-center text-sm font-medium">
                            {quantity}
                          </span>

                          <Image
                            alt="plus"
                            className="cursor-pointer opacity-70 hover:opacity-100 transition"
                            width={14}
                            height={14}
                            src="/icons/Plus.svg"
                            onClick={() => increment(cartItem.productId)}
                          />
                        </div>
                      </div>
                    </div>
                    <hr className="w-[100%] border-gray-400" />
                  </Fragment>
                );
              })}
              <button className="ml-20 mt-10 w-[70%] py-3 font-semibold rounded-full text-white bg-[#0a1429] cursor-pointer hover:bg-[#172c58]">
                Order Now
              </button>
            </div>
          </div>

          {/*<div className="order-summary w-[30%] p-1.5 bg-[#c4c2c2] rounded-[50px] shadow-2xl mt-10 mr-10 flex h-[400px]">
        <div className="w-[100%] h-[100%] bg-[#eae8e8] rounded-[45px] p-5 flex flex-col  shadow-2xl">
          <h2 className="font-bold text-lg mb-7 text-center">Payment Sumary</h2>
          <div className="flex font-semibold justify-between mb-3">
            <span>Subtotal</span>
            <span className="font-bold">{formatMoney({priceCents: totals.subtotalCents})}</span>
          </div>
          <div className="flex font-semibold justify-between mb-3">
            <span>Shipping</span>
            <span className="font-bold">{
              formatMoney({priceCents : totals.shippingCents})
              }</span>
          </div>
          <div className="flex font-semibold justify-between mb-3">
            <span>Discount(-20%)</span>
            <span className="font-bold">-$42</span>
          </div>
          <div className="flex font-semibold justify-between mb-10">
            <span>Delivery Fee</span>
            <span className="font-bold">{formatMoney({priceCents : totals.deliveryFeeCents})}</span>
          </div>
          <hr />
          <div className="flex justify-between font-bold text-lg mt-4">
            <span>Total</span>
            <span>{
              formatMoney({priceCents : totals.totalCents})
              }</span>
          </div>
          <button className="bg-[#000] text-white py-2 px-4 rounded-[20px] mt-[10%] cursor-pointer">
            Pay and Checkout
          </button>
        </div>
      </div> */}
        </div>
      </div>
    </>
  );
}; 

export default CartPageClient;
