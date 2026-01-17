"use client"
import Image from "next/image";
import Link from "next/link";
import HamburgerMenu from "./HamburgerMenu";
import { useAuth } from "@/lib/useAuth";
import { auth } from "@/lib/firebase/firebase";
import { Auth, signOut as firebaseSignOut } from "firebase/auth";
import HamburgerMenuWrapper from "./HamburgerMenuWrapper";

const NavBar = () => {
  const {user} = useAuth();
  const handleSignOut = () => {
  firebaseSignOut(auth)
    .then(() => {
      // Sign-out successful
      console.log("User signed out");
      // Optionally redirect to login page
      // router.push("/login");
    })
    .catch((error) => {
      console.error("Error signing out:", error);
    });
}


  return (
    <nav className="nav-bar w-[90%] fixed  left-0 right-0 p-1 z-50 mx-auto max-w-7xl max-[600px]:flex-col max-[600px]:gap-3 font-serif">
      <div className="flex gap-1 bg-[#a8a5a5f1]  max-w-400 items-center justify-center p-1.5 rounded-3xl max-[446px]:hidden max-[990px]:hidden">
        <Link className="nav-links flex gap-1" href={"/"}>
          <Image src="/images/home.svg" width={17} height={20} alt="Logo" />
          <p>Home</p>
        </Link>
        <Link className="nav-links flex gap-1" href={`/orders?userId=${user?.uid}`}>
          <Image src="/images/orders.svg" width={25} height={25} alt="Orders" />
         <p>Orders</p>
        </Link>
      </div>
      <div className="  max-[446px]:hidden max-[990px]:hidden">
        <input
          placeholder="Search..."
          className="bg-[#f0f0f0] rounded-full  py-1.5 w-70 focus:outline-none  search-input"
        />
      </div>

      <div className="flex gap-1 items-center lg:bg-[#a8a5a5f1] lg:p-1.5 justify-between pt-0.5 rounded-3xl max-[446px]:rounded-4xl  max-[600px]:w-full max-[990px]:w-full max-[990px]:rounded-4xl">

        <Image className="sm:hidden lg:hidden" src={'/images/prext-logo.png'} width={120} height={80} alt="logo" />

        <HamburgerMenuWrapper />


        {user ? 
          <Link
          className="nav-links flex gap-1 max-[446px]:hidden max-[990px]:hidden"
          href={"/signup"}
          onClick={handleSignOut}
        >
          <Image 
            src="/images/sign-out.svg"
            alt="Sign Out"
            width={20}
            height={20}
          />
          <p>Sign Out</p>
        </Link>
        :         <Link
          className="nav-links flex gap-1 max-[446px]:hidden max-[990px]:hidden"
          href={"/signup"}
        >
          <Image 
            src="/images/sign-in.svg"
            alt="Sign Up"
            width={20}
            height={20}
          />
          <p>Log In</p>
        </Link>}

        <Link
          className="nav-links flex gap-1 max-[446px]:hidden max-[990px]:hidden"
          href={"/cart"}
        >
          <Image
            src="/images/cart-icon.svg"
            alt="Cart"
            width={20}
            height={20}
          />
          Cart
        </Link>

        <Link
          className="nav-links flex gap-1 max-[446px]:hidden max-[990px]:hidden"
          href={"/profile"}
        >
          <Image
            src="/images/user-profile.svg"
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


