import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="nav-bar">
      <div className="flex gap-1 bg-black max-w-300 items-center justify-center p-1.5 rounded-3xl ">
        <Link className="nav-links" href={'/'}>Home</Link>
        <Link className="nav-links" href={'/accessories'}>Accessories</Link>
        <Link className="nav-links" href={'/about'}>About</Link>
       <input placeholder="Search..."
          className="bg-[#f0f0f0] rounded-full px-4 py-1.5 w-60 focus:outline-none"
        />
      </div>
      <div className="flex  bg-black max-w-100 items-center justify-center p-1.5 rounded-3xl">
 
      </div>
      <div className="flex gap-1 bg-black max-w-100 items-center justify-center p-1.5 rounded-3xl  ">
        <Link className="nav-links" href={'/signin'}>Sign In</Link>
        <Link className="nav-links flex gap-1" href={'/cart'}>
          <Image src="/Icons/cart-icon.svg" alt="Cart" width={20} height={20} />
          Cart</Link>
        <Link className="nav-links flex gap-1" href={'/profile'}>
          <Image src="/Icons/user-profile.svg" alt="Cart" width={20} height={20} />
          Profile</Link>
      </div>
    </nav>
  );
}

export default NavBar;