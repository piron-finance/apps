const apiVersion = process.env.SANITY_API_VERSION || "2026-04-06";
const projectId = process.env.SANITY_PROJECT_ID || "";
const dataset = process.env.SANITY_DATASET || "";
const token = process.env.SANITY_API_READ_TOKEN;

export const sanityEnv = {
  apiVersion,
  dataset,
  projectId,
  token,
};

export function isSanityConfigured() {
  return Boolean(projectId && dataset);
}
