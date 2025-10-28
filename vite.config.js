import { defineConfig } from 'vite';
import { resolve } from 'path';

const htmlFiles = globSync('src/**/*.html');
const input = Object.fromEntries(
  htmlFiles.map(file => [
    file.slice(4, -5), // Remove 'src/' and '.html'
    resolve(__dirname, file)
  ])
);

export default defineConfig({
  root: 'src',
  base: process.env.DOCS_VERSION 
    ? `/cpac-docs/${process.env.DOCS_VERSION}/`
    : '/cpac-docs/develop/',
  build: {
    outDir: process.env.OUTDIR || '../cpac-docs/develop',
    emptyOutDir: false,
    rollupOptions: {
      input
    }
  },
  server: {
    headers: {
      'Cache-Control': 'no-store'
    },
    port: 5173
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  }
});
