import Link from "next/link";

const CartNavBar =  () => {
  return(
    <>
      <nav className="cart-nav font-serif">
  <Link href="/" className="cart-back ">
    ← Continue shopping
  </Link>

  <h2 className="cart-title">Your Cart</h2>

  <Link href="/signin" className="cart-signin">
    Sign in
  </Link>
</nav>;
    </>
  )
}
export default CartNavBar;
