/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@repo/ui"],
  },
};

export default nextConfig;
