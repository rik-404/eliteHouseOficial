import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { version as pkgVersion } from './package.json';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
    https: false,
    fs: {
      allow: [__dirname]
    },
    hmr: {
      host: 'localhost',
      port: 8080,
      protocol: 'ws'
    },
    proxy: {
      // Configuração de proxy se necessário
    }
  },
  build: {
    // Gera um timestamp único para cada build
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        login: fileURLToPath(new URL('./src/components/auth/Login.tsx', import.meta.url)),
        admin: fileURLToPath(new URL('./src/pages/admin/Dashboard.tsx', import.meta.url))
      },
      output: {
        // Adiciona hash único para cada arquivo
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    assetsDir: '.',
    assetsInlineLimit: 4096,
    // Gera um manifest para rastreamento de assets
    manifest: true,
    // Garante que o HTML seja atualizado com os novos hashes
    emptyOutDir: true
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkgVersion),
  },
  plugins: [
    react(),
    {
      name: 'copy-service-worker',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'service-worker.js',
          source: fs.readFileSync(path.resolve(__dirname, 'src/service-worker.js'), 'utf-8')
        });
      }
    },
    {
      name: 'copy-htaccess',
      generateBundle() {
        // Verifica se o arquivo .htaccess existe na raiz do projeto
        const htaccessPath = path.resolve(__dirname, '.htaccess');
        if (fs.existsSync(htaccessPath)) {
          this.emitFile({
            type: 'asset',
            fileName: '.htaccess',
            source: fs.readFileSync(htaccessPath, 'utf-8')
          });
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
