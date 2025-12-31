import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="nav-bar w-[90%] fixed  left-0 right-0 p-1 z-50 mx-auto max-w-7xl max-[600px]:flex-col max-[600px]:gap-3">
      <div className="flex gap-1 bg-[#a8a5a5f1] max-w-400 items-center justify-center p-1.5 rounded-3xl ">
        <Link className="nav-links" href={"/"}>
          Home
        </Link>
        <Link className="nav-links" href={"/accessories"}>
          Accessories
        </Link>
        <Link className="nav-links" href={"/about"}>
          About
        </Link>
   
      </div>
     <div className="   ">  
           <input
          placeholder="Search..."
          className="bg-[#f0f0f0] rounded-full  py-1.5 w-70 focus:outline-none  search-input"
        />
     </div>

      <div className="flex gap-1 bg-[#a8a5a5f1] items-center justify-between p-1 rounded-3xl   max-[600px]:w-full">
        <Link className="nav-links" href={"/signin"}>
          Sign In
        </Link>
        <Link className="nav-links flex gap-1 " href={"/cart"}>
          <Image src="/Icons/cart-icon.svg" alt="Cart" width={20} height={20} />
          Cart
        </Link>
        <Link className="nav-links flex gap-1" href={"/profile"}>
          <Image
            src="/Icons/user-profile.svg"
            alt="Cart"
            width={20}
            height={20}
          />
          Profile
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;