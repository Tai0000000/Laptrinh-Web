import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      // Dùng polling để detect file changes trong Docker (không có inotify)
      usePolling: true,
      interval: 500,
    },
  },
});
