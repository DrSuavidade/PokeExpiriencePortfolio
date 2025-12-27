import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    esbuild: {
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
    build: {
      sourcemap: false,
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          manualChunks: {
            three: ["three"],
            r3f: ["@react-three/fiber", "@react-three/drei", "three-stdlib"],
            ui: ["lucide-react", "@lottiefiles/dotlottie-react"],
            state: ["zustand"],
          },
        },
      },
    },
  };
});
