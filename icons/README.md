
# Icon Generation

The HTML files in this directory can be used to generate PNG icons.

## Manual Process:
1. Open each HTML file in a browser
2. Take a screenshot of exact dimensions
3. Save as PNG with corresponding filename

## Automated Process (Recommended):
Use Puppeteer or similar tools to automate screenshot generation.

## Icon Sizes Needed:
- 16x16px
- 32x32px
- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px
- 384x384px
- 512x512px

## Example Puppeteer Script:
```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  for (const size of [16, 32, 72, 96, 128, 144, 152, 192, 384, 512]) {
    await page.goto(`file://${__dirname}/icon-${size}x${size}.html`);
    await page.setViewport({ width: size, height: size });
    await page.screenshot({ 
      path: `icon-${size}x${size}.png`,
      clip: { x: 0, y: 0, width: size, height: size }
    });
  }
  
  await browser.close();
})();
```
