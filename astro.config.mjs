// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://getupp.co',
  // Static output is Astro's default; kept explicit for clarity.
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
