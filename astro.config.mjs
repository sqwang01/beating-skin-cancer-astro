// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

import checklistPdfs from './integrations/checklist-pdfs.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.beatingskincancer.com',
  trailingSlash: 'never',
  integrations: [icon(), sitemap(), checklistPdfs()],
  vite: {
    plugins: [tailwindcss()]
  }
});