/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Blog cover images are uploaded through the backend to Supabase Storage and
    // served from `https://<project-ref>.supabase.co/storage/v1/object/public/blog/...`.
    // next/image refuses any host not listed here, so without this every cover
    // image fails with "Invalid src prop ... hostname is not configured".
    //
    // The project ref differs per environment, hence the wildcard. The pathname is
    // pinned to the public storage prefix so this does not open up arbitrary
    // Supabase endpoints.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],

    // Covers are sometimes uploaded as SVG, which the image optimizer refuses by
    // default because an SVG can carry script. These come from our own authenticated
    // upload path rather than arbitrary users, and the two settings below contain
    // the remaining risk: the CSP blocks scripts and external references inside the
    // file, and the disposition stops it being rendered as a document in its own right.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline'",
  },
};

export default nextConfig;
