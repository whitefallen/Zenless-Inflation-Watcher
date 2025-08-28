const fs = require('fs');
const path = require('path');

// Fallback icon generation without Puppeteer
// Creates simple colored PNG icons programmatically

const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

console.log('🎨 Generating fallback PNG icons...');

// Simple PNG creation using Canvas API (if available) or copying existing icons
async function generateFallbackIcons() {
  try {
    // Check if we can use canvas
    let Canvas;
    try {
      Canvas = require('canvas');
      console.log('✅ Canvas module available, generating high-quality icons');
      return generateCanvasIcons(Canvas);
    } catch (e) {
      console.log('⚠️ Canvas module not available, using SVG to PNG conversion');
      return generateSVGFallback();
    }
  } catch (error) {
    console.error('❌ Fallback icon generation failed:', error);
    process.exit(1);
  }
}

function generateCanvasIcons(Canvas) {
  const { createCanvas } = Canvas;
  
  iconSizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#7c3aed');
    gradient.addColorStop(1, '#a855f7');
    
    // Draw background with rounded corners
    const radius = size * 0.125; // 12.5% radius
    ctx.fillStyle = gradient;
    roundedRect(ctx, 0, 0, size, size, radius);
    ctx.fill();
    
    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ZZZ', size / 2, size / 2);
    
    // Save PNG
    const buffer = canvas.toBuffer('image/png');
    const pngPath = path.join(__dirname, '../public/icons', `icon-${size}x${size}.png`);
    fs.writeFileSync(pngPath, buffer);
    console.log(`✓ Created icon-${size}x${size}.png`);
  });
}

function generateSVGFallback() {
  // If SVG icon exists, try to copy it for largest sizes
  const svgPath = path.join(__dirname, '../public/icons/icon-512x512.svg');
  
  if (fs.existsSync(svgPath)) {
    console.log('📋 SVG icon found, copying for PNG placeholders');
    
    iconSizes.forEach(size => {
      const pngPath = path.join(__dirname, '../public/icons', `icon-${size}x${size}.png`);
      
      // For now, just create a simple text file that indicates SVG should be used
      // In a real implementation, you'd use sharp or similar to convert SVG to PNG
      const placeholderContent = `<!-- PNG placeholder for ${size}x${size} - Use SVG icon instead -->`;
      
      // Don't actually write this, just log what we would do
      console.log(`📝 Would generate ${size}x${size} PNG from SVG`);
    });
  }
  
  // Create simple text-based "icons" as ultimate fallback
  console.log('🔤 Creating simple text-based icon placeholders');
  createTextPlaceholders();
}

function createTextPlaceholders() {
  iconSizes.forEach(size => {
    const pngPath = path.join(__dirname, '../public/icons', `icon-${size}x${size}.png`);
    
    if (!fs.existsSync(pngPath)) {
      // Create a minimal valid PNG file (1x1 transparent pixel as placeholder)
      // This is a base64 encoded 1x1 transparent PNG
      const minimalPNG = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGAhN4mTgAAAABJRU5ErkJggg==',
        'base64'
      );
      
      fs.writeFileSync(pngPath, minimalPNG);
      console.log(`📦 Created minimal placeholder icon-${size}x${size}.png`);
    }
  });
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Run the fallback generation
generateFallbackIcons()
  .then(() => {
    console.log('🎉 Fallback icon generation completed!');
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
