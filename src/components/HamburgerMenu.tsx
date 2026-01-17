"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/useAuth";
import { auth } from "@/lib/firebase/firebase";
import { Auth, signOut as firebaseSignOut } from "firebase/auth";
import {
  Drawer,
  DrawerTrigger,
  DrawerPositioner,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
  DrawerCloseTrigger,
  CloseButton,
  Portal,
  Button,
} from "@chakra-ui/react";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const userEmail = user?.email || "Guest";
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
    <Drawer.Root
      id="hamburger-menu-drawer"
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      placement="start"
    >
      {/* Hamburger Button */}
      <DrawerTrigger asChild>
        <button
          className="flex lg:hidden p-2 rounded-full hover:bg-black/5 transition"
          aria-label="Toggle menu"
          suppressHydrationWarning
        >
          <Image
            src="/images/hamburger.svg"
            alt="hamburger"
            width={36}
            height={36}
          />
        </button>
      </DrawerTrigger>

      <Portal>
        <DrawerBackdrop className="backdrop-blur-sm bg-black/30" />

        <DrawerPositioner>
          <DrawerContent
            bg="white"
            className="
              w-70
              h-full
              rounded-r-[28px]
              shadow-2xl
              border-r border-black/10
              px-4
              pt-5
              overflow-visible
            "
          >

            {/* Close Button */}
            <DrawerCloseTrigger asChild>
              <CloseButton
                size="lg"
                className="
                absolute
                top-4
                right-4
                rounded-full
                hover:bg-black/10
                z-50
              "
              />
            </DrawerCloseTrigger>


            {/* Header */}
            <DrawerHeader className="pb-4 border-b border-black/10">
              <DrawerTitle>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center">
                    <Image
                      src="/images/user.svg"
                      alt="User"
                      width={26}
                      height={26}
                    />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-black">
                      Account
                    </span>
                    <span className="text-xs text-black/60 truncate max-w-45">
                      {userEmail}
                    </span>
                  </div>
                </div>
              </DrawerTitle>
            </DrawerHeader>

            {/* Body */}
            <DrawerBody className="px-0 pt-6">
              <nav className="flex flex-col gap-3">
                {!user && (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="
                    flex items-center gap-3
                    px-4 py-3
                    rounded-xl
                    bg-black/5
                    hover:bg-black/10
                    transition
                   text-black/90 font-medium
                    "
                  >
                    <Image
                      src="/images/sign-in.svg"
                      width={22} height={22}
                      alt="Login"
                    />
                   <span> Login</span>
                  </Link>
                )}

              {user && (
                                <Link
                  href={`/orders?userId=${user?.uid}`}
                  onClick={() => setOpen(false)}
                  className="
                    flex items-center gap-3
                    px-4 py-3
                    rounded-xl
                    bg-black/5
                    hover:bg-black/10
                    transition
                   text-black/90 font-medium
                  "
                >
                  <Image
                    src="/images/orders.svg"
                    width={22}
                    height={22}
                    alt="Orders"
                  />
                  <span className="font-medium">Orders</span>
                </Link> )}

              {user && (

                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="
                    flex items-center gap-3
                    px-4 py-3
                    rounded-xl
                    bg-black/5
                    hover:bg-black/10
                    transition
                    text-black/90
                    font-medium
                  "
                >
                  <Image
                    src="/images/cart-icon.svg"
                    alt="Cart"
                    width={20}
                    height={20}
                  />
                  <span className="font-medium">Cart</span>
                </Link>
              )}

              </nav>
            </DrawerBody>

            {/* Footer */}
            <DrawerFooter className="px-0 pt-6 border-t border-black/10">
            {user && (
              <Button
              variant="ghost"
              className="
                w-full
                flex
                items-center
                gap-3
                justify-center
                text-red-600
                hover:bg-red-50
              "
              onClick={handleSignOut}
            >
                <Image src={'/images/sign-out.svg'} width={20} height={20} alt="Sign Out" />
                <p className="text-red-600">Log Out</p>
              </Button>)}
              <p className="text-xs text-black/40 text-center w-full">
                © {new Date().getFullYear()} Prext
              </p>
            </DrawerFooter>
          </DrawerContent>
        </DrawerPositioner>
      </Portal>
    </Drawer.Root>
  );
}
