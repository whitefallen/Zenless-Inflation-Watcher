const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  /* config options here */
  output: 'export', // important for static site
  basePath: isProd ? '/Zenless-Inflation-Watcher' : '',
  assetPrefix: isProd ? '/Zenless-Inflation-Watcher/' : '',
};

module.exports = require('next-pwa')({
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
