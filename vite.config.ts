import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Plugin to safeguard Vite HMR / WebSocket client calls when HMR is disabled
function safeViteHmrPlugin() {
  return {
    name: "safe-vite-hmr",
    enforce: "post" as const,
    transform(code: string, id: string) {
      if (
        id.includes("@vite/client") ||
        id.includes("client.mjs") ||
        id.includes("bundledDevClient.mjs")
      ) {
        return code
          .replace(/ws\.send\(/g, "ws?.send?.(")
          .replace(/this\.transport\.send\(/g, "this.transport?.send?.(")
          .replace(/wsTransport\.send\(/g, "wsTransport?.send?.(");
      }
      return null;
    },
  };
}

export default defineConfig(() => {
  const baseSlug = "/saku-simpan/";
  return {
    base: baseSlug,
    plugins: [
      react(),
      tailwindcss(),
      safeViteHmrPlugin(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "inline",
        manifest: {
          id: baseSlug,
          name: "sAku simpan",
          short_name: "sAku simpan",
          description:
            "Aplikasi penyimpanan wishlist dan produk pribadi sAku simpan.",
          theme_color: "#F9F6F0",
          background_color: "#F9F6F0",
          display: "standalone",
          start_url: baseSlug,
          scope: baseSlug,
          icons: [
            {
              src: "icon.svg",
              sizes: "192x192 512x512",
              type: "image/svg+xml",
              purpose: "any",
            },
          ],
        },
        workbox: {
          navigateFallback: `${baseSlug}index.html`,
          navigateFallbackAllowlist: [new RegExp(`^${baseSlug}`)],

          skipWaiting: true,
          clientsClaim: true,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "."),
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
    },
  };
});
