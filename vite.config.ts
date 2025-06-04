import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [ react(), tailwindcss() ],
  base: "./",
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "@public", replacement: path.resolve(__dirname, "public") },
    ],
  },
});
