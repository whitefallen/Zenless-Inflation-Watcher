# Hoyolab Authentication System

This project now includes an automated authentication system using Puppeteer to login to Hoyolab and extract the necessary cookies for the ZZZ API client.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Copy the example environment file and add your UID:

```bash
cp .env_example .env
```

Edit `.env` and add your UID:

```
UID=your_uid_here
```

**Optional: For automated login, add your Hoyolab credentials:**

```
HOYOLAB_EMAIL=your_email@example.com
HOYOLAB_PASSWORD=your_password_here
```

### 3. Run Authentication

```bash
npm run auth
```

This will:

- Open a browser window
- Navigate to Hoyolab
- **Automated login** (if credentials provided) or **manual login** (if no credentials)
- Extract all necessary cookies
- Save them to your `.env` file

## 🔧 How It Works

### Authentication Flow

1. **Browser Launch**: Puppeteer opens a Chrome browser window
2. **Navigation**: Goes to https://www.hoyolab.com
3. **Login Detection**: Checks if already logged in
4. **Login Method**:
   - **Automated**: If credentials provided in `.env`, automatically fills and submits login form
   - **Manual**: If no credentials, waits for you to login manually
5. **Cookie Extraction**: Extracts all required cookies
6. **Environment Save**: Saves cookies to `.env` file

### Required Cookies

The system extracts these cookies from Hoyolab:

- `MI18NLANG` - Language preference
- `_HYVUUID` - User UUID
- `_MHYUUID` - User UUID (alternative)
- `COOKIE_TOKEN_V2` - Authentication token
- `ACCOUNT_MID_V2` - Account ID
- `ACCOUNT_ID_V2` - Account ID
- `LTOKEN_V2` - Login token
- `LTMID_V2` - Login token ID
- `LTUID_V2` - User ID
- `DEVICEFP` - Device fingerprint

## 📁 Files Overview

### Core Files

- **`auth.js`** - Main authentication script using Puppeteer
- **`authHelper.js`** - Helper class for API integration
- **`zzzApi.js`** - Updated API client that works with the auth system
- **`battleRecords.js`** - Updated main application with auth integration

### Configuration Files

- **`.env_example`** - Template for environment variables
- **`.env`** - Your actual environment file (created after auth)

## 🛠️ Usage

### Run Authentication

```bash
# Run authentication (opens browser for manual login)
npm run auth

# Or run directly
node auth.js
```

### Test Authentication

```bash
# Test if authentication is working
node authHelper.js
```

### Use in Your Code

```javascript
const AuthHelper = require("./authHelper");

const authHelper = new AuthHelper();

// Initialize API with authentication
const api = await authHelper.authenticateAndCreateApi(uid);

// Or test connection
const isWorking = await authHelper.testConnection(uid);
```

### How It Works

1. **Opens browser** and navigates to Hoyolab
2. **Detects if already logged in** - if so, skips login
3. **If login needed**:
   - **With credentials**: Automatically fills and submits login form
   - **Without credentials**: Opens login form and waits for manual input
4. **Detects successful login** - automatically continues
5. **Extracts cookies** - saves them to your `.env` file

## 🔄 Automatic Refresh

The system automatically:

1. **Checks** if cookies are valid
2. **Tests** API connection
3. **Refreshes** authentication if needed
4. **Retries** failed requests

## 🚨 Troubleshooting

### Common Issues

1. **"No cookies found"**

   - Run `npm run auth` to authenticate
   - Make sure you're logged into Hoyolab

2. **"Authentication failed"**

   - Check your internet connection
   - Try logging into Hoyolab manually first
   - Clear browser cache and try again

3. **"API connection failed"**
   - Cookies may have expired
   - Run authentication again
   - Check if Hoyolab changed their API

### Debug Mode

To see detailed logs, modify `auth.js`:

```javascript
// Change this line in auth.js
headless: false, // Set to false to see browser
```

### Manual Cookie Extraction

If automated auth fails, you can manually extract cookies:

1. Login to https://www.hoyolab.com in your browser
2. Open Developer Tools (F12)
3. Go to Application/Storage → Cookies
4. Copy the required cookie values
5. Add them to your `.env` file

## 🔒 Security Notes

- **Never commit** your `.env` file to version control
- **Cookies expire** periodically - you may need to re-authenticate
- **Use headless mode** in production by setting `headless: true` in `auth.js`

## 📝 Environment Variables

Your `.env` file should contain:

```env
# Hoyolab Login Credentials (optional - for automated login)
HOYOLAB_EMAIL=your_email@example.com
HOYOLAB_PASSWORD=your_password_here

# Required cookies (auto-populated by auth script)
MI18NLANG=
_HYVUUID=
_MHYUUID=
COOKIE_TOKEN_V2=
ACCOUNT_MID_V2=
ACCOUNT_ID_V2=
LTOKEN_V2=
LTMID_V2=
LTUID_V2=
DEVICEFP=

# Your UID (manual)
UID=your_uid_here
```

## 🎯 Integration with Existing Code

The authentication system is now integrated into your existing `battleRecords.js`:

- **Automatic initialization** when the app starts
- **Transparent authentication** - no changes needed to your existing code
- **Error handling** for expired cookies
- **Seamless API usage** - just use the API as before

## 🔄 Updating Authentication

To refresh your authentication:

```bash
# Remove old cookies
rm .env

# Run fresh authentication
npm run auth
```

Or the system will automatically detect when cookies are expired and prompt for re-authentication.
