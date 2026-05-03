const path = require('path');
const withPWA = require('@ducanh2912/next-pwa').default;
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  /* config options here */
  output: 'export', // important for static site
  basePath: isProd ? '/Zenless-Inflation-Watcher' : '',
  assetPrefix: isProd ? '/Zenless-Inflation-Watcher/' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? '/Zenless-Inflation-Watcher' : '',
  },
  // Pin Next's project root so it doesn't walk up to a stray lockfile in $HOME
  // and resolve modules against the wrong dependency tree (which causes
  // "Object.c [as require]" failures during prerender on Windows).
  outputFileTracingRoot: path.join(__dirname),
};

const basePath = isProd ? '/Zenless-Inflation-Watcher' : '';

module.exports = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    // Serve offline.html when a page navigation fails offline
    document: `${basePath}/offline.html`,
  },
  runtimeCaching: [
    // Static Next.js assets have content-hashed names — cache forever
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-assets',
        expiration: { maxEntries: 128, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    // Per-view JSON data — network first, fall back to cache
    {
      urlPattern: /\/data\/zzz-.+\.json$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'zzz-data',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    // Character JSON + images — stale-while-revalidate (rarely changes)
    {
      urlPattern: /\/characters\/.+\.json$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'zzz-characters',
        expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    // Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'google-fonts-stylesheets' },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: { maxEntries: 8, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    // Everything else — network first with offline fallback
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'fallback-cache',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
  ],
})(nextConfig);
