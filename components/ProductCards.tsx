'use client';

import Image from "next/image";
import { formatMoney } from "../Utils/money";
import { products, Product } from "../Utils/products";
import Link from "next/link";
import { useState } from "react";

const ProductCard = () => {
  const [quantity, setQuantity] = useState(1);
  

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 0 ? prev - 1 : 0));

  return (
    <>
      {products.map((product: Product) => (
        <div  className="bg-[#f0f0f0] max-w-80 rounded-md m-2 shadow-lg relative" key={product.id}>
          <Link href={'/product'} className="absolute p-2 z-10 bg-[#ffffffcc] rounded-lg top-2 right-2 hover:scale-110 transition-transform duration-300 ease-out cursor-pointer">
            <Image
              alt="badge"
              width={20}
              height={20}
              src={'/icons/view-details.png'}
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
              {formatMoney({ priceCents: product.priceCents })}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-3">
                <Image alt="minus" width={20} height={20} src={'/icons/Minus.svg'} onClick={decrement} />
                <span className="px-3 py-1.5 rounded-sm bg-[#d9d9d9]">{quantity}</span>
                <Image alt="plus" className="transition-transform duration-300 ease-out cursor-pointer group-hover:scale-210" width={18} height={20} src={'/icons/Plus.svg'} onClick={increment} />
              </div>
              <button className="cart-btn">
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
