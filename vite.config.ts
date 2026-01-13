import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // VitePWA({
    //   registerType: "autoUpdate",
    //   includeAssets: ["favicon.svg", "robots.txt", "icons/*"],
    //   manifest: {
    //     name: "The Tavlo",
    //     short_name: "Tavlo",
    //     description: "Gestión inteligente de tareas, reuniones y documentos",
    //     theme_color: "#ffffff",
    //     background_color: "#ffffff",
    //     display: "standalone",
    //     start_url: "/",
    //     icons: [
    //       {
    //         src: "icons/icon-192x192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //       {
    //         src: "icons/icon-512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         src: "icons/icon-512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //         purpose: "any maskable",
    //       },
    //     ],
    //   },
    //   devOptions: {
    //     enabled: true,
    //   },
    // }),
  ],
  resolve: {
    alias: {
      "#components": path.resolve(__dirname, "src/components"),
      "#core": path.resolve(__dirname, "src/core"),
      "#features": path.resolve(__dirname, "src/features"),
      "#shared": path.resolve(__dirname, "src/shared"),
      "#pages": path.resolve(__dirname, "src/pages"),
      "#elements": path.resolve(__dirname, "src/elements"),
    },
  },
});
