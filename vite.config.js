import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/

const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:3001";

export default defineConfig({
  server: {
    port: 3000,
    // proxy: {
    //   "/api/chat": {
    //     target: API_BASE_URL,
    //     changeOrigin: true,
    //     secure: false,
    //     rewrite: (path) => path.replace(/^\/api\/chat/, "/api/v1/chat/completions"),
    //   },
    // },
  },
  preview: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [react()],
});
