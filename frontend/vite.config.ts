import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "",
  plugins: [react(), tsconfigPaths()],
  server: {
    fs: {
      allow: ["..", "../../linera-protocol"],
    },
    headers: {
      "Cross-Origin-Embedder-Policy": "credentialless",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  },
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  optimizeDeps: {
    exclude: ["@linera/client"],
  },
  build: {
    rollupOptions: {
      external: ["@linera/client"],
    },
  },
});
