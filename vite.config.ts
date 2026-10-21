import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            sourcemaps: {
              filesToDeleteAfterUpload: ["./dist/**/*.map"],
            },
          }),
        ]
      : []),
  ],
  build: {
    sourcemap: "hidden",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // Dev server only: lets the home ranking read the dev catalog while every other API stays local.
  // Only GET product lists pass, without cookies or tokens.
  server: {
    proxy: {
      "^/__dev-catalog/api/v1/items(\\?|$)": {
        bypass: (request) => (request.method === "GET" ? undefined : false),
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyRequest) => {
            proxyRequest.removeHeader("authorization");
            proxyRequest.removeHeader("cookie");
          });
        },
        rewrite: (path) => path.replace(/^\/__dev-catalog/, ""),
        target: "https://api-dev.bookjeok.site",
      },
    },
  },
});
