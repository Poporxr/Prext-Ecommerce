
interface Name {
  name: string
}





const CartNavBar = ({name}: Name) => {


  return (
    <>
      <nav className="cart-nav font-serif">
        <button
          onClick={() => window.history.back()}
          className="max-[446px]:text-sm"
        >
          ← Back
        </button>

        <h2 className="font-medium max-[446px]:text-md">{name}</h2>
      </nav>
    </>
  );
};
export default CartNavBar;
