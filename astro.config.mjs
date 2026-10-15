import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://iandre.com',
  build: { inlineStylesheets: 'always' },
  vite: {
    preview: { allowedHosts: ['.trycloudflare.com'] },
    server: { allowedHosts: ['.trycloudflare.com'] },
  },
});
