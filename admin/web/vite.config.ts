import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/vp000/",
  plugins: [react()],
  build: { outDir: "dist", sourcemap: false, target: "es2022" },
  server: { proxy: { "/vp000/api": "http://127.0.0.1:8090" } },
});
