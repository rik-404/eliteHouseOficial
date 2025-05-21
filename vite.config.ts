import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        login: fileURLToPath(new URL('./src/components/auth/Login.tsx', import.meta.url)),
        admin: fileURLToPath(new URL('./src/pages/admin/Dashboard.tsx', import.meta.url))
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]'
      }
    },
    assetsDir: '.',
    assetsInlineLimit: 4096,
    manifest: true
  },
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: [__dirname]
    },
    hmr: {
      host: "localhost",
      port: 8080,
      protocol: "ws"
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
