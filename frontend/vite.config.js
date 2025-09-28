// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:7000",
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  base: "/",
});
