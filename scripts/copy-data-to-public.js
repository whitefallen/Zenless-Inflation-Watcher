// Copies all .json files from shiyu/ and deadlyAssault/ to public/shiyu/ and public/deadlyAssault/
const fs = require("fs");
const path = require("path");

function cleanupUnknownIdFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    if (file.includes("unknown-id") && file.endsWith(".json")) {
      const filePath = path.join(dir, file);
      fs.unlinkSync(filePath);
      console.log(`🗑️  Removed unknown-id file: ${file}`);
    }
  });
}

function copyAllJson(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  
  // Clean up any existing unknown-id files in destination
  cleanupUnknownIdFiles(destDir);
  
  for (const file of fs.readdirSync(srcDir)) {
    if (file.endsWith(".json")) {
      // Skip files with "unknown-id" (created when session expires)
      if (file.includes("unknown-id")) {
        console.log(`⚠️  Skipping file with unknown-id: ${file}`);
        continue;
      }
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    }
  }
}

copyAllJson(
  path.join(__dirname, "../shiyu"),
  path.join(__dirname, "../public/shiyu")
);
copyAllJson(
  path.join(__dirname, "../deadlyAssault"),
  path.join(__dirname, "../public/deadlyAssault")
);
copyAllJson(
  path.join(__dirname, "../voidFront"),
  path.join(__dirname, "../public/voidFront")
);
