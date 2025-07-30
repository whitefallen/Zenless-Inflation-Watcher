const inquirer = require("inquirer").default;
require("dotenv").config();
const ZZZApi = require("./zzzApi");
const fs = require("fs");
const Handlebars = require("handlebars");
const path = require("path");

const cookieString = process.env.COOKIE_STRING; // e.g., 'ltuid_v2=...; ltoken_v2=...; ...'
const uid = process.env.UID;
const api = new ZZZApi({ cookieString, uid });

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
          {
            name: "Show structured Deadly Assault summary",
            value: "deadly_summary",
          },
          {
            name: "Show structured Shiyu Defense summary",
            value: "shiyu_summary",
          },
          { name: "Generate HTML report", value: "html" },
          { name: "Generate text report", value: "text" },
          { name: "Exit", value: "exit" },
        ],
      },
    ]);
    if (action === "shiyu") await showShiyuDefense();
    else if (action === "deadly") await showDeadlyAssault();
    else if (action === "deadly_summary") await showDeadlyAssaultSummary();
    else if (action === "shiyu_summary") await showShiyuDefenseSummary();
    else if (action === "html") await generateHTMLReport();
    else if (action === "text") await generateTextReport();
    else if (action === "exit") break;
    console.log("\n---\n");
  }
}

if (require.main === module) {
  mainMenu();
}
