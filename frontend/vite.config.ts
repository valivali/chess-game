import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Make sure process.env is not used in client code
    global: "globalThis"
  }
})
