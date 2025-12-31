"use client";

import Image from "next/image";
import { Fragment, useState } from "react";
import { formatMoney } from "../../../utils/money";
import {CartItems} from "./page"

interface Props {
  cartItems: CartItems[];
}

const CartPageClient = ( {cartItems} : Props) => {

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
    <div className="mt-30 pl-20 font-serif" >
      <h3 className="font-semibold text-4xl mb-5">Your Shopping Cart...</h3>
      <div className="flex gap-12">
      <div className="w-[50%] p-1.5 bg-[#c4c2c2]  flex  flex-col items-center justify-center rounded-[50px] shadow-2xl mt-10 ">
        <div
          className="cart-items  w-[100%] rounded-[45px] shadow-2xl bg-[#eae8e8] p-5"
          key={9}
        >
          {cartItems.map((cartItem) => {
            const quantity =
              quantities[cartItem.productId] ?? cartItem.quantity ?? 1;
            return (
              <Fragment key={crypto.getRandomValues(new Uint32Array(1))[0]}>
                <div className="flex gap-6 justify-between  max-w-[550px]  p-2.5">
                  <div className="flex ">
                    <div className="flex gap-2">
                      <Image
                        width={120}
                        height={120}
                        src={cartItem.product.image}
                        alt={cartItem.product.slug}
                        className="rounded-lg"
                      />
                      <div className="flex flex-col justify-between max-w-[200px] wr">
                        <h3 className="font-semibold">{cartItem.product.name}</h3>
                        <p></p>
                        <h3 className="font-bold">
                          {formatMoney({
                            priceCents: cartItem.product.priceCents * quantity,
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
                        onClick={() => decrement(cartItem.productId)}
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
                        onClick={() => increment(cartItem.productId)}
                      />
                    </div>
                  </div>
                </div>
                <hr className="w-[100%] border-gray-400" />
              </Fragment>
            );
          })}
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

export default CartPageClient;
