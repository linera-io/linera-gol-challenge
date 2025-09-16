import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react(), tsconfigPaths()],
  server: {
    fs: {
      allow: [".."],
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
      input: {
        index: "index.html",
        linera: "@linera/client",
      },
      preserveEntrySignatures: "strict",
    },
  },
});
