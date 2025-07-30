import { defineCollection, type SchemaContext, z } from "astro:content";
import { glob } from "astro/loaders";

const portfolioSchema = ({ image }: SchemaContext) => z.object({
	title: z.string(),
	subtitle: z.string(),
	cover: image(),
	coverAlt: z.string(),
	coverIsSmall: z.boolean().optional(),
	date: z.date(),
	tech: z.array(z.object({
		image: image(),
		name: z.string(),
	})),
	purpose: z.union([
		z.literal("personal"),
		z.literal("work"),
	]),
	links: z.array(
		z.object({
			label: z.string(),
			url: z.string().url(),
		})
	).optional(),
	hidden: z.boolean().optional(),
	gamedev: z.boolean().optional(),
});

const portfolio = defineCollection({
	loader: glob({ pattern: "**/*.mdx", base: "./src/content/portfolio" }),
	schema: portfolioSchema,
});

const games = defineCollection({
	loader: glob({ pattern: "**/*.mdx", base: "./src/content/games" }),
	schema: portfolioSchema,
});

export const collections = {
	portfolio,
	games,
};
