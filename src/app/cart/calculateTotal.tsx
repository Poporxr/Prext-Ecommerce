import { CartItems } from "./CartPageClient";

function calculateCartTotals(cartItems: CartItems[]) {
  const subtotalCents = cartItems.reduce((sum, item) => {
    return sum + item.product.priceCents * item.quantity;
  }, 0);

  // Shipping: only if subtotal < $60
  const shippingCents = subtotalCents < 6000 ? 1500 : 0; // example: $15 shipping

  // Discount: 20% if subtotal > $200
  const discountCents =
    subtotalCents > 20000 ? Math.round(subtotalCents * 0.2) : 0;

  // Delivery fee: 10% of subtotal
  const deliveryFeeCents = Math.round(subtotalCents * 0.1);

  const totalCents =
    subtotalCents + shippingCents + deliveryFeeCents - discountCents;

  return {
    subtotalCents,
    shippingCents,
    discountCents,
    deliveryFeeCents,
    totalCents,
  };
}
export default calculateCartTotals