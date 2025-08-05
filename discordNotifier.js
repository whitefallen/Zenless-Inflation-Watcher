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
      fields.push({
        name: "Shiyu Defense",
        value: data.shiyu
          ? `✅ ${data.shiyu.data?.all_floor_detail?.length || 0} records`
          : "❌ No data",
        inline: true,
      });
    }

    // Add player info
    const playerName =
      data.deadly?.data?.nick_name || data.shiyu?.data?.nick_name || "Unknown";
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
    if (schedule.deadly || schedule.shiyu) {
      const modes = [];
      if (schedule.deadly) modes.push("Deadly Assault");
      if (schedule.shiyu) modes.push("Shiyu Defense");

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
