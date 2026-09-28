import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The base path must match your GitHub repo name so assets resolve correctly
// on GitHub Pages: https://<username>.github.io/<repo-name>/
// Locally (npm run dev) Vite ignores base for dev-server routing, so this is safe.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/realtime-chat-app/',
});
