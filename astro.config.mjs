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

  // The table used to be its own page; it is now a view of the explorer, which
  // is what lets it share filter state with the canvas. Inbound links to the
  // old URL still have to land somewhere.
  redirects: {
    '/table': '/?view=table',
  },

  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});
