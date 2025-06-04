import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const portfolio = defineCollection({
	loader: glob({ pattern: "**/*.mdx", base: "./src/content/portfolio" }),
	schema: ({ image }) => z.object({
		title: z.string(),
		subtitle: z.string(),
		cover: image(),
		coverAlt: z.string(),
	}),
});

export const collections = {
	portfolio,
};
