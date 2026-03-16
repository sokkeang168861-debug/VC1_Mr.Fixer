import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

function resolvePort(value, fallback) {
  const parsedValue = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const backendTarget = env.VITE_DEV_BACKEND_URL || "http://localhost:5000";
  const basePath = env.VITE_BASE_PATH || "/";

  return {
    base: basePath,
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: env.VITE_DEV_HOST || "0.0.0.0",
      port: resolvePort(env.VITE_DEV_PORT, 5173),
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
        },
        "/uploads": {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: env.VITE_PREVIEW_HOST || "0.0.0.0",
      port: resolvePort(env.VITE_PREVIEW_PORT, 4173),
    },
    build: {
      target: "esnext",
      minify: "esbuild",
      sourcemap: env.VITE_BUILD_SOURCEMAP === "true",
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            ui: ["lucide-react", "motion", "react-icons"],
            charts: ["chart.js", "react-chartjs-2"],
            maps: ["@react-google-maps/api"],
          },
        },
      },
    },
  };
});
