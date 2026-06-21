import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { remarkPlayground } from './src/remark-playground';
import starlightConfig from './starlight-config';

// https://astro.build/config
export default defineConfig({
  integrations: [starlight(starlightConfig)],
  markdown: {
    remarkPlugins: [remarkPlayground],
    // regression https://github.com/withastro/astro/issues/16971
    // https://github.com/withastro/starlight/issues/3934
    // consider using Satteri processor, which is opt-in
    // https://github.com/withastro/starlight/pull/3923/changes#diff-131521e4d59a89ebd853d4ce25c99d67b2cf362b9318c5b89b60883a52d50ebaR7
    gfm: true,
  },
  site: 'https://styledictionary.com/',
  vite: {
    force: true,
    server: {
      force: true,
    },
    optimizeDeps: {
      // coz we're doing monkeypatching deps quite often at this stage of this POC
      force: true,
      // due to WASM bindings
      exclude: ['@rollup/browser'],
      esbuildOptions: {
        // to support top-level-await
        target: 'esnext',
      },
    },
  },
});
