// vite.config.ts
import { defineConfig } from "file:///D:/backup/05-04-25%2000h54m/elite-house-hub-main/node_modules/vite/dist/node/index.js";
import react from "file:///D:/backup/05-04-25%2000h54m/elite-house-hub-main/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///D:/backup/05-04-25%2000h54m/elite-house-hub-main/node_modules/lovable-tagger/dist/index.js";
import { fileURLToPath } from "url";
var __vite_injected_original_dirname = "D:\\backup\\05-04-25 00h54m\\elite-house-hub-main";
var __vite_injected_original_import_meta_url = "file:///D:/backup/05-04-25%2000h54m/elite-house-hub-main/vite.config.ts";
var vite_config_default = defineConfig(({ mode }) => ({
  base: "/",
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", __vite_injected_original_import_meta_url)),
        login: fileURLToPath(new URL("./src/components/auth/Login.tsx", __vite_injected_original_import_meta_url)),
        admin: fileURLToPath(new URL("./src/pages/admin/Dashboard.tsx", __vite_injected_original_import_meta_url))
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]"
      }
    },
    assetsDir: "assets",
    assetsInlineLimit: 4096,
    manifest: true
  },
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: [__vite_injected_original_dirname]
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxiYWNrdXBcXFxcMDUtMDQtMjUgMDBoNTRtXFxcXGVsaXRlLWhvdXNlLWh1Yi1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxiYWNrdXBcXFxcMDUtMDQtMjUgMDBoNTRtXFxcXGVsaXRlLWhvdXNlLWh1Yi1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9iYWNrdXAvMDUtMDQtMjUlMjAwMGg1NG0vZWxpdGUtaG91c2UtaHViLW1haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gJ3BhdGgnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgYmFzZTogJy8nLFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGlucHV0OiB7XG4gICAgICAgIG1haW46IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9pbmRleC5odG1sJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAgIGxvZ2luOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL2NvbXBvbmVudHMvYXV0aC9Mb2dpbi50c3gnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICAgYWRtaW46IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvcGFnZXMvYWRtaW4vRGFzaGJvYXJkLnRzeCcsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgICB9LFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS5qcycsXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS5qcycsXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS5bZXh0XSdcbiAgICAgIH1cbiAgICB9LFxuICAgIGFzc2V0c0RpcjogJ2Fzc2V0cycsXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDQwOTYsXG4gICAgbWFuaWZlc3Q6IHRydWVcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gICAgZnM6IHtcbiAgICAgIGFsbG93OiBbX19kaXJuYW1lXVxuICAgIH1cbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJlxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVSxTQUFTLG9CQUFvQjtBQUNuVyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBQ2hDLFNBQVMscUJBQXFCO0FBSjlCLElBQU0sbUNBQW1DO0FBQWtLLElBQU0sMkNBQTJDO0FBUTVQLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsT0FBTztBQUFBLFFBQ0wsTUFBTSxjQUFjLElBQUksSUFBSSxnQkFBZ0Isd0NBQWUsQ0FBQztBQUFBLFFBQzVELE9BQU8sY0FBYyxJQUFJLElBQUksbUNBQW1DLHdDQUFlLENBQUM7QUFBQSxRQUNoRixPQUFPLGNBQWMsSUFBSSxJQUFJLG1DQUFtQyx3Q0FBZSxDQUFDO0FBQUEsTUFDbEY7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLElBQ1gsbUJBQW1CO0FBQUEsSUFDbkIsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLElBQUk7QUFBQSxNQUNGLE9BQU8sQ0FBQyxnQ0FBUztBQUFBLElBQ25CO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQSxFQUNsQixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
