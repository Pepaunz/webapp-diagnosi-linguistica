import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permette connessioni da altri dispositivi
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001', 
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
});
