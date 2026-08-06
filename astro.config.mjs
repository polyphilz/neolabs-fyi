// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Required for canonical URLs, og:url, and the sitemap.
  site: 'https://neolabs.fyi',

  // Fully static: every page is prerendered HTML, which is the whole point of
  // choosing Astro over a client-rendered SPA here.
  output: 'static',

  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});
