import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy API calls to backend services in dev.
    // Uncomment and set your service URLs when backend is ready:
    // proxy: {
    //   "/api/marketplace": { target: "http://localhost:4001", changeOrigin: true },
    //   "/api/orders":      { target: "http://localhost:4002", changeOrigin: true },
    //   "/api/farmers":     { target: "http://localhost:4003", changeOrigin: true },
    // },
  },
});