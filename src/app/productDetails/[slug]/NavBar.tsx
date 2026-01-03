
interface Name {
  name: string
}





const CartNavBar = ({name}: Name) => {


  return (
    <>
      <nav className="cart-nav font-serif ">
        <button
          onClick={() => window.history.back()}
          className="bg-[#c5c5c5] p-2.5 rounded-[20px] max-[446px]:w-20 max-[446px]:text-sm"
        >
          ← Back
        </button>

        <h2 className="font-bold max-[446px]:text-sm">{name}</h2>
      </nav>
    </>
  );
};
export default CartNavBar;
