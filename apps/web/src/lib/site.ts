export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://piron.finance";

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}
