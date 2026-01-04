import Link from "next/link";

const CheckoutNav = () => {
  return (
    <nav className="checkout-nav font-serif">
      <Link href="/cart" className="checkout-back">
        ← Cart
      </Link>

      <h2 className="checkout-title">Checkout</h2>

      <span className="text-sm text-gray-400">Secure</span>
    </nav>
  );
}
export default CheckoutNav;