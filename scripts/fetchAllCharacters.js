const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://zzz3.hakush.in/character";
const API_URL = "https://api.hakush.in/zzz/data/en/character";

async function main() {
  // Launch headless browser
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle2" });

  // Wait for the character links to appear
  await page.waitForSelector('a[href^="/character/"]');

  // Extract all character IDs from the page
  const ids = await page.$$eval('a[href^="/character/"]', (links) =>
    links
      .map((link) => {
        const match = link.getAttribute("href").match(/^\/character\/(\d+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean)
  );
  console.log("Extracted IDs:", ids);

  await browser.close();

  // Ensure output directory exists
  const outDir = path.join(__dirname, "../public/characters");
  fs.mkdirSync(outDir, { recursive: true });

  // Download and save each character JSON
  for (const id of ids) {
    const url = `${API_URL}/${id}.json`;
    console.log("Fetching:", url);
    try {
      const { data } = await axios.get(url);
      fs.writeFileSync(
        path.join(outDir, `${id}.json`),
        JSON.stringify(data, null, 2)
      );
      console.log(`Saved ${id}.json`);
    } catch (e) {
      console.warn(`Failed for ${id}: ${e.message}`);
    }
  }
}

main();
