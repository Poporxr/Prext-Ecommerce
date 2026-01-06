"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

  return (
    <div className="relative w-full lg:hidden " ref={ref}>
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex  lg:hidden p-1 "
        aria-label="Toggle menu"
      >
          <Image
            src={"/images/hamburger.svg"}
            alt="hmburger"
            width={40}
            height={40}
          />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute mt-2.5 w-[98%] rounded-[20px] bg-white shadow-lg border">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 hover:bg-gray-100"
          >
            Login 
          </Link>
          <Link
            href="/odrers"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 hover:bg-gray-100"
          >
            Orders
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 hover:bg-gray-100"
          >
           Profile
          </Link>
        </div>
      )}
    </div>
  );
}
