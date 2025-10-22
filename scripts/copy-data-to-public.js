// Copies all .json files from shiyu/ and deadlyAssault/ to public/shiyu/ and public/deadlyAssault/
const fs = require("fs");
const path = require("path");

function copyAllJson(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    if (file.endsWith(".json")) {
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
