// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  output: "static",
  integrations: [
    expressiveCode({
      themes: ["everforest-light", "everforest-dark"],
    }),
    mdx(),
  ]
});