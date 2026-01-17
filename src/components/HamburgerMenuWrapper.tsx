// components/HamburgerMenuWrapper.tsx
"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider } from "@/components/ui/color-mode";
import HamburgerMenu from "./HamburgerMenu";
import { system } from "@/lib/chakra/customsystem";

export default function HamburgerMenuWrapper() {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <HamburgerMenu />
      </ColorModeProvider>
    </ChakraProvider>
  );
}
