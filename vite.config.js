import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      workbox: {
        /* Que la versión nueva tome el control de inmediato en vez de
           quedarse esperando a que se cierren todas las pestañas. Sin
           esto, el teléfono sigue mostrando la versión vieja por días. */
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        /* Se agrega webp: sin esto los personajes y el emblema no se
           guardan, y en el gimnasio sin señal la app abriría con los
           huecos en blanco. */
        globPatterns: ["**/*.{js,css,html,svg,png,webp,ico}"],
      },
      manifest: {
        name: "Entrenamos",
        short_name: "Entrenamos",
        description: "Entrenamiento y alimentación para Ignacio y Linda",
        theme_color: "#0B0F14",
        background_color: "#F1F4FA",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      }
    })
  ]
});
