import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="nav-bar w-[90%] fixed  left-0 right-0 p-1 z-50 mx-auto max-w-7xl max-[600px]:flex-col max-[600px]:gap-3 font-serif">
      <div className="flex gap-1 bg-[#a8a5a5f1] max-w-400 items-center justify-center p-1.5 rounded-3xl max-[446px]:hidden">
        <Link className="nav-links" href={"/"}>
          Home
        </Link>
        <Link className="nav-links" href={"/accessories"}>
          Accessories
        </Link>
        <Link className="nav-links" href={"/orders"}>
          Orders
        </Link>
      </div>
      <div className="  max-[446px]:hidden ">
        <input
          placeholder="Search..."
          className="bg-[#f0f0f0] rounded-full  py-1.5 w-70 focus:outline-none  search-input"
        />
      </div>

      <div className="flex gap-1 bg-[#a8a5a5f1] items-center justify-between p-1.5 rounded-3xl max-[446px]:rounded-4xl  max-[600px]:w-full">
        <Link href={""} className="nav-links lg:hidden md:hidden">
          <Image
            src={"/images/icons/hamburger.svg"}
            alt="hmburger"
            width={40}
            height={40}
          />
        </Link>

        <Link className="nav-links lg:hidden md:hidden " href={"/cart"}>
          <Image
            src="/images/icons/cart-icon.svg"
            alt="Cart"
            width={30}
            height={30}
          />
        </Link>

        <Link className="nav-links max-[446px]:hidden" href={"/signup"}>
          Sign Up
        </Link>

        <Link
          className="nav-links flex gap-1 max-[446px]:hidden "
          href={"/cart"}
        >
          <Image
            src="/images/icons/cart-icon.svg"
            alt="Cart"
            width={20}
            height={20}
          />
          Cart
        </Link>

        <Link
          className="nav-links flex gap-1 max-[446px]:hidden"
          href={"/profile"}
        >
          <Image
            src="/images/icons/user-profile.svg"
            alt="Cart"
            width={20}
            height={20}
          />
          Profile
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
