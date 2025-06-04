// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from "rehype-slug";
import rehypeUnwrapImages from "rehype-unwrap-images";
import rehypeExternalLinks from "rehype-external-links";

// https://astro.build/config
export default defineConfig({
  site: "https://tobloef.com",
  output: "static",
  prefetch: true,
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      rehypeUnwrapImages,
      [rehypeExternalLinks, { target: '_blank' }],
    ]
  },
  integrations: [
    expressiveCode({
      themes: ["everforest-light", "everforest-dark"],
    }),
    mdx(),
  ]
});
