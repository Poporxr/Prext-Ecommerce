import Link from "next/link";

const NavBar = () =>{
  return (
    <nav className="nav-bar">
      <div className="flex gap-1 bg-black max-w-100 items-center justify-center p-1.5 rounded-3xl ">
        <Link className="nav-links" href={'/Home'}>Home</Link>
        <Link className="nav-links" href={'/accessories'}>Accessories</Link>
        <Link className="nav-links" href={'/about'}>About</Link>
        <Link className="nav-links" href={'/contact'}>Contact</Link>
      </div>
      <div className="flex gap-1 bg-black max-w-100 items-center justify-center p-1.5 rounded-3xl  ">
        <Link className="nav-links" href={'/signin'}>Sign In</Link>
        <Link className="nav-links" href={'/cart'}>Cart</Link>
      </div>
    </nav>
  );
}

export default NavBar;