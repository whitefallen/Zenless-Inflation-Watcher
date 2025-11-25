require("dotenv").config();
const DiscordNotifier = require("./discordNotifier");
const discord = new DiscordNotifier(process.env.DISCORD_WEBHOOK_URL);
const inquirer = require("inquirer").default;
const ZZZApi = require("./zzzApi");
const AuthHelper = require("./authHelper");
const fs = require("fs");
const Handlebars = require("handlebars");
const path = require("path");

// Initialize authentication helper
const authHelper = new AuthHelper();
let api = null;
let uid = process.env.UID;

// Initialize API with authentication
async function initializeApi() {
  if (!uid) {
    console.log(
      "⚠️  No UID found in environment. Please set UID in .env file."
    );
    return false;
  }

  try {
    // Check if authentication is needed
    const needsAuth = await authHelper.refreshAuthIfNeeded(uid);
    if (needsAuth) {
      api = authHelper.createApiInstance(uid);
      return true;
    } else {
      // Even if auth refresh wasn't needed, create API instance
      api = authHelper.createApiInstance(uid);
      return true;
    }
  } catch (error) {
    console.error("❌ Failed to initialize API:", error.message);
    return false;
  }
}

// Element type mapping for ZZZ
const ELEMENT_TYPES = {
  200: "Physical",
  201: "Fire",
  202: "Ice",
  203: "Electric",
  205: "Ether",
};
const ELEMENT_COLORS = {
  200: "#8B4513",
  201: "#FF4500",
  202: "#00BFFF",
  203: "#FFD700",
  204: "#32CD32",
  205: "#9370DB",
  206: "#FF69B4",
};
const RARITY_COLORS = {
  S: "\x1b[35m", // Magenta
  A: "\x1b[36m", // Cyan
  B: "\x1b[32m", // Green
  C: "\x1b[33m", // Yellow
};
const RESET_COLOR = "\x1b[0m";

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
function formatDate(dateString) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function getElementName(elementType) {
  return ELEMENT_TYPES[elementType] || `Unknown (${elementType})`;
}

function formatSeasonWindow(obj) {
  // Accepts either {start_time, end_time} (Deadly Assault) or {begin_time, end_time} (Shiyu Defense)
  let start, end;
  if (obj.start_time && obj.end_time) {
    start = obj.start_time;
    end = obj.end_time;
  } else if (obj.begin_time && obj.end_time) {
    start = obj.begin_time;
    end = obj.end_time;
  } else {
    return "Unknown";
  }
  // If numeric timestamps, convert to ms
  if (/^\d+$/.test(start)) start = new Date(Number(start) * 1000);
  if (/^\d+$/.test(end)) end = new Date(Number(end) * 1000);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

// --- helpers to build filenames like Mode-ID.json ---
/**
 * Extract the season ID from API response based on game mode
 * - Deadly Assault: data.zone_id
 * - Shiyu Defense: data.schedule_id
 * - Void Front: data.void_front_battle_abstract_info_brief.void_front_id
 */
function getSeasonId(mode, payload) {
  if (!payload || !payload.data) return null;
  
  if (mode === "deadly") {
    return payload.data.zone_id || null;
  } else if (mode === "shiyu") {
    return payload.data.schedule_id || null;
  } else if (mode === "void-front") {
    return payload.data.void_front_battle_abstract_info_brief?.void_front_id || null;
  }
  return null;
}

function buildFileName(mode, seasonId) {
  const modeNames = {
    deadly: "deadly-assault",
    shiyu: "shiyu-defense",
    "void-front": "void-front",
  };
  const modeName = modeNames[mode] || "unknown-mode";
  const idSafe = seasonId != null ? String(seasonId) : "unknown-id";
  return `${modeName}-${idSafe}.json`;
}

function printDeadlyAssaultSummary(data) {
  if (!data || !data.data) return console.log("No Deadly Assault data.");
  const d = data.data;
  console.log("\n===== DEADLY ASSAULT SUMMARY =====");
  console.log("Season:", formatSeasonWindow(d));
  console.log("Player:", d.nick_name || "Unknown");
  console.log("Total Score:", d.total_score);
  console.log("Total Stars:", d.total_star);
  console.log("Rank Percent:", d.rank_percent);
  if (Array.isArray(d.list)) {
    console.log("\nBoss Clears:");
    d.list.forEach((run, idx) => {
      const boss = run.boss && run.boss[0] ? run.boss[0].name : "Unknown";
      const time = run.challenge_time;
      let timeStr = "Unknown";
      if (time && typeof time === "object") {
        timeStr = `${time.year}-${String(time.month).padStart(2, "0")}-${String(
          time.day
        ).padStart(2, "0")} ${String(time.hour).padStart(2, "0")}:${String(
          time.minute
        ).padStart(2, "0")}:${String(time.second).padStart(2, "0")}`;
      }
      console.log(`  #${idx + 1}: Boss: ${boss}`);
      console.log(
        `     Score: ${run.score}, Stars: ${run.star}/${run.total_star}`
      );
      console.log(`     Time: ${timeStr}`);
      if (run.buffer && run.buffer.length > 0) {
        console.log("     Buffs:");
        run.buffer.forEach((buff) => {
          console.log(
            `       - ${buff.name}: ${buff.desc
              .replace(/<[^>]*>/g, "")
              .replace(/\\n/g, " ")}`
          );
        });
      }
      if (run.avatar_list && run.avatar_list.length > 0) {
        console.log("     Team:");
        run.avatar_list.forEach((av) => {
          console.log(
            `       - ID: ${av.id}, Rarity: ${av.rarity}, Level: ${
              av.level
            }, Element: ${getElementName(av.element_type)}`
          );
        });
      }
      if (run.buddy) {
        console.log(
          `     Buddy: ID: ${run.buddy.id}, Rarity: ${run.buddy.rarity}, Level: ${run.buddy.level}`
        );
      }
    });
  }
  console.log("==================================\n");
}

function printShiyuDefenseSummary(data) {
  if (!data || !data.data) return console.log("No Shiyu Defense data.");
  const d = data.data;
  console.log("\n===== SHIYU DEFENSE SUMMARY =====");
  console.log("Season:", formatSeasonWindow(d));
  if (Array.isArray(d.all_floor_detail)) {
    [0, 1].forEach((idx) => {
      const floor = d.all_floor_detail[idx];
      if (!floor) return;
      console.log(`\nLayer ${floor.layer_index} (Rating: ${floor.rating})`);
      if (floor.buffs && floor.buffs.length > 0) {
        console.log("  Buffs:");
        floor.buffs.forEach((buff) => {
          console.log(
            `    - ${buff.title}: ${buff.text
              .replace(/<[^>]*>/g, "")
              .replace(/\\n/g, " ")}`
          );
        });
      }
      // Node 1 (First Half)
      if (floor.node_1) {
        console.log("  First Half (node_1):");
        if (floor.node_1.avatars && floor.node_1.avatars.length > 0) {
          floor.node_1.avatars.forEach((av) => {
            console.log(
              `    - ID: ${av.id}, Rarity: ${av.rarity}, Level: ${
                av.level
              }, Element: ${getElementName(av.element_type)}`
            );
          });
        }
        if (floor.node_1.buddy) {
          const b = floor.node_1.buddy;
          console.log(
            `    Buddy: ID: ${b.id}, Rarity: ${b.rarity}, Level: ${b.level}`
          );
        }
      }
      // Node 2 (Second Half)
      if (floor.node_2) {
        console.log("  Second Half (node_2):");
        if (floor.node_2.avatars && floor.node_2.avatars.length > 0) {
          floor.node_2.avatars.forEach((av) => {
            console.log(
              `    - ID: ${av.id}, Rarity: ${av.rarity}, Level: ${
                av.level
              }, Element: ${getElementName(av.element_type)}`
            );
          });
        }
        if (floor.node_2.buddy) {
          const b = floor.node_2.buddy;
          console.log(
            `    Buddy: ID: ${b.id}, Rarity: ${b.rarity}, Level: ${b.level}`
          );
        }
      }
    });
  }
  console.log("=================================\n");
}

// --- CLI Features ---
async function showShiyuDefense() {
  try {
    const data = await api.getChallenge({ uid });
    console.log(
      "\n\uD83D\uDEE1\uFE0F SHIYU DEFENSE DATA\n",
      JSON.stringify(data, null, 2)
    );
  } catch (err) {
    console.error("Error fetching Shiyu Defense data:", err.message);
  }
}

async function showDeadlyAssault() {
  try {
    const data = await api.getMemoryDetail({ uid });
    console.log(
      "\n\uD83C\uDFAF DEADLY ASSAULT DATA\n",
      JSON.stringify(data, null, 2)
    );
  } catch (err) {
    console.error("Error fetching Deadly Assault data:", err.message);
  }
}

// Load templates
const mainTemplate = Handlebars.compile(
  fs.readFileSync(path.join(__dirname, "templates", "report.hbs"), "utf8")
);
const deadlyAssaultTemplate = Handlebars.compile(
  fs.readFileSync(
    path.join(__dirname, "templates", "deadly-assault.hbs"),
    "utf8"
  )
);
const shiyuDefenseTemplate = Handlebars.compile(
  fs.readFileSync(
    path.join(__dirname, "templates", "shiyu-defense.hbs"),
    "utf8"
  )
);

async function generateHTMLReport() {
  try {
    const [challenge, memory] = await Promise.all([
      api.getChallenge({ uid }),
      api.getMemoryDetail({ uid }),
    ]);

    // Prepare data for templates
    const deadlyAssaultData = prepareDeadlyAssaultData(memory);
    const shiyuDefenseData = prepareShiyuDefenseData(challenge);

    // Generate HTML sections
    const deadlyAssaultHTML = deadlyAssaultTemplate(deadlyAssaultData);
    const shiyuDefenseHTML = shiyuDefenseTemplate(shiyuDefenseData);

    // Generate final HTML
    const html = mainTemplate({
      generatedDate: formatDate(new Date()),
      deadlyAssaultHTML,
      shiyuDefenseHTML,
    });

    fs.writeFileSync("zzz_battle_report.html", html);
    console.log("📋 HTML Report generated: zzz_battle_report.html");
  } catch (err) {
    console.error("Error generating HTML report:", err.message);
  }
}

function prepareDeadlyAssaultData(data) {
  if (!data || !data.data)
    return {
      season: "N/A",
      player: "N/A",
      totalScore: "N/A",
      totalStars: "N/A",
      rankPercent: "N/A",
    };

  const d = data.data;
  const bossClears = [];

  if (Array.isArray(d.list)) {
    d.list.forEach((run, idx) => {
      const boss = run.boss && run.boss[0] ? run.boss[0].name : "Unknown";
      const time = run.challenge_time;
      let timeStr = "Unknown";
      if (time && typeof time === "object") {
        timeStr = `${time.year}-${String(time.month).padStart(2, "0")}-${String(
          time.day
        ).padStart(2, "0")} ${String(time.hour).padStart(2, "0")}:${String(
          time.minute
        ).padStart(2, "0")}:${String(time.second).padStart(2, "0")}`;
      }

      const bossClear = {
        bossName: boss,
        score: run.score?.toLocaleString() || "N/A",
        stars: `${run.star || "N/A"}/${run.total_star || "N/A"}`,
        time: timeStr,
      };

      if (run.buffer && run.buffer.length > 0) {
        bossClear.buffs = run.buffer.map((buff) => ({
          name: buff.name,
          description: buff.desc.replace(/<[^>]*>/g, "").replace(/\\n/g, " "),
        }));
      }

      if (run.avatar_list && run.avatar_list.length > 0) {
        bossClear.team = run.avatar_list.map((avatar) => ({
          id: avatar.id,
          rarity: avatar.rarity,
          level: avatar.level,
          elementName: getElementName(avatar.element_type),
          elementColor: ELEMENT_COLORS[avatar.element_type] || "#666",
        }));
      }

      if (run.buddy) {
        bossClear.buddy = {
          id: run.buddy.id,
          rarity: run.buddy.rarity,
          level: run.buddy.level,
        };
      }

      bossClears.push(bossClear);
    });
  }

  return {
    season: formatSeasonWindow(d),
    player: d.nick_name || "Unknown",
    totalScore: d.total_score?.toLocaleString() || "N/A",
    totalStars: d.total_star || "N/A",
    rankPercent: d.rank_percent || "N/A",
    bossClears,
  };
}

function prepareShiyuDefenseData(data) {
  if (!data || !data.data)
    return {
      season: "N/A",
      maxLayer: "N/A",
      fastLayerTime: "N/A",
      battleTime47: "N/A",
    };

  const d = data.data;
  const floorDetails = [];

  if (Array.isArray(d.all_floor_detail)) {
    [0, 1].forEach((idx) => {
      const floor = d.all_floor_detail[idx];
      if (!floor) return;

      const floorDetail = {
        layerIndex: floor.layer_index,
        rating: floor.rating,
      };

      if (floor.buffs && floor.buffs.length > 0) {
        floorDetail.buffs = floor.buffs.map((buff) => ({
          title: buff.title,
          text: buff.text.replace(/<[^>]*>/g, "").replace(/\\n/g, " "),
        }));
      }

      // Node 1 (First Half)
      if (floor.node_1) {
        floorDetail.node1 = {
          battleTime: formatTime(floor.node_1.battle_time || 0),
        };

        if (floor.node_1.avatars && floor.node_1.avatars.length > 0) {
          floorDetail.node1.avatars = floor.node_1.avatars.map((avatar) => ({
            id: avatar.id,
            rarity: avatar.rarity,
            level: avatar.level,
            elementName: getElementName(avatar.element_type),
            elementColor: ELEMENT_COLORS[avatar.element_type] || "#666",
          }));
        }

        if (floor.node_1.buddy) {
          floorDetail.node1.buddy = {
            id: floor.node_1.buddy.id,
            rarity: floor.node_1.buddy.rarity,
            level: floor.node_1.buddy.level,
          };
        }
      }

      // Node 2 (Second Half)
      if (floor.node_2) {
        floorDetail.node2 = {
          battleTime: formatTime(floor.node_2.battle_time || 0),
        };

        if (floor.node_2.avatars && floor.node_2.avatars.length > 0) {
          floorDetail.node2.avatars = floor.node_2.avatars.map((avatar) => ({
            id: avatar.id,
            rarity: avatar.rarity,
            level: avatar.level,
            elementName: getElementName(avatar.element_type),
            elementColor: ELEMENT_COLORS[avatar.element_type] || "#666",
          }));
        }

        if (floor.node_2.buddy) {
          floorDetail.node2.buddy = {
            id: floor.node_2.buddy.id,
            rarity: floor.node_2.buddy.rarity,
            level: floor.node_2.buddy.level,
          };
        }
      }

      floorDetails.push(floorDetail);
    });
  }

  return {
    season: formatSeasonWindow(d),
    maxLayer: d.max_layer || "N/A",
    fastLayerTime: formatTime(d.fast_layer_time || 0),
    battleTime47: formatTime(d.battle_time_47 || 0),
    floorDetails,
  };
}

async function generateTextReport() {
  try {
    const [challenge, memory] = await Promise.all([
      api.getChallenge({ uid }),
      api.getMemoryDetail({ uid }),
    ]);
    let report = "\uD83C\uDFAE ZENLESS ZONE ZERO - BATTLE RECORDS REPORT\n";
    report += "=".repeat(60) + "\n";
    report += `\uD83D\uDCC5 Generated: ${formatDate(new Date())}\n\n`;
    report +=
      "\uD83D\uDEE1\uFE0F SHIYU DEFENSE DATA\n" +
      JSON.stringify(challenge, null, 2) +
      "\n";
    report +=
      "\uD83C\uDFAF DEADLY ASSAULT DATA\n" +
      JSON.stringify(memory, null, 2) +
      "\n";
    fs.writeFileSync("zzz_battle_report.txt", report);
    console.log("\uD83D\uDCCB Text report generated: zzz_battle_report.txt");
  } catch (err) {
    console.error("Error generating text report:", err.message);
  }
}

async function showDeadlyAssaultSummary() {
  try {
    const data = await api.getMemoryDetail({ uid });
    printDeadlyAssaultSummary(data);
  } catch (err) {
    console.error("Error fetching Deadly Assault data:", err.message);
  }
}

async function showShiyuDefenseSummary() {
  try {
    const data = await api.getChallenge({ uid });
    printShiyuDefenseSummary(data);
  } catch (err) {
    console.error("Error fetching Shiyu Defense data:", err.message);
  }
}

// Helper function to get current month and week
function getCurrentMonthWeek() {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11
  const year = now.getFullYear();

  // Calculate week of the month (1-5)
  const firstDay = new Date(year, month - 1, 1);
  const dayOfWeek = firstDay.getDay();
  const date = now.getDate();
  const week = Math.ceil((date + dayOfWeek) / 7);

  return { month, week };
}

// Export Deadly Assault summary as JSON
async function exportDeadlyAssaultJSON() {
  try {
    const data = await api.getMemoryDetail({ uid });
    const structuredData = prepareDeadlyAssaultData(data);

    // Add metadata
    const exportData = {
      ...structuredData,
      metadata: {
        exportDate: new Date().toISOString(),
        uid: uid,
        type: "deadly_assault",
      },
    };

    const folderPath = "deadlyAssault";
    const seasonId = getSeasonId("deadly", data);
    const fileName = buildFileName("deadly", seasonId);

    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, fileName);
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    console.log(`📁 Deadly Assault JSON exported: ${filePath}`);

    // Discord notification
    await discord.sendMessage(`📁 Deadly Assault JSON exported: ${filePath}`);

    return filePath;
  } catch (err) {
    console.error("Error exporting Deadly Assault JSON:", err.message);
    await discord.sendMessage(
      `❌ Error exporting Deadly Assault JSON: ${err.message}`
    );
    throw err;
  }
}

// Export Shiyu Defense summary as JSON
async function exportShiyuDefenseJSON() {
  try {
    const data = await api.getChallenge({ uid });
    const structuredData = prepareShiyuDefenseData(data);

    // Add metadata
    const exportData = {
      ...structuredData,
      metadata: {
        exportDate: new Date().toISOString(),
        uid: uid,
        type: "shiyu_defense",
      },
    };

    const folderPath = "shiyu";
    const seasonId = getSeasonId("shiyu", data);
    const fileName = buildFileName("shiyu", seasonId);

    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, fileName);
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    console.log(`📁 Shiyu Defense JSON exported: ${filePath}`);

    // Discord notification
    await discord.sendMessage(`📁 Shiyu Defense JSON exported: ${filePath}`);

    return filePath;
  } catch (err) {
    console.error("Error exporting Shiyu Defense JSON:", err.message);
    await discord.sendMessage(
      `❌ Error exporting Shiyu Defense JSON: ${err.message}`
    );
    throw err;
  }
}

// Print Void Front summary
function printVoidFrontSummary(data) {
  if (!data || !data.data) return console.log("No Void Front data.");
  const d = data.data;
  console.log("\n===== VOID FRONT SUMMARY =====");
  console.log("Player:", d.role_basic_info?.nickname || "Unknown");
  console.log(
    "Total Score:",
    d.void_front_battle_abstract_info_brief?.total_score || 0
  );
  console.log(
    "Rank Percent:",
    d.void_front_battle_abstract_info_brief?.rank_percent || 0
  );
  console.log(
    "Ending Record:",
    d.void_front_battle_abstract_info_brief?.ending_record_name || "None"
  );

  if (d.boss_challenge_record) {
    console.log("\nBoss Challenge:");
    const main = d.boss_challenge_record.main_challenge_record;
    console.log(
      `  Main: ${main.name}, Score: ${main.score}, Star: ${main.star}`
    );

    if (
      d.boss_challenge_record.sub_challenge_record &&
      d.boss_challenge_record.sub_challenge_record.length > 0
    ) {
      console.log("  Sub Challenges:");
      d.boss_challenge_record.sub_challenge_record.forEach((sub, idx) => {
        console.log(`    #${idx + 1}: ${sub.name}, Star: ${sub.star}`);
        if (sub.avatar_list && sub.avatar_list.length > 0) {
          console.log("      Team:");
          sub.avatar_list.forEach((av) => {
            console.log(
              `       - ID: ${av.id}, Rarity: ${av.rarity}, Level: ${
                av.level
              }, Element: ${getElementName(av.element_type)}`
            );
          });
        }
      });
    }
  }

  if (d.main_challenge_record_list && d.main_challenge_record_list.length > 0) {
    console.log("\nMain Challenges:");
    d.main_challenge_record_list.forEach((main, idx) => {
      console.log(
        `  #${idx + 1}: ${main.name}, Score: ${main.score}, Star: ${main.star}`
      );
    });
  }

  console.log("==================================\n");
}

// Get Void Front data
async function showVoidFrontDetail() {
  try {
    const data = await api.getVoidFrontDetail({ uid });
    console.log("\n🔮 VOID FRONT DATA\n", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error fetching Void Front data:", err.message);
  }
}

// Show Void Front summary
async function showVoidFrontSummary() {
  try {
    const data = await api.getVoidFrontDetail({ uid });
    printVoidFrontSummary(data);
  } catch (err) {
    console.error("Error fetching Void Front data:", err.message);
  }
}

// Export Void Front data as JSON
async function exportVoidFrontJSON() {
  try {
    const data = await api.getVoidFrontDetail({ uid });
    const now = new Date();
    const exportData = {
      ...data,
      metadata: {
        exportDate: now.toISOString(),
        uid: uid,
        type: "void_front",
      },
    };

    const folderPath = "voidFront";
    const seasonId = getSeasonId("void-front", data);
    const fileName = buildFileName("void-front", seasonId);

    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, fileName);
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    console.log(`📁 Void Front JSON exported: ${filePath}`);

    // Discord notification
    await discord.sendMessage(`📁 Void Front JSON exported: ${filePath}`);

    return filePath;
  } catch (err) {
    console.error("Error exporting Void Front JSON:", err.message);
    await discord.sendMessage(
      `❌ Error exporting Void Front JSON: ${err.message}`
    );
    throw err;
  }
}

// Export all summaries as JSON
async function exportAllJSON() {
  try {
    console.log("🔄 Exporting all summaries as JSON...");
    const [deadlyPath, shiyuPath, voidFrontPath] = await Promise.all([
      exportDeadlyAssaultJSON(),
      exportShiyuDefenseJSON(),
      exportVoidFrontJSON(),
    ]);
    console.log("✅ All exports completed successfully!");
    await discord.sendMessage(
      "✅ All battle data JSON exports completed successfully!"
    );
    return { deadlyPath, shiyuPath, voidFrontPath };
  } catch (err) {
    console.error("Error exporting JSON files:", err.message);
    await discord.sendMessage(`❌ Error exporting JSON files: ${err.message}`);
    throw err;
  }
}

async function mainMenu() {
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Select an action:",
        choices: [
          { name: "Show Shiyu Defense (Challenge) data", value: "shiyu" },
          { name: "Show Deadly Assault (Memory) data", value: "deadly" },
          { name: "Show Void Front data", value: "void_front" },
          {
            name: "Show structured Deadly Assault summary",
            value: "deadly_summary",
          },
          {
            name: "Show structured Shiyu Defense summary",
            value: "shiyu_summary",
          },
          {
            name: "Show structured Void Front summary",
            value: "void_front_summary",
          },
          { name: "Generate HTML report", value: "html" },
          { name: "Generate text report", value: "text" },
          { name: "Export Deadly Assault as JSON", value: "export_deadly" },
          { name: "Export Shiyu Defense as JSON", value: "export_shiyu" },
          { name: "Export Void Front as JSON", value: "export_void_front" },
          { name: "Export all as JSON", value: "export_all" },
          { name: "Exit", value: "exit" },
        ],
      },
    ]);
    if (action === "shiyu") await showShiyuDefense();
    else if (action === "deadly") await showDeadlyAssault();
    else if (action === "void_front") await showVoidFrontDetail();
    else if (action === "deadly_summary") await showDeadlyAssaultSummary();
    else if (action === "shiyu_summary") await showShiyuDefenseSummary();
    else if (action === "void_front_summary") await showVoidFrontSummary();
    else if (action === "html") await generateHTMLReport();
    else if (action === "text") await generateTextReport();
    else if (action === "export_deadly") await exportDeadlyAssaultJSON();
    else if (action === "export_shiyu") await exportShiyuDefenseJSON();
    else if (action === "export_void_front") await exportVoidFrontJSON();
    else if (action === "export_all") await exportAllJSON();
    else if (action === "exit") break;
    console.log("\n---\n");
  }
}

// Command-line argument support for automated execution
async function handleCommandLineArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // No arguments, run interactive menu
    await mainMenu();
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case "export-deadly":
        await exportDeadlyAssaultJSON();
        break;
      case "export-shiyu":
        await exportShiyuDefenseJSON();
        break;
      case "export-void-front":
        await exportVoidFrontJSON();
        break;
      case "export-all":
        await exportAllJSON();
        break;
      case "deadly-summary":
        await showDeadlyAssaultSummary();
        break;
      case "shiyu-summary":
        await showShiyuDefenseSummary();
        break;
      case "void-front-summary":
        await showVoidFrontSummary();
        break;
      case "html":
        await generateHTMLReport();
        break;
      case "text":
        await generateTextReport();
        break;
      default:
        console.log("Available commands:");
        console.log("  export-deadly     - Export Deadly Assault as JSON");
        console.log("  export-shiyu      - Export Shiyu Defense as JSON");
        console.log("  export-void-front - Export Void Front as JSON");
        console.log("  export-all        - Export all as JSON");
        console.log("  deadly-summary    - Show Deadly Assault summary");
        console.log("  shiyu-summary     - Show Shiyu Defense summary");
        console.log("  void-front-summary- Show Void Front summary");
        console.log("  html              - Generate HTML report");
        console.log("  text              - Generate text report");
        console.log("  (no args)         - Run interactive menu");
        break;
    }
  } catch (error) {
    console.error("Error executing command:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  // Initialize API before running any commands
  initializeApi().then((success) => {
    if (success) {
      handleCommandLineArgs();
    } else {
      console.error(
        "❌ Failed to initialize API. Please check your authentication."
      );
      process.exit(1);
    }
  });
}
