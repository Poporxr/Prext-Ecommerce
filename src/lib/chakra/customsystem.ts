import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// Define a custom Chakra system without global CSS / reset
const customConfig = defineConfig({
  preflight: false, // disables global CSS reset
  globalCss: {},    // disables global base styles
});

export const system = createSystem(defaultConfig, customConfig);
