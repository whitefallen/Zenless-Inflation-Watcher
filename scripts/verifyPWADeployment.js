#!/usr/bin/env node

// PWA Deployment Verification Script
// Checks if all PWA files are properly generated and ready for deployment

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying PWA deployment readiness...\n');

const requiredFiles = [
  'out/manifest.json',
  'out/sw.js', 
  'out/offline.html',
  'out/icons/icon-192x192.png',
  'out/icons/icon-512x512.png'
];

const requiredDirs = [
  'out/icons',
  'out/shiyu',
  'out/deadlyAssault',
  'out/characters'
];

let allGood = true;

// Check required files
console.log('📁 Checking required PWA files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
    allGood = false;
  }
});

console.log('\n📂 Checking required directories:');
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const fileCount = fs.readdirSync(dir).length;
    console.log(`✅ ${dir} (${fileCount} files)`);
  } else {
    console.log(`❌ ${dir} - MISSING!`);
    allGood = false;
  }
});

// Check manifest.json content
console.log('\n📋 Checking manifest.json:');
try {
  const manifest = JSON.parse(fs.readFileSync('out/manifest.json', 'utf8'));
  const requiredManifestFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
  
  requiredManifestFields.forEach(field => {
    if (manifest[field]) {
      console.log(`✅ manifest.${field}`);
    } else {
      console.log(`❌ manifest.${field} - MISSING!`);
      allGood = false;
    }
  });
  
  // Check if icons array has entries
  if (manifest.icons && manifest.icons.length > 0) {
    console.log(`✅ manifest.icons (${manifest.icons.length} icons defined)`);
  } else {
    console.log(`❌ manifest.icons - No icons defined!`);
    allGood = false;
  }
} catch (error) {
  console.log(`❌ manifest.json - Invalid JSON: ${error.message}`);
  allGood = false;
}

// Check service worker
console.log('\n⚙️ Checking service worker:');
try {
  const swContent = fs.readFileSync('out/sw.js', 'utf8');
  if (swContent.includes('precacheAndRoute')) {
    console.log('✅ Service worker contains precaching logic');
  } else {
    console.log('⚠️ Service worker may not have precaching');
  }
  
  if (swContent.length > 1000) {
    console.log('✅ Service worker has substantial content');
  } else {
    console.log('⚠️ Service worker seems too small');
  }
} catch (error) {
  console.log(`❌ Service worker error: ${error.message}`);
  allGood = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 PWA deployment verification PASSED!');
  console.log('✅ All required files and configurations are present.');
  console.log('🚀 Ready for GitHub Pages deployment!');
  process.exit(0);
} else {
  console.log('❌ PWA deployment verification FAILED!');
  console.log('🔧 Please fix the missing files/configurations above.');
  process.exit(1);
}
