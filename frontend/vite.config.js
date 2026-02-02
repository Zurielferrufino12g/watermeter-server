import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // publicDir por defecto ya es "public", pero lo dejamos explícito:
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true, // ✅ deja esto en true
  },
});