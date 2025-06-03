import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  trailingSlash: true, // required for static export
  basePath: '',        // keep root-relative
  assetPrefix: '',
  devIndicators: false,
};

export default nextConfig;
