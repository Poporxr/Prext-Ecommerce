"use client";

import { formatMoney } from "@/utils/money";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/app/loading";
import OrdersNav from "./OrdersNav";
import { Order, OrderItem, Product } from "./types";


const Page = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [products, setProducts] = useState<
    (Product & { quantity: number; orderId: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (!userId) {
      setError("Missing userId");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?userId=${userId}`);

        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data: { success: boolean; orders: Order[] } = await res.json();
        setOrders(data.orders);


        // ✅ extract ONLY products from orders
        const extractedProducts = data.orders.flatMap((order: Order) =>
          order.items.map((item: OrderItem) => ({
            ...item.product,
            quantity: item.quantity,
            orderId: order.id,
          }))
        );

        setProducts(extractedProducts);
      } catch (err) {
        console.error(err);
        setError("Could not load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) return <Loading />;

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  if (products.length === 0) {
    return <div className="text-center mt-10">No orders found</div>;
  }

  return (
    <>
      <OrdersNav />
      <main className="grid grid-cols-2 mt-30 max-[446px]:flex flex-col">
        {orders.map((order) => (
          <div
            key={order.id}
            className="orders space-y-2 ml-auto mr-auto bg-white w-[90%] max-[446px]:w-[95%] rounded-2xl py-3 px-3 mb-10 font-serif"
          >
            {/* ORDER HEADER */}
            <div className="flex justify-between">
              <div className="bg-[#f9f9f9] py-2 px-6 border rounded-xl">
                <p className="text-gray-500">Order Date:</p>
                <h2 className="font-bold text-sm">
                  {new Date(order.createdAt._seconds * 1000).toDateString()}
                </h2>
              </div>

              <div className="bg-[#f9f9f9] py-2 px-6 border rounded-xl">
                <p className="text-gray-500">Status</p>
                <h2 className="font-bold capitalize">{order.status}</h2>
              </div>
            </div>

            {/* PRODUCTS */}
            {order.items.map((item: OrderItem) => {
              const product = item.product;

              return (
                <div key={item.id}>
                  <hr />
                  <div className="flex justify-between gap-4 rounded-2xl hover:bg-[#f4f4f4] transition py-2">
                    <div className="flex gap-4">
                      <div className="relative w-[80px] h-[70px] overflow-hidden rounded-xl shadow-sm">
                        <Image
                          fill
                          src={product.image}
                          alt={product.slug}
                          className="object-cover"
                        />
                      </div>

                      <div className="flex flex-col justify-between">
                        <Link
                          href={`/productDetails/${product.slug}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {product.name}
                        </Link>

                        <span className="text-sm font-semibold">
                          {formatMoney({ priceCents: product.priceCents })}
                        </span>

                        <span className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ORDER TOTALS */}
            <hr />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <p className="text-gray-500">Discount:</p>
                <span className="font-semibold">
                  {formatMoney({ priceCents: order.discountedSubtotal })}
                </span>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-500">Shipping:</p>
                <span className="font-semibold">
                  {formatMoney({ priceCents: order.shippingCents })}
                </span>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-500">Delivery:</p>
                <span className="font-semibold">
                  {formatMoney({ priceCents: order.deliveryFeeCents })}
                </span>
              </div>

              <hr />

              <div className="flex justify-between font-bold">
                <p>Total:</p>
                <span>{formatMoney({ priceCents: order.totalCents })}</span>
              </div>
            </div>
          </div>
        ))}
      </main>
    </>
  );
};

export default Page;
