const HoyolabAuth = require("./auth");
const ZZZApi = require("./zzzApi");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

class AuthHelper {
  constructor() {
    this.envPath = path.join(__dirname, ".env");
  }

  // Check if we have valid cookies in .env file
  hasValidCookies() {
    if (!fs.existsSync(this.envPath)) {
      return false;
    }

    const envContent = fs.readFileSync(this.envPath, "utf8");
    const requiredCookies = [
      "LTUID_V2",
      "LTOKEN_V2",
      "COOKIE_TOKEN_V2",
      "ACCOUNT_ID_V2",
    ];

    return requiredCookies.every(
      (cookie) =>
        envContent.includes(`${cookie}=`) && !envContent.includes(`${cookie}=`)
    );
  }

  // Load cookies from .env file
  loadCookiesFromEnv() {
    const cookies = {};

    if (fs.existsSync(this.envPath)) {
      const envContent = fs.readFileSync(this.envPath, "utf8");
      const lines = envContent.split("\n");

      for (const line of lines) {
        const [key, value] = line.split("=");
        if (key && value) {
          // Convert cookie names to lowercase to match ZZZApi expectations
          const cookieKey = key.trim().toLowerCase();
          cookies[cookieKey] = value.trim();
        }
      }
    }

    return cookies;
  }

  // Create ZZZApi instance with cookies from .env
  createApiInstance(uid) {
    const cookies = this.loadCookiesFromEnv();

    if (Object.keys(cookies).length === 0) {
      throw new Error(
        "No cookies found in .env file. Run authentication first."
      );
    }

    return new ZZZApi({ cookies, uid });
  }

  // Authenticate and create API instance
  async authenticateAndCreateApi(uid) {
    console.log("🔍 Checking authentication status...");

    if (!this.hasValidCookies()) {
      console.log("⚠️  No valid cookies found. Starting authentication...");
      const auth = new HoyolabAuth();
      await auth.run();
    }

    return this.createApiInstance(uid);
  }

  // Test the API connection
  async testConnection(uid) {
    try {
      const api = this.createApiInstance(uid);
      console.log("🧪 Testing API connection...");

      // Try to fetch Deadly Assault data (more reliable than Shiyu Defense)
      const deadlyData = await api.getMemoryDetail({ uid });
      console.log("✅ API connection successful!");
      console.log(
        `📊 Found ${deadlyData?.data?.list?.length || 0} challenge records`
      );

      return true;
    } catch (error) {
      console.error("❌ API connection failed:", error.message);
      return false;
    }
  }

  // Refresh authentication if needed
  async refreshAuthIfNeeded(uid) {
    console.log("🔄 Checking if authentication needs refresh...");

    const connectionWorks = await this.testConnection(uid);

    if (!connectionWorks) {
      console.log(
        "🔄 Authentication expired or invalid. Starting fresh authentication..."
      );
      const auth = new HoyolabAuth();
      await auth.run();

      // Test again after refresh
      return await this.testConnection(uid);
    }

    return true;
  }
}

// Export for use in other files
module.exports = AuthHelper;

// Example usage when run directly
if (require.main === module) {
  const helper = new AuthHelper();

  const testAuth = async () => {
    try {
      // Get UID from environment or prompt
      const uid = process.env.UID;
      if (!uid) {
        console.log(
          "⚠️  No UID found in environment. Please set UID in .env file."
        );
        return;
      }

      console.log(`🔍 Testing authentication for UID: ${uid}`);

      const success = await helper.refreshAuthIfNeeded(uid);

      if (success) {
        console.log("🎉 Authentication is working properly!");
      } else {
        console.log("❌ Authentication failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
    }
  };

  testAuth();
}
