import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://iandre.com',
  // Set SITE_BASE=/iandre to preview on adscorp100.github.io before DNS points at Pages.
  base: process.env.SITE_BASE || '/',
  build: { inlineStylesheets: 'always' },
  vite: {
    preview: { allowedHosts: ['.trycloudflare.com'] },
    server: { allowedHosts: ['.trycloudflare.com'] },
  },
});
