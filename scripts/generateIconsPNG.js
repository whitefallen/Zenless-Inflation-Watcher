const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

(async () => {
  console.log('Generating PNG icons from HTML templates...');
  
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    for (const size of iconSizes) {
      const htmlPath = path.join(__dirname, '../public/icons', `icon-${size}x${size}.html`);
      const pngPath = path.join(__dirname, '../public/icons', `icon-${size}x${size}.png`);
      
      if (fs.existsSync(htmlPath)) {
        console.log(`Generating ${size}x${size} icon...`);
        
        await page.goto(`file://${htmlPath}`);
        await page.setViewport({ width: size, height: size });
        
        await page.screenshot({ 
          path: pngPath,
          clip: { x: 0, y: 0, width: size, height: size },
          omitBackground: false
        });
        
        console.log(`✓ Created icon-${size}x${size}.png`);
      } else {
        console.log(`⚠ HTML template not found for ${size}x${size}`);
      }
    }
    
    await browser.close();
    console.log('🎉 All icons generated successfully!');
    
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
})();
