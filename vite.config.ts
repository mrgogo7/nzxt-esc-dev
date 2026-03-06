import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/nzxt-esc-dev/',
  server: {
    host: true,
  },
});
