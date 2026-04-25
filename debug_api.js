require("dotenv").config();
const AuthHelper = require("./authHelper");

async function debugApi() {
  const authHelper = new AuthHelper();
  const uid = process.env.UID;

  if (!uid) {
    console.log(
      "⚠️  No UID found in environment. Please set UID in .env file."
    );
    return;
  }

  try {
    console.log(`🔍 Debugging API for UID: ${uid}`);

    // Create API instance
    const api = authHelper.createApiInstance(uid);

    // Test different schedule_type values
    console.log("\n🧪 Testing different schedule_type values...");

    for (let schedule_type = 1; schedule_type <= 5; schedule_type++) {
      try {
        console.log(`\n📊 Testing schedule_type: ${schedule_type}`);

        // Test Shiyu Defense (Challenge)
        const shiyuData = await api.getChallenge({ uid, schedule_type });
        console.log(`✅ Shiyu Defense (schedule_type=${schedule_type}):`);
        console.log(JSON.stringify(shiyuData, null, 2));

        // Test Deadly Assault (Memory)
        const deadlyData = await api.getMemoryDetail({ uid, schedule_type });
        console.log(`✅ Deadly Assault (schedule_type=${schedule_type}):`);
        console.log(JSON.stringify(deadlyData, null, 2));

        // If we get actual data, break
        if (shiyuData.data || deadlyData.data) {
          console.log(`🎉 Found data with schedule_type: ${schedule_type}`);
          break;
        }
      } catch (error) {
        console.error(
          `❌ Error with schedule_type ${schedule_type}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  }
}

debugApi();
