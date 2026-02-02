import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: "public", // ✅ ESTA LÍNEA ES LA CLAVE
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});