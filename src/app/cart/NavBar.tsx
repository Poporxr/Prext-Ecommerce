import Link from "next/link";

const CartNavBar =  () => {
  return (
    <>
      <nav className="cart-nav font-serif">
        {/* Back */}
        <Link href="/" className="cart-back">
          ← Back
        </Link>

        {/* Title */}
        <h2 className="cart-title">Cart</h2>

        {/* Right action */}
        <span className="cart-signin">Secure</span>
      </nav>
    </>
  );
}
export default CartNavBar;
