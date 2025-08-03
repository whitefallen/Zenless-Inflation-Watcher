require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer").default;

class HoyolabAuth {
  constructor() {
    this.browser = null;
    this.page = null;
    this.cookies = {};
  }

  async init() {
    console.log("🚀 Starting browser...");
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for production
      defaultViewport: null,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    });

    this.page = await this.browser.newPage();

    // Set user agent to avoid detection
    await this.page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Disable request interception to avoid interference
    // await this.page.setRequestInterception(true);
    // this.page.on("request", (request) => {
    //   request.continue();
    // });
  }

  async login() {
    try {
      console.log("🌐 Navigating to Hoyolab...");
      await this.page.goto("https://www.hoyolab.com", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait for page to load and check if already logged in
      await this.page.waitForTimeout(3000);

      // Check if we're already logged in by looking for user avatar or login button
      const isLoggedIn = await this.page.evaluate(() => {
        // Look for elements that indicate logged in state
        const avatar =
          document.querySelector('[data-testid="avatar"]') ||
          document.querySelector(".avatar") ||
          document.querySelector('[class*="avatar"]');
        const loginBtn =
          document.querySelector('[data-testid="login"]') ||
          document.querySelector(".login") ||
          document.querySelector('[class*="login"]');

        return (
          !loginBtn && (avatar || !document.querySelector('a[href*="login"]'))
        );
      });

      if (isLoggedIn) {
        console.log("✅ Already logged in!");
        return true;
      }

      console.log("🔐 Need to login...");

      // Look for login button and click it
      const loginSelectors = [
        'a[href*="login"]',
        'button[data-testid="login"]',
        ".login",
        '[class*="login"]',
        'a:contains("Login")',
        'button:contains("Login")',
      ];

      let loginButton = null;
      for (const selector of loginSelectors) {
        try {
          loginButton = await this.page.$(selector);
          if (loginButton) break;
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!loginButton) {
        // Try to find login link by text content
        loginButton = await this.page.$x(
          "//a[contains(text(), 'Login') or contains(text(), 'Sign In')]"
        );
        if (loginButton.length > 0) {
          loginButton = loginButton[0];
        }
      }

      if (loginButton) {
        await loginButton.click();
        await this.page.waitForTimeout(2000);
      }

      // Wait for login form to appear
      await this.page.waitForTimeout(3000);

      // Check if we need to input credentials
      const needsCredentials = await this.page.evaluate(() => {
        return (
          document.querySelector(
            'input[type="email"], input[type="text"], input[name="username"]'
          ) !== null
        );
      });

      if (needsCredentials) {
        // Check if we have credentials in environment
        const email = process.env.HOYOLAB_EMAIL;
        const password = process.env.HOYOLAB_PASSWORD;

        if (email && password) {
          console.log(
            "🔐 Attempting automated login with stored credentials..."
          );
          return await this.performAutomatedLogin(email, password);
        } else {
          console.log("📝 Login form detected!");
          console.log(
            "💡 No credentials found in .env file - using manual login"
          );
          console.log(
            "💡 To enable automated login, add HOYOLAB_EMAIL and HOYOLAB_PASSWORD to your .env file"
          );
          console.log(
            "🔒 Browser automation is PAUSED to avoid interfering with your input."
          );
          console.log("💡 Please login manually in the browser window.");
          console.log(
            "⏳ The script will automatically continue after you complete login..."
          );
          console.log("⏱️  You have up to 10 minutes to complete login.");

          // Wait for user to manually login with gentle polling
          await this.page.waitForFunction(
            () => {
              // Check if we're logged in by looking for user elements
              const avatar =
                document.querySelector('[data-testid="avatar"]') ||
                document.querySelector(".avatar") ||
                document.querySelector('[class*="avatar"]');
              const userMenu =
                document.querySelector('[data-testid="user-menu"]') ||
                document.querySelector(".user-menu") ||
                document.querySelector('[class*="user"]');

              // Also check for logout buttons or user profile elements
              const logoutBtn =
                document.querySelector('[href*="logout"]') ||
                document.querySelector('[class*="logout"]');
              const profileBtn =
                document.querySelector('[href*="profile"]') ||
                document.querySelector('[class*="profile"]');

              // Check if login form is still visible (should be hidden after successful login)
              const loginForm = document.querySelector(
                'input[type="email"], input[type="text"], input[name="username"]'
              );
              const passwordField = document.querySelector(
                'input[type="password"]'
              );

              // More strict login detection - must have user elements AND no login form
              const hasUserElements =
                avatar || userMenu || logoutBtn || profileBtn;
              const noLoginForm = !loginForm && !passwordField;

              return hasUserElements && noLoginForm;
            },
            {
              timeout: 600000, // 10 minute timeout
              polling: 5000, // Check every 5 seconds to be very gentle
            }
          );

          console.log("✅ Login detected!");

          // Give extra time for all cookies to be set
          console.log("⏳ Waiting for cookies to be set...");
          await this.page.waitForTimeout(5000);
        }
      }

      // Wait a bit more for all cookies to be set
      await this.page.waitForTimeout(3000);

      return true;
    } catch (error) {
      console.error("❌ Login failed:", error.message);
      return false;
    }
  }

  async performAutomatedLogin(email, password) {
    try {
      console.log("🤖 Performing automated login...");

      // Wait for iframe to load
      console.log("⏳ Waiting for login iframe to load...");
      await this.page.waitForSelector("#hyv-account-frame", { timeout: 15000 });

      // Debug: List all frames
      const allFrames = this.page.frames();
      console.log(`🔍 Found ${allFrames.length} frames:`);
      allFrames.forEach((f, i) => {
        console.log(`  Frame ${i}: name="${f.name()}", url="${f.url()}"`);
      });

      // Switch to iframe context
      const frames = this.page.frames();
      const frame = frames.find((f) => f.name() === "hyv-account-frame");
      if (!frame) {
        throw new Error("Could not find login iframe");
      }
      console.log("✅ Switched to login iframe");

      // Wait for login form to be ready inside iframe
      console.log("⏳ Waiting for login form inside iframe...");
      await frame.waitForSelector(
        'input[type="email"], input[type="text"], input[name="username"]',
        { timeout: 10000 }
      );

      // Debug: List all input fields in iframe
      const inputs = await frame.$$("input");
      console.log(`🔍 Found ${inputs.length} input fields in iframe:`);
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const type = await input.evaluate((el) => el.getAttribute("type"));
        const name = await input.evaluate((el) => el.getAttribute("name"));
        const placeholder = await input.evaluate((el) =>
          el.getAttribute("placeholder")
        );
        console.log(
          `  Input ${i}: type="${type}", name="${name}", placeholder="${placeholder}"`
        );
      }

      // Clear any existing content and find email/username field
      const emailSelectors = [
        'input[name="username"]',
        'div[name="username"] input',
        'input[type="email"]',
        'input[name="email"]',
        'input[placeholder*="email" i]',
        'input[placeholder*="username" i]',
        'input[type="text"]',
      ];

      let emailField = null;
      for (const selector of emailSelectors) {
        emailField = await frame.$(selector);
        if (emailField) {
          console.log(`✅ Found email field with selector: ${selector}`);
          break;
        }
      }

      if (emailField) {
        await emailField.click();
        await emailField.evaluate((el) => (el.value = "")); // Clear existing value
        await emailField.type(email, { delay: 50 });
        console.log("✅ Email entered");
      } else {
        throw new Error("Could not find email field");
      }

      // Find password field and fill it
      const passwordSelectors = [
        'input[name="password"]',
        'div[name="password"] input',
        'input[type="password"]',
        'input[placeholder*="password" i]',
      ];

      let passwordField = null;
      for (const selector of passwordSelectors) {
        passwordField = await frame.$(selector);
        if (passwordField) {
          console.log(`✅ Found password field with selector: ${selector}`);
          break;
        }
      }

      if (passwordField) {
        await passwordField.click();
        await passwordField.evaluate((el) => (el.value = "")); // Clear existing value
        await passwordField.type(password, { delay: 50 });
        console.log("✅ Password entered");
      } else {
        throw new Error("Could not find password field");
      }

      // Find and click login button
      const loginButtonSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button[class*="login"]',
        'button[class*="submit"]',
        'button:contains("Login")',
        'button:contains("Sign In")',
        'button:contains("Submit")',
      ];

      let loginButton = null;
      for (const selector of loginButtonSelectors) {
        try {
          loginButton = await frame.$(selector);
          if (loginButton) {
            console.log(`✅ Found login button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!loginButton) {
        // Try to find by text content using XPath
        const xpathSelectors = [
          "//button[contains(text(), 'Login')]",
          "//button[contains(text(), 'Sign In')]",
          "//button[contains(text(), 'Submit')]",
          "//input[@type='submit']",
        ];

        for (const xpath of xpathSelectors) {
          loginButton = await frame.$x(xpath);
          if (loginButton.length > 0) {
            loginButton = loginButton[0];
            console.log(`✅ Found login button with XPath: ${xpath}`);
            break;
          }
        }
      }

      if (loginButton) {
        await loginButton.click();
        console.log("✅ Login button clicked");
      } else {
        throw new Error("Could not find login button");
      }

      // Switch back to main page context for login detection
      console.log("🔄 Switching back to main page context...");

      // Wait for login to complete with better detection
      console.log("⏳ Waiting for login to complete...");
      await this.page.waitForFunction(
        () => {
          // Check if we're logged in by looking for user elements
          const avatar =
            document.querySelector('[data-testid="avatar"]') ||
            document.querySelector(".avatar") ||
            document.querySelector('[class*="avatar"]');
          const userMenu =
            document.querySelector('[data-testid="user-menu"]') ||
            document.querySelector(".user-menu") ||
            document.querySelector('[class*="user"]');

          // Also check for logout buttons or user profile elements
          const logoutBtn =
            document.querySelector('[href*="logout"]') ||
            document.querySelector('[class*="logout"]');
          const profileBtn =
            document.querySelector('[href*="profile"]') ||
            document.querySelector('[class*="profile"]');

          // Check if login form is still visible (should be hidden after successful login)
          const loginForm = document.querySelector(
            'input[type="email"], input[type="text"], input[name="username"]'
          );
          const passwordField = document.querySelector(
            'input[type="password"]'
          );

          // Check if iframe is still visible (should be hidden after successful login)
          const iframe = document.querySelector("#hyv-account-frame");
          const iframeVisible =
            iframe &&
            iframe.style.display !== "none" &&
            iframe.style.visibility !== "hidden";

          // More flexible login detection - either user elements OR no login form/iframe
          const hasUserElements = avatar || userMenu || logoutBtn || profileBtn;
          const noLoginForm = !loginForm && !passwordField;
          const noLoginIframe = !iframeVisible;

          console.log("Login detection:", {
            hasUserElements,
            noLoginForm,
            noLoginIframe,
            avatar: !!avatar,
            userMenu: !!userMenu,
            logoutBtn: !!logoutBtn,
            profileBtn: !!profileBtn,
            loginForm: !!loginForm,
            passwordField: !!passwordField,
            iframeVisible,
          });

          return hasUserElements || (noLoginForm && noLoginIframe);
        },
        {
          timeout: 30000, // 30 second timeout for automated login
          polling: 1000, // Check every second
        }
      );

      console.log("✅ Automated login successful!");

      // Give extra time for all cookies to be set
      console.log("⏳ Waiting for cookies to be set...");
      await this.page.waitForTimeout(5000);

      return true;
    } catch (error) {
      console.error("❌ Automated login failed:", error.message);
      console.log("🔄 Falling back to manual login...");
      return false;
    }
  }

  async extractCookies() {
    console.log("🍪 Extracting cookies...");

    try {
      // Wait a moment for cookies to be fully set
      await this.page.waitForTimeout(2000);

      const allCookies = await this.page.cookies();

      // Map of cookie names we need (including all from HAR file)
      const requiredCookies = {
        mi18nLang: "MI18NLANG",
        _HYVUUID: "_HYVUUID",
        _MHYUUID: "_MHYUUID",
        cookie_token_v2: "COOKIE_TOKEN_V2",
        account_mid_v2: "ACCOUNT_MID_V2",
        account_id_v2: "ACCOUNT_ID_V2",
        ltoken_v2: "LTOKEN_V2",
        ltmid_v2: "LTMID_V2",
        ltuid_v2: "LTUID_V2",
        DEVICEFP: "DEVICEFP",
        // Additional cookies from HAR file
        HYV_LOGIN_PLATFORM_OPTIONAL_AGREEMENT:
          "HYV_LOGIN_PLATFORM_OPTIONAL_AGREEMENT",
        HYV_LOGIN_PLATFORM_LOAD_TIMEOUT: "HYV_LOGIN_PLATFORM_LOAD_TIMEOUT",
        HYV_LOGIN_PLATFORM_TRACKING_MAP: "HYV_LOGIN_PLATFORM_TRACKING_MAP",
        HYV_LOGIN_PLATFORM_LIFECYCLE_ID: "HYV_LOGIN_PLATFORM_LIFECYCLE_ID",
        DEVICEFP_SEED_ID: "DEVICEFP_SEED_ID",
        DEVICEFP_SEED_TIME: "DEVICEFP_SEED_TIME",
        // Fallback to v1 cookies
        ltuid: "LTUID",
        ltoken: "LTOKEN",
        cookie_token: "COOKIE_TOKEN",
        account_id: "ACCOUNT_ID",
        account_mid: "ACCOUNT_MID",
        ltmid: "LTMID",
      };

      const extractedCookies = {};

      for (const cookie of allCookies) {
        const envKey = requiredCookies[cookie.name];
        if (envKey) {
          extractedCookies[envKey] = cookie.value;
          console.log(
            `✅ Found ${envKey}: ${cookie.value.substring(0, 20)}...`
          );
        }
      }

      return extractedCookies;
    } catch (error) {
      console.error("❌ Error extracting cookies:", error.message);
      return {};
    }
  }

  async saveToEnv(cookies) {
    const envPath = path.join(__dirname, ".env");
    const envExamplePath = path.join(__dirname, ".env_example");

    let envContent = "";

    // Read existing .env if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    } else if (fs.existsSync(envExamplePath)) {
      envContent = fs.readFileSync(envExamplePath, "utf8");
    }

    // Update or add cookie values
    for (const [key, value] of Object.entries(cookies)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      const newLine = `${key}=${value}`;

      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${newLine}`;
      }
    }

    fs.writeFileSync(envPath, envContent.trim() + "\n");
    console.log(`💾 Saved cookies to ${envPath}`);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();

      const loginSuccess = await this.login();
      if (!loginSuccess) {
        throw new Error("Login failed");
      }

      const cookies = await this.extractCookies();

      if (Object.keys(cookies).length === 0) {
        console.log(
          "⚠️  No required cookies found. Make sure you are logged in to Hoyolab."
        );
        return;
      }

      console.log(
        `\n🎉 Successfully extracted ${Object.keys(cookies).length} cookies!`
      );

      const { saveToFile } = await inquirer.prompt([
        {
          type: "confirm",
          name: "saveToFile",
          message: "Save cookies to .env file?",
          default: true,
        },
      ]);

      if (saveToFile) {
        await this.saveToEnv(cookies);
      }

      console.log("\n📋 Extracted cookies:");
      for (const [key, value] of Object.entries(cookies)) {
        console.log(`${key}=${value}`);
      }
    } catch (error) {
      console.error("❌ Authentication failed:", error.message);
    } finally {
      await this.close();
    }
  }
}

// Run the authentication if this file is executed directly
if (require.main === module) {
  const auth = new HoyolabAuth();
  auth.run().catch(console.error);
}

module.exports = HoyolabAuth;
