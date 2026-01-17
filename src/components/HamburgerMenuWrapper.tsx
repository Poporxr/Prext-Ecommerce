// components/HamburgerMenuWrapper.tsx
"use client";

import { ChakraProvider } from "@chakra-ui/react";
import HamburgerMenu from "./HamburgerMenu";
import { system } from "@/lib/chakra/customsystem";

export default function HamburgerMenuWrapper() {
  return (
    <ChakraProvider value={system}>
      <HamburgerMenu />
    </ChakraProvider>
  );
}
