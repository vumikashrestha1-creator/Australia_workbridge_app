// =============================================================
// vite.config.js
// PURPOSE: Vite configuration
// strictPort: true means it MUST use port 5173 or fail
// =============================================================

import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,  // never auto-switch to another port
  },
})