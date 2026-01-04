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
  const [isCheckingOut, setIsCheckingOut] = useState(false);


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
  if (isCheckingOut) return;

  try {
    setIsCheckingOut(true);
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
    if (!response.ok) {
      throw new Error(result.error || "Failed to get payment summary");
    }
    router.push(`/checkout/${cartId}`);
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

      <div className="mt-24 px-4 font-serif">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white/90 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-black/5 p-4 max-[446px]:p-2">
          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.map((cartItem) => {
              const quantity =
                quantities[cartItem.id] ?? cartItem.quantity ?? 1;

              return (
                <Fragment key={cartItem.id}>
                  <div className="flex justify-between gap-4 rounded-2xl bg-[#f8f8f8] hover:bg-[#f4f4f4] transition p-3 max-[446px]:px-2">
                    {/* Left */}
                    <div className="flex gap-4">
                      <div className="relative w-[140px] h-[110px] max-[446px]:w-[90px] max-[446px]:h-[70px] overflow-hidden rounded-xl bg-white shadow-sm">
                        <Image
                          fill
                          src={cartItem.product.image}
                          alt={cartItem.product.slug}
                          className="object-cover"
                        />
                      </div>

                      <div className="flex flex-col justify-between">
                        <Link
                          href={`/productDetails/${cartItem.product.slug}`}
                          className="text-sm font-medium text-gray-900 hover:underline max-[446px]:text-[11px]"
                        >
                          {cartItem.product.name}
                        </Link>

                        <span className="text-md font-semibold text-gray-900">
                          {formatMoney({
                            priceCents: cartItem.product.priceCents * quantity,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col items-end justify-between">
                      {/* Delete */}
                      <Image
                        src="/images/delete.svg"
                        alt="Remove item"
                        width={16}
                        height={16}
                        className={`cursor-pointer opacity-60 hover:opacity-100 transition ${
                          deletingItems[cartItem.id]
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() => handleDeleteClick(cartItem.id)}
                      />

                      {/* Quantity */}
                      <div className="flex items-center gap-2 justify-center rounded-full bg-white shadow-inner border border-black/10 px-4 py-1.5">
                        <Image
                          alt="minus"
                          width={12}
                          height={10}
                          src="/images/Minus.svg"
                          className="cursor-pointer opacity-70 hover:opacity-100 transition"
                          onClick={() => decrement(cartItem.id)}
                        />

                        <span className="min-w-[18px] text-center text-sm font-medium text-gray-800">
                          {quantity}
                        </span>

                        <Image
                          alt="plus"
                          width={12}
                          height={14}
                          src="/images/Plus.svg"
                          className="cursor-pointer opacity-70 hover:opacity-100 transition"
                          onClick={() => increment(cartItem.id)}
                        />
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>

          {/* Checkout */}
          <button
            onClick={paymentSummary}
            disabled={isCheckingOut}
            className={`mt-6 w-full rounded-full py-3 text-sm font-semibold tracking-wide shadow-lg transition
    ${
      isCheckingOut
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-black text-white hover:bg-[#1c1c1c]"
    }`}
          >
            {isCheckingOut ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing…
              </span>
            ) : (
              "Secure Checkout"
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default CartPageClient;
