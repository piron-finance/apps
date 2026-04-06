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
