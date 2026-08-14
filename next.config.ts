import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/sand-sandbox',
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
