/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Mock imagery lives in /public/mock as SVG placeholders, so the optimizer
    // needs to pass SVG through. Swap these files for real photos (or a Supabase
    // Storage remotePattern) and this flag can be removed.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [],
  },
};

export default nextConfig;
