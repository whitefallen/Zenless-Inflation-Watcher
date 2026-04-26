const path = require('path');
const withPWA = require('@ducanh2912/next-pwa').default;
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  /* config options here */
  output: 'export', // important for static site
  basePath: isProd ? '/Zenless-Inflation-Watcher' : '',
  assetPrefix: isProd ? '/Zenless-Inflation-Watcher/' : '',
  // Pin Next's project root so it doesn't walk up to a stray lockfile in $HOME
  // and resolve modules against the wrong dependency tree (which causes
  // "Object.c [as require]" failures during prerender on Windows).
  outputFileTracingRoot: path.join(__dirname),
};

module.exports = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    }
  ]
})(nextConfig);
