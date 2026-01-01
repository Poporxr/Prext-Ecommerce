import Link from "next/link";


interface Name {
  name: string
}





const CartNavBar = ({name}: Name) => {


  return (
    <>
      <nav className="cart-nav font-serif">
        <button onClick={() => window.history.back()} className="bg-[#c5c5c5] p-2.5 rounded-[20px]">
          ← Continue shopping
        </button>

        <h2 className="font-bold">{name}</h2>

        <Link href="/signin" className="cart-signin">
          Sign in
        </Link>
      </nav>
      ;
    </>
  );
};
export default CartNavBar;
