import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "",
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    // {
    //   name: 'configure-response-headers',
    //   configureServer: (server) => {
    //     server.middlewares.use((_req, res, next) => {
    //       // More permissive CORS headers for Dynamic SDK
    //       res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    //       res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    //       // Remove Cross-Origin-Resource-Policy to allow Dynamic SDK resources
    //       res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    //       next();
    //     });
    //   },
    // },
  ],
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
