import createImageUrlBuilder from "@sanity/image-url";
import type { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";
import { sanityEnv } from "@/lib/sanity/env";

const builder = createImageUrlBuilder({
  projectId: sanityEnv.projectId || "missing-project-id",
  dataset: sanityEnv.dataset || "production",
});

export function urlFor(source: unknown): ImageUrlBuilder {
  return builder.image(source as any);
}

/**
 * Resolve inline image URLs in a Portable Text body on the server so that
 * client components never need access to the Sanity project config.
 */
export function resolveBodyImages(body: any[]): any[] {
  if (!body) return body;

  return body.map((block) => {
    if (block._type !== "image" || !block.asset?._ref) return block;

    const resolvedUrl = urlFor(block)
      .width(1600)
      .fit("max")
      .auto("format")
      .url();

    return { ...block, _resolvedUrl: resolvedUrl };
  });
}
