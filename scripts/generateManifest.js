const fs = require('fs');
const path = require('path');

// Generate manifest.json with correct base paths for production
console.log('🎨 Generating PWA manifest...');

const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/Zenless-Inflation-Watcher' : '';

console.log(`Environment: ${isProd ? 'production' : 'development'}`);
console.log(`Base path: ${basePath || '(none)'}`);

const manifest = {
  "name": "Zenless Zone Zero Battle Records",
  "short_name": "ZZZ Records",
  "description": "Track and analyze your Zenless Zone Zero battle performance",
  "start_url": `${basePath}/`,
  "display": "standalone",
  "background_color": "#0f0f23",
  "theme_color": "#7c3aed",
  "orientation": "portrait-primary",
  "categories": ["games", "entertainment", "utilities"],
  "icons": [
    {
      "src": `${basePath}/icons/icon-72x72.png`,
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": `${basePath}/icons/icon-96x96.png`,
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": `${basePath}/icons/icon-128x128.png`,
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": `${basePath}/icons/icon-144x144.png`,
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": `${basePath}/icons/icon-152x152.png`,
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": `${basePath}/icons/icon-192x192.png`,
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": `${basePath}/icons/icon-384x384.png`,
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": `${basePath}/icons/icon-512x512.png`,
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": `${basePath}/screenshots/desktop-1.png`,
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Battle Records Dashboard"
    },
    {
      "src": `${basePath}/screenshots/mobile-1.png`,
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mobile Battle Records"
    }
  ],
  "shortcuts": [
    {
      "name": "Shiyu Defense",
      "short_name": "Shiyu",
      "description": "View Shiyu Defense records",
      "url": `${basePath}/shiyu-defense`,
      "icons": [
        {
          "src": `${basePath}/icons/icon-96x96.png`,
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Deadly Assault",
      "short_name": "Assault",
      "description": "View Deadly Assault records",
      "url": `${basePath}/deadly-assault`,
      "icons": [
        {
          "src": `${basePath}/icons/icon-96x96.png`,
          "sizes": "96x96"
        }
      ]
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false
};

// Write the manifest to public directory
const manifestPath = path.join(__dirname, '../public/manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('✅ PWA manifest generated successfully!');
console.log(`📄 Manifest written to: ${manifestPath}`);

if (isProd) {
  console.log('🔗 Production URLs:');
  console.log(`   Manifest: https://whitefallen.github.io${basePath}/manifest.json`);
  console.log(`   Start URL: https://whitefallen.github.io${basePath}/`);
}
