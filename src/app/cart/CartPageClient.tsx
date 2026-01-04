"use client";

import Image from "next/image";
import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/firebase";
import { formatMoney } from "@/utils/money";
//import calculateCartTotals from "./calculateTotal";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Loading from "../loading";

interface SizesShape {
  small: "S";
  medium: "M";
  large: "L";
  xl: "XL";
  xxl: "XXL";
  defaultSize: "S" | "M" | "L" | "XL" | "XXL";
}

export interface Product {
  firestoreId?: string;
  id: number;
  image: string;
  name: string;
  slug: string;
  description: string;
  sizes: SizesShape;
  priceCents: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface CartItems {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  product: Product;
}

export interface Totals {
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}

export interface Props {
  cartItems: CartItems[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItems[]>>;
}

const CartPageClient = ({ cartItems, setCartItems }: Props) => {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [deletingItems, setDeletingItems] = useState<Record<string, boolean>>(
    {}
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Initialize quantities from cart items
  useEffect(() => {
    const initialQuantities: Record<string, number> = {};
    cartItems.forEach((item) => {
      initialQuantities[item.id] = item.quantity;
    });
    setQuantities(initialQuantities);
  }, [cartItems]);

  // Calculate totals whenever cartItems or quantities change
  /*const totals = calculateCartTotals(
    cartItems.map((item) => ({
      ...item,
      quantity: quantities[item.id] ?? item.quantity,
    }))
  );*/

  const handleDeleteClick = (cartItemId: string) => {
    setItemToDelete(cartItemId);
    setDeleteDialogOpen(true);
  };

  const deleteCartItem = async () => {
    if (!itemToDelete) return;

    const cartItemId = itemToDelete;
    setDeleteDialogOpen(false);
    setDeletingItems((prev) => ({ ...prev, [cartItemId]: true }));

    try {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/signup");
          return;
        }
        throw new Error(result.error || "Failed to delete item");
      }

      // Remove the item from state
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      setQuantities((prev) => {
        const updated = { ...prev };
        delete updated[cartItemId];
        return updated;
      });
      setItemToDelete(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      alert(err instanceof Error ? err.message : "Failed to delete item");
      setItemToDelete(null);
    } finally {
      setDeletingItems((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  const increment = (cartItemId: string) => {
    const currentQuantity = quantities[cartItemId] ?? 1;
    const newQuantity = currentQuantity + 1;
    setQuantities((prev) => ({
      ...prev,
      [cartItemId]: newQuantity,
    }));
  };

  const decrement = (cartItemId: string) => {
    const currentQuantity = quantities[cartItemId] ?? 1;
    const newQuantity = Math.max(1, currentQuantity - 1);
    setQuantities((prev) => ({
      ...prev,
      [cartItemId]: newQuantity,
    }));
  };

  const paymentSummary = async () => {
    try {
      <Loading />
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      const firebaseToken = await user.getIdToken();
      const cartId = cartItems.length > 0 ? cartItems[0].userId : null;

      if (!cartId) {
        alert("Cart is empty");
        return;
      }

      const response = await fetch(`/api/checkout/summary/${cartId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: quantities[item.id] ?? item.quantity,
          })),
        }),
      });

      const result = await response.json();
      console.log(result)
      if (!response.ok) {
        throw new Error(result.error || "Failed to get payment summary");
      }
      router.push(`/checkout/${cartId}`)
    } catch (err) {
      console.error("Error getting payment summary:", err);
      alert(err instanceof Error ? err.message : "Failed to get payment summary");
    }
  };

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item from cart?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your cart? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={deleteCartItem}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mt-20 max-[446px]:pl-3 pl-20 font-serif ">
        <div className="flex w-[100%] flex-col ">
          <div className="w-[90%] max-[446px]:w-[97%] p-1.5 bg-[#c4c2c2]  flex  flex-col items-center justify-center rounded-[50px] shadow-2xl mt-10 ">
            <div className="cart-items  w-[100%] rounded-[45px] shadow-2xl bg-[#eae8e8] p-5">
              {cartItems.map((cartItem) => {
                const quantity =
                  quantities[cartItem.id] ?? cartItem.quantity ?? 1;
                return (
                  <Fragment key={cartItem.id}>
                    <div className="flex gap-6 justify-between p-2.5 ">
                      <div className="flex ">
                        <div className="flex gap-2">
                          <div className="relative overflow-hidden w-[150px] max-[446px]:w-[120px] max-[446px]:h-[80px] h-[120px]">
                            <Image
                              fill
                              src={cartItem.product.image}
                              alt={cartItem.product.slug}
                              className="rounded-lg object-cover"
                            />
                          </div>

                          <div className="flex flex-col justify-between ">
                            <Link
                              href={`/productDetails/${cartItem.product.slug}`}
                              className="max-[446px]:text-sm"
                            >
                              {cartItem.product.name}
                            </Link>
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
                        {/* delete icon */}
                        <Image
                          src="/images/delete.svg"
                          alt="Remove item"
                          width={18}
                          height={18}
                          className={`cursor-pointer opacity-70 hover:opacity-100 transition mb-2 ${
                            deletingItems[cartItem.id]
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => handleDeleteClick(cartItem.id)}
                        />

                        {/* quantity control – now matches product page */}
                        <div className="flex items-center gap-2 rounded-full border px-3 py-1">
                          <Image
                            alt="minus"
                            className={
                              "cursor-pointer opacity-70 hover:opacity-100 transition "
                            }
                            width={14}
                            height={14}
                            src="/images/Minus.svg"
                            onClick={() => decrement(cartItem.id)}
                          />

                          <span className="min-w-[20px] text-center text-sm font-medium">
                            {quantity}
                          </span>

                          <Image
                            alt="plus"
                            className={
                              "cursor-pointer opacity-70 hover:opacity-100 transition"
                            }
                            width={14}
                            height={14}
                            src="/images/Plus.svg"
                            onClick={() => increment(cartItem.id)}
                          />
                        </div>
                      </div>
                    </div>
                    <hr className="w-[100%] border-gray-400 mb-7" />
                  </Fragment>
                );
              })}
              <button
                onClick={()=>{paymentSummary()}}
                className="mt-20 p-4 font-semibold rounded-full text-white bg-[#0a1429] cursor-pointer hover:bg-[#172c58]"
              >
                Check Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPageClient;
