import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

declare const process: any;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,

    allowedHosts: [process.env.FRONTEND_HOST || "lit-contact-frontend.liam-gattegno.fr"],
    watch: {
      usePolling: process.env.CHOKIDAR_USEPOLLING === "true",
      interval: Number(process.env.CHOKIDAR_INTERVAL ?? 100),
    },
    proxy: {
      "/api": {
        target: process.env.BACKEND_HOST
          ? `https://${process.env.BACKEND_HOST}`
          : "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@full-stack-js/shared": resolve(
        __dirname,
        "../packages/shared/src/index.ts",
      ),
    },
  },
  optimizeDeps: {
    include: ["@full-stack-js/shared"],
  },
});
