import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";


export async function getItemWithImages<
	T extends { data: { cover: ImageMetadata }}
>(
	item: T
): Promise<T & { data: { thumbnail: string, cover: string } }> {
	const thumbnail = await getImage({
		src: item.data.cover,
		format: "webp",
		width: 300,
	});
	const cover = await getImage({
		src: item.data.cover,
		format: "webp",
		width: 1200,
	});

	return {
		...item,
		data: {
			...item.data,
			thumbnail: thumbnail.src,
			cover: cover.src,
		},
	};
}
