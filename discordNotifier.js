const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

class DiscordNotifier {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  // Send a simple message
  async sendMessage(content, username = "ZZZ Battle Bot") {
    if (!this.webhookUrl) {
      console.log("⚠️  No Discord webhook URL configured");
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          content: content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status}`);
      }

      console.log("✅ Discord notification sent");
    } catch (error) {
      console.error("❌ Failed to send Discord notification:", error.message);
    }
  }

  // Send an embedded message with rich formatting
  async sendEmbed(embed, username = "ZZZ Battle Bot") {
    if (!this.webhookUrl) {
      console.log("⚠️  No Discord webhook URL configured");
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          embeds: [embed],
        }),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status}`);
      }

      console.log("✅ Discord embed sent");
    } catch (error) {
      console.error("❌ Failed to send Discord embed:", error.message);
    }
  }

  // Notification for successful data fetch
  async notifyDataFetchSuccess(data, uid, schedule = {}) {
    const fields = [];

    // Add Deadly Assault field
    if (schedule.deadly) {
      fields.push({
        name: "Deadly Assault",
        value: data.deadly
          ? `✅ ${data.deadly.data?.list?.length || 0} records`
          : "❌ No data",
        inline: true,
      });
    }

    // Add Shiyu Defense field
    if (schedule.shiyu) {
      let recordCount = 0;
      if (data.shiyu) {
        if (data.shiyu.data?.hadal_ver === "v2") {
          // Hadal v2 format - count teams from 4th and 5th floors
          recordCount =
            (data.shiyu.data?.hadal_info_v2?.fitfh_layer_detail
              ?.layer_challenge_info_list?.length || 0) +
            (data.shiyu.data?.hadal_info_v2?.fourth_layer_detail
              ?.layer_challenge_info_list?.length || 0);
        } else {
          // Legacy v1 format
          recordCount = data.shiyu.data?.all_floor_detail?.length || 0;
        }
      }
      fields.push({
        name: "Shiyu Defense (Hadal)",
        value: data.shiyu ? `✅ ${recordCount} teams` : "❌ No data",
        inline: true,
      });
    }

    // Add Void Front field
    if (schedule.voidfront) {
      fields.push({
        name: "Void Front",
        value: data.voidfront
          ? `✅ ${
              data.voidfront.data?.main_challenge_record_list?.length || 0
            } records`
          : "❌ No data",
        inline: true,
      });
    }

    // Add player info
    const playerName =
      data.deadly?.data?.nick_name ||
      data.shiyu?.data?.nick_name || // v2 format
      data.shiyu?.data?.hadal_info_v2?.nick_name || // v1 legacy
      data.voidfront?.data?.role_basic_info?.nickname ||
      "Unknown";
    fields.push({
      name: "Player",
      value: playerName,
      inline: true,
    });

    const embed = {
      color: 0x00ff00, // Green
      title: "🎉 ZZZ Battle Data Updated",
      description: `Successfully fetched battle data for UID: ${uid}`,
      fields: fields,
      timestamp: new Date().toISOString(),
      footer: {
        text: "ZZZ Battle Bot",
      },
    };

    await this.sendEmbed(embed);
  }

  // Notification for authentication failure
  async notifyAuthFailure(error, uid) {
    const embed = {
      color: 0xff0000, // Red
      title: "❌ ZZZ Authentication Failed",
      description: `Failed to authenticate for UID: ${uid}`,
      fields: [
        {
          name: "Error",
          value: error.message || "Unknown error",
          inline: false,
        },
        {
          name: "Action Required",
          value: "Check credentials and re-authenticate manually",
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "ZZZ Battle Bot",
      },
    };

    await this.sendEmbed(embed);
  }

  // Notification for API failure
  async notifyApiFailure(error, uid, endpoint) {
    const embed = {
      color: 0xffa500, // Orange
      title: "⚠️ ZZZ API Error",
      description: `API request failed for UID: ${uid}`,
      fields: [
        {
          name: "Endpoint",
          value: endpoint || "Unknown",
          inline: true,
        },
        {
          name: "Error",
          value: error.message || "Unknown error",
          inline: true,
        },
        {
          name: "Action Required",
          value: "Check if cookies are still valid",
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "ZZZ Battle Bot",
      },
    };

    await this.sendEmbed(embed);
  }

  // Notification for workflow start
  async notifyWorkflowStart(uid, schedule = {}) {
    const fields = [
      {
        name: "Timestamp",
        value: new Date().toLocaleString(),
        inline: true,
      },
      {
        name: "Environment",
        value: process.env.NODE_ENV || "development",
        inline: true,
      },
    ];

    // Add schedule information
    if (schedule.deadly || schedule.shiyu || schedule.voidfront) {
      const modes = [];
      if (schedule.deadly) modes.push("Deadly Assault");
      if (schedule.shiyu) modes.push("Shiyu Defense");
      if (schedule.voidfront) modes.push("Void Front");

      fields.push({
        name: "Fetching Modes",
        value: modes.join(", "),
        inline: false,
      });
    }

    const embed = {
      color: 0x0099ff, // Blue
      title: "🚀 ZZZ Data Fetch Started",
      description: `Starting automated data fetch for UID: ${uid}`,
      fields: fields,
      timestamp: new Date().toISOString(),
      footer: {
        text: "ZZZ Battle Bot",
      },
    };

    await this.sendEmbed(embed);
  }

  // Notification fired only when one or more modes saved a NEW season file
  // (i.e. a season transition was detected). saveResult is the structure
  // returned by AutomatedFetcher#saveData; data is the parsed payload, used
  // to surface the headline score for each newly-tracked season.
  async notifyNewSeason(saveResult, data, uid) {
    const newSeasons = [];

    if (saveResult?.deadly?.isNew && data.deadly) {
      const score = data.deadly.data?.total_score ?? 0;
      const stars = data.deadly.data?.total_star ?? 0;
      newSeasons.push({
        name: "Deadly Assault",
        seasonId: saveResult.deadly.seasonId,
        summary: `Score ${score.toLocaleString()} · ${stars}★`,
        emoji: "⚔️",
      });
    }

    if (saveResult?.shiyu?.isNew && data.shiyu) {
      const v2 = data.shiyu.data?.hadal_ver === "v2";
      const score = v2
        ? data.shiyu.data?.hadal_info_v2?.brief?.score
        : data.shiyu.data?.hadal_score;
      const rating = v2
        ? data.shiyu.data?.hadal_info_v2?.brief?.rating
        : data.shiyu.data?.rating_list?.[0]?.rating;
      newSeasons.push({
        name: "Shiyu Defense (Hadal)",
        seasonId: saveResult.shiyu.seasonId,
        summary: `Score ${score?.toLocaleString?.() ?? "—"} · Rating ${rating ?? "—"}`,
        emoji: "🏯",
      });
    }

    if (saveResult?.voidfront?.isNew && data.voidfront) {
      const brief =
        data.voidfront.data?.void_front_battle_abstract_info_brief;
      const score = brief?.total_score ?? 0;
      const ending = brief?.ending_record_name || "Unknown ending";
      newSeasons.push({
        name: "Void Front",
        seasonId: saveResult.voidfront.seasonId,
        summary: `Score ${score.toLocaleString()} · ${ending}`,
        emoji: "🌌",
      });
    }

    if (newSeasons.length === 0) return;

    const playerName =
      data.deadly?.data?.nick_name ||
      data.shiyu?.data?.nick_name ||
      data.shiyu?.data?.hadal_info_v2?.nick_name ||
      data.voidfront?.data?.role_basic_info?.nickname ||
      "Unknown";

    const embed = {
      color: 0xa855f7, // ZZZ purple
      title: `🆕 New ${newSeasons.length === 1 ? "season" : "seasons"} detected`,
      description: `Tracked a new season for **${playerName}** (UID ${uid}).`,
      fields: newSeasons.map((s) => ({
        name: `${s.emoji} ${s.name}`,
        value: `\`${s.seasonId ?? "—"}\`\n${s.summary}`,
        inline: true,
      })),
      timestamp: new Date().toISOString(),
      footer: { text: "ZZZ Battle Bot · new-season alert" },
    };

    await this.sendEmbed(embed);
  }

  // Notification for rate limiting
  async notifyRateLimit(uid) {
    const embed = {
      color: 0xffff00, // Yellow
      title: "⏳ ZZZ Rate Limited",
      description: `Rate limited while fetching data for UID: ${uid}`,
      fields: [
        {
          name: "Action",
          value: "Will retry later",
          inline: true,
        },
        {
          name: "Next Attempt",
          value: "In 30 minutes",
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "ZZZ Battle Bot",
      },
    };

    await this.sendEmbed(embed);
  }
}

module.exports = DiscordNotifier;
