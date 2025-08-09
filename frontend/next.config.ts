import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // important for static site
  basePath: isProd ? '/Zenless-Inflation-Watcher' : '',
  assetPrefix: isProd ? '/Zenless-Inflation-Watcher/' : '',
};

export default nextConfig;
