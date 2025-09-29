import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svgr({
      include: '**/*.svg',
      svgrOptions: {
        exportType: 'default',
        icon: true,
      },
    }),
    react(),
    tailwindcss(),
  ],
});
