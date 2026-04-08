import { createClient } from "next-sanity";
import { isSanityConfigured, sanityEnv } from "@/lib/sanity/env";

export const sanityClient = createClient({
  apiVersion: sanityEnv.apiVersion,
  dataset: sanityEnv.dataset || "production",
  projectId: sanityEnv.projectId || "missing-project-id",
  token: sanityEnv.token,
  useCdn: !sanityEnv.token,
});

type SanityFetchArgs = {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
};

export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
}: SanityFetchArgs) {
  if (!isSanityConfigured()) {
    return null as T | null;
  }

  return sanityClient.fetch<T>(query, params, {
    cache: "force-cache",
    next: {
      revalidate: 300,
      tags: Array.from(new Set(["sanity:blog", ...tags])),
    },
  });
}
