import Link from "next/link";

const OrdersNav = () => {
  return (
    <nav className="checkout-nav font-serif">
      <Link href="/" className="checkout-back">
        ← Home
      </Link>

      <h2 className="checkout-title">Orders</h2>

      <span className="text-sm text-gray-400">Secure</span>
    </nav>
  );
}
export default OrdersNav;