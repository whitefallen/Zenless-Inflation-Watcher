#!/usr/bin/env node
// Fetch a single Deadly Assault cycle and save it under deadlyAssault/.
//
// schedule_type=1 is the current cycle, 2 the previous one. Use this to backfill
// a cycle the Thursday workflow missed:
//
//   node auth.js                              # refresh cookies first
//   node scripts/fetch-da-cycle.js 2          # backfill the previous cycle
//   node scripts/fetch-da-cycle.js 2 --dry-run
//
// --dry-run prints the response shape without writing anything.

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const AuthHelper = require("../authHelper");
const AutomatedFetcher = require("../automatedFetch");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const scheduleType = Number(args.find((a) => /^\d+$/.test(a)) || 1);

(async () => {
  const uid = process.env.UID;
  if (!uid) {
    console.error("❌ No UID in environment");
    process.exit(1);
  }

  const authHelper = new AuthHelper();
  if (!(await authHelper.refreshAuthIfNeeded(uid))) {
    console.error("❌ Authentication failed — run `node auth.js` first.");
    process.exit(1);
  }
  const api = authHelper.createApiInstance(uid);

  console.log(`📊 Fetching Deadly Assault schedule_type=${scheduleType}...`);
  const payload = await AutomatedFetcher.fetchDeadlyAssault(
    api,
    uid,
    scheduleType,
  );

  const d = payload?.data || {};
  console.log(
    JSON.stringify(
      {
        retcode: payload?.retcode,
        message: payload?.message,
        dataKeys: Object.keys(d),
        has_data: d.has_data,
        zone_id: d.zone_id,
        listLen: Array.isArray(d.list) ? d.list.length : null,
        hardListLen: Array.isArray(d.hard_list) ? d.hard_list.length : null,
        total_score: d.total_score,
        total_star: d.total_star,
        start_time: d.start_time,
        end_time: d.end_time,
      },
      null,
      1,
    ),
  );

  const seasonId = AutomatedFetcher.getSeasonId("deadly", payload);
  if (!seasonId) {
    AutomatedFetcher.reportMissingSeasonId("Deadly Assault", payload);
    process.exit(1);
  }

  const file = path.join(
    __dirname,
    "..",
    "deadlyAssault",
    AutomatedFetcher.buildFileName("deadly", seasonId),
  );

  if (dryRun) {
    console.log(`🔍 Dry run — would write ${file}`);
    return;
  }

  if (fs.existsSync(file)) {
    console.log(`⏭️  ${file} already exists. Leaving it untouched.`);
    return;
  }

  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        ...payload,
        metadata: {
          exportDate: new Date().toISOString(),
          uid,
          type: "deadly_assault",
          automated: false,
        },
      },
      null,
      2,
    ),
  );
  console.log(`💾 Saved zone ${seasonId} to ${file}`);
})().catch((e) => {
  console.error("❌ Failed:", e.message);
  process.exit(1);
});
