import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    watch: {
      usePolling: process.env.CHOKIDAR_USEPOLLING === "true",
      interval: Number(process.env.CHOKIDAR_INTERVAL ?? 100),
    },
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:3000",
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
