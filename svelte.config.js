import adapter from '@sveltejs/adapter-static';
import replace from '@rollup/plugin-replace';
import markdown from './rollup-plugins/parse-markdown-articles.js';
import yaml from './rollup-plugins/parse-yaml.js';
import { windi } from 'svelte-windicss-preprocess';
import glob from 'rollup-plugin-glob';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: [preprocess(), windi({})],
  kit: {
    adapter: adapter({ out: 'dist' }),
    vite: {
      plugins: [
        replace({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        yaml(),
        markdown(),
        glob()
      ],
      server: {
        fs: {
          allow: ['./config']
        }
      }
    }
  }
};
