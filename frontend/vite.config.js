// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": backendUrl,
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  base: "/",
});
