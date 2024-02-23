import { sveltekit } from '@sveltejs/kit/vite';
import env from 'dotenv';
import { getStatistics } from './scripts/resolve-statistics.js';
import yamlJs from 'yaml';
import fs from 'fs';
import replace from '@rollup/plugin-replace';
import markdown from './scripts/parse-markdown-articles.js';
import yaml from './scripts/parse-yaml.js';
import glob from 'rollup-plugin-glob';
import UnoCSS from 'unocss/vite';

env.config();

const statistics = await getStatistics();

const config = yamlJs.parse(fs.readFileSync('./config/basic-configuration.yml').toString());
const algoliaConfig = {
  enabled: process.env.NODE_ENV === 'development' || config.algolia.enabled,
  index: process.env.ALGO_INDEX || config.algolia.index,
  appId: process.env.ALGO_APPID || config.algolia.applicationId,
  apiKey: process.env.ALGO_SEARCHKEY || config.algolia.searchOnlyApiKey
};

/** @type {import('vite').UserConfig} */
const viteConfig = {
  plugins: [
    sveltekit(),
    UnoCSS(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __BG__STATISTICS: JSON.stringify(statistics),
      __BG__ALGOLIA: JSON.stringify(algoliaConfig),
      __BG__VERSION: JSON.stringify(process.env.npm_package_version || 'dev')
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
};

export default viteConfig;
