require("dotenv").config();
const AuthHelper = require("./authHelper");
const DiscordNotifier = require("./discordNotifier");
const fs = require("fs");
const path = require("path");

class AutomatedFetcher {
  constructor() {
    this.authHelper = new AuthHelper();
    this.discord = new DiscordNotifier(process.env.DISCORD_WEBHOOK_URL);
    this.dataDir = path.join(__dirname, "data");

    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Reset schedule configuration
    this.resetSchedules = {
      shiyu: {
        // Shiyu Defense reset cycle (14 days)
        // Last reset: 2025-07-31, next: 2025-08-14, 2025-08-28, etc.
        baseDate: new Date("2025-07-31"),
        intervalDays: 14,
        name: "Shiyu Defense",
      },
      deadly: {
        // Deadly Assault reset cycle (14 days, offset by 7 days)
        // Last reset: 2025-08-07, next: 2025-08-21, 2025-09-04, etc.
        baseDate: new Date("2025-08-07"),
        intervalDays: 14,
        name: "Deadly Assault",
      },
    };
  }

  // Always fetch both modes - scores only update when there's a new high score
  shouldFetchMode(mode) {
    const schedule = this.resetSchedules[mode];
    const now = new Date();

    // Calculate days since the base reset date for logging
    const daysSinceBase = Math.floor(
      (now - schedule.baseDate) / (1000 * 60 * 60 * 24)
    );
    const daysSinceLastReset = daysSinceBase % schedule.intervalDays;

    console.log(
      `📅 ${schedule.name}: ${daysSinceLastReset} days since last reset (Always fetch)`
    );

    return true; // Always fetch both modes
  }

  // Main fetch function
  async fetchData() {
    const uid = process.env.UID;

    if (!uid) {
      console.error("❌ No UID found in environment");
      await this.discord.sendMessage(
        "❌ No UID configured for automated fetch"
      );
      return { success: false, error: "No UID configured" };
    }

    console.log(`🚀 Starting automated data fetch for UID: ${uid}`);
    console.log("📅 Checking reset schedules...");

    // Always fetch both modes - scores only update when there's a new high score
    const shouldFetchDeadly = this.shouldFetchMode("deadly");
    const shouldFetchShiyu = this.shouldFetchMode("shiyu");

    console.log("📊 Fetching both Deadly Assault and Shiyu Defense data");

    await this.discord.notifyWorkflowStart(uid, {
      deadly: shouldFetchDeadly,
      shiyu: shouldFetchShiyu,
    });

    try {
      // Check authentication and refresh if needed
      console.log("🔍 Checking authentication...");
      const authSuccess = await this.authHelper.refreshAuthIfNeeded(uid);

      if (!authSuccess) {
        console.error("❌ Authentication failed");
        await this.discord.notifyAuthFailure(
          new Error("Authentication check failed"),
          uid
        );
        return { success: false, error: "Authentication failed" };
      }

      // Create API instance
      const api = this.authHelper.createApiInstance(uid);

      // Fetch data based on reset schedules
      const data = await this.fetchScheduledData(api, uid, {
        deadly: shouldFetchDeadly,
        shiyu: shouldFetchShiyu,
      });

      // Save data to files
      await this.saveData(data, uid);

      // Send success notification
      await this.discord.notifyDataFetchSuccess(data, uid, {
        deadly: shouldFetchDeadly,
        shiyu: shouldFetchShiyu,
      });

      console.log("✅ Automated fetch completed successfully");
      return { success: true, data };
    } catch (error) {
      console.error("❌ Automated fetch failed:", error.message);

      // Determine error type and send appropriate notification
      if (
        error.message.includes("rate limit") ||
        error.message.includes("too many requests")
      ) {
        await this.discord.notifyRateLimit(uid);
      } else if (
        error.message.includes("authentication") ||
        error.message.includes("login")
      ) {
        await this.discord.notifyAuthFailure(error, uid);
      } else {
        await this.discord.notifyApiFailure(error, uid, "unknown");
      }

      return { success: false, error: error.message };
    }
  }

  // Fetch data based on reset schedules
  async fetchScheduledData(api, uid, schedule) {
    const data = {};

    if (schedule.deadly) {
      try {
        console.log("📊 Fetching Deadly Assault data...");
        data.deadly = await api.getMemoryDetail({ uid });
        console.log(
          `✅ Deadly Assault: ${data.deadly?.data?.list?.length || 0} records`
        );
      } catch (error) {
        console.error("❌ Deadly Assault fetch failed:", error.message);
        data.deadly = null;
      }
    } else {
      console.log("⏭️  Skipping Deadly Assault (not in reset window)");
    }

    if (schedule.shiyu) {
      try {
        console.log("📊 Fetching Shiyu Defense data...");
        data.shiyu = await api.getChallenge({ uid });
        console.log(
          `✅ Shiyu Defense: ${data.shiyu?.data?.list?.length || 0} records`
        );
      } catch (error) {
        console.error("❌ Shiyu Defense fetch failed:", error.message);
        data.shiyu = null;
      }
    } else {
      console.log("⏭️  Skipping Shiyu Defense (not in reset window)");
    }

    return data;
  }

  // Get current month and week for file naming
  getCurrentMonthWeek() {
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

  // Save data to files using battleRecords.js pattern
  async saveData(data, uid) {
    const { month, week } = this.getCurrentMonthWeek();
    const timestamp = new Date().toISOString();

    // Save Deadly Assault data
    if (data.deadly) {
      const deadlyFolder = path.join(__dirname, "deadlyAssault");
      if (!fs.existsSync(deadlyFolder)) {
        fs.mkdirSync(deadlyFolder, { recursive: true });
      }

      const deadlyFile = path.join(deadlyFolder, `${month}_week${week}.json`);
      const deadlyData = {
        ...data.deadly,
        metadata: {
          exportDate: timestamp,
          uid: uid,
          type: "deadly_assault",
          automated: true,
        },
      };
      fs.writeFileSync(deadlyFile, JSON.stringify(deadlyData, null, 2));
      console.log(`💾 Saved Deadly Assault data to: ${deadlyFile}`);
    }

    // Save Shiyu Defense data
    if (data.shiyu) {
      const shiyuFolder = path.join(__dirname, "shiyu");
      if (!fs.existsSync(shiyuFolder)) {
        fs.mkdirSync(shiyuFolder, { recursive: true });
      }

      const shiyuFile = path.join(shiyuFolder, `${month}_week${week}.json`);
      const shiyuData = {
        ...data.shiyu,
        metadata: {
          exportDate: timestamp,
          uid: uid,
          type: "shiyu_defense",
          automated: true,
        },
      };
      fs.writeFileSync(shiyuFile, JSON.stringify(shiyuData, null, 2));
      console.log(`💾 Saved Shiyu Defense data to: ${shiyuFile}`);
    }

    // Also save to data/ directory for backward compatibility
    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save latest files for easy access
    const latestDeadlyFile = path.join(
      dataDir,
      `deadly-assault_${uid}_latest.json`
    );
    const latestShiyuFile = path.join(
      dataDir,
      `shiyu-defense_${uid}_latest.json`
    );

    if (data.deadly) {
      fs.writeFileSync(latestDeadlyFile, JSON.stringify(data.deadly, null, 2));
    }
    if (data.shiyu) {
      fs.writeFileSync(latestShiyuFile, JSON.stringify(data.shiyu, null, 2));
    }
  }

  // Get data summary for notifications
  getDataSummary(data) {
    const summary = {
      deadly: {
        count: data.deadly?.data?.list?.length || 0,
        player: data.deadly?.data?.nick_name || "Unknown",
        totalScore: data.deadly?.data?.total_score || 0,
        totalStars: data.deadly?.data?.total_star || 0,
      },
      shiyu: {
        count: data.shiyu?.data?.list?.length || 0,
        player: data.shiyu?.data?.nick_name || "Unknown",
        totalScore: data.shiyu?.data?.total_score || 0,
        totalStars: data.shiyu?.data?.total_star || 0,
      },
    };

    return summary;
  }

  // Get next reset dates for debugging
  getNextResetDates() {
    const now = new Date();
    const dates = {};

    Object.keys(this.resetSchedules).forEach((mode) => {
      const schedule = this.resetSchedules[mode];
      const daysSinceBase = Math.floor(
        (now - schedule.baseDate) / (1000 * 60 * 60 * 24)
      );
      const daysSinceLastReset = daysSinceBase % schedule.intervalDays;
      const daysUntilNextReset = schedule.intervalDays - daysSinceLastReset;

      const nextReset = new Date(now);
      nextReset.setDate(now.getDate() + daysUntilNextReset);

      dates[mode] = {
        daysSinceLastReset,
        daysUntilNextReset,
        nextResetDate: nextReset.toISOString().split("T")[0],
      };
    });

    return dates;
  }
}

// Export for use in other files
module.exports = AutomatedFetcher;

// Run if called directly
if (require.main === module) {
  const fetcher = new AutomatedFetcher();

  // Show next reset dates for debugging
  console.log("📅 Next reset dates:");
  const resetDates = fetcher.getNextResetDates();
  Object.keys(resetDates).forEach((mode) => {
    const info = resetDates[mode];
    console.log(
      `  ${fetcher.resetSchedules[mode].name}: ${info.nextResetDate} (${info.daysUntilNextReset} days)`
    );
  });

  fetcher
    .fetchData()
    .then((result) => {
      if (result.success) {
        console.log("🎉 Automated fetch completed successfully");
        process.exit(0);
      } else {
        console.error("❌ Automated fetch failed:", result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Unexpected error:", error.message);
      process.exit(1);
    });
}
