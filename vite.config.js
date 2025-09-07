import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/AeroDeskLive/", // This is crucial for GitHub Pages
  build: {
    outDir: "dist", // This is the default, but good to specify
  },
});
