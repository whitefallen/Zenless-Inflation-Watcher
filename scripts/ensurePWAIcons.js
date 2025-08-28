const fs = require('fs');
const path = require('path');

// Ensure PNG icons exist for PWA manifest
// This is a minimal fallback that doesn't require external dependencies

const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

console.log('🔍 Checking PWA icons...');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log('📁 Created icons directory');
}

// Check if we have any existing icons to copy
const existingIcons = fs.readdirSync(iconsDir).filter(file => file.endsWith('.png'));
console.log(`📋 Found ${existingIcons.length} existing PNG icons`);

// Minimal 1x1 transparent PNG as base64
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGAhN4mTgAAAABJRU5ErkJggg==',
  'base64'
);

iconSizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const iconPath = path.join(iconsDir, filename);
  
  if (!fs.existsSync(iconPath)) {
    // Try to find a similar sized icon to copy
    const similarIcon = existingIcons.find(icon => icon.includes(`${size}x${size}`));
    
    if (similarIcon) {
      const sourcePath = path.join(iconsDir, similarIcon);
      fs.copyFileSync(sourcePath, iconPath);
      console.log(`📋 Copied ${similarIcon} → ${filename}`);
    } else {
      // Create minimal placeholder
      fs.writeFileSync(iconPath, minimalPNG);
      console.log(`📦 Created placeholder ${filename}`);
    }
  } else {
    console.log(`✅ ${filename} already exists`);
  }
});

console.log('🎉 PWA icons check completed!');

// Verify all required icons exist
const missingIcons = iconSizes.filter(size => {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  return !fs.existsSync(iconPath);
});

if (missingIcons.length === 0) {
  console.log('✅ All PWA icons are present');
  process.exit(0);
} else {
  console.error(`❌ Missing icons: ${missingIcons.map(s => `${s}x${s}`).join(', ')}`);
  process.exit(1);
}
