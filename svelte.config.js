import adapter from '@sveltejs/adapter-static';
import preprocessIcons from './scripts/preprocess-icons.js';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: [preprocessIcons],
  onwarn(warning, defaultHandler) {
    if (warning.code.includes('a11y')) return;
    defaultHandler(warning);
  },
  kit: {
    adapter: adapter(),
    prerender: {
      crawl: true
    },
    serviceWorker: {
      register: false
    }
  }
};
