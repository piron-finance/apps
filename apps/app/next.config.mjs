/** @type {import('next').NextConfig} */
const nextConfig = {
  // PostHog ingest proxy — routes /ingest/* through Next.js to avoid ad blockers.
  // EU data residency: eu.posthog.com
  async rewrites() {
    return [
      {
        source:      "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source:      "/ingest/:path*",
        destination: "https://eu.posthog.com/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.freepik.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
