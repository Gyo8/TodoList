import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
    manifest: {
      name: 'Ritmo · Organización personal', short_name: 'Ritmo', lang: 'es',
      description: 'Tareas y hábitos, un día a la vez.',
      start_url: '/', scope: '/', display: 'standalone',
      theme_color: '#285b42', background_color: '#fafaf7',
      icons: [192,512].map(size => ({src:`/icon-${size}.png`,sizes:`${size}x${size}`,type:'image/png',purpose:'any'})),
    },
    workbox: { globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'], navigateFallback: 'index.html', cleanupOutdatedCaches: true },
  })],
});
