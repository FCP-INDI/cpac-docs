import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../cpac-docs',
    emptyOutDir: true
  },
  server: {
    headers: {
      'Cache-Control': 'no-store'
    },
    port: 5173
  }
});
