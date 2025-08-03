# Discord Webhook Setup Guide

This guide explains how to set up Discord webhooks to receive notifications about your automated ZZZ data fetching.

## 🎯 What You'll Get Notified About

- ✅ **Successful data fetches** - When new battle data is retrieved
- ❌ **Authentication failures** - When login fails
- ⚠️ **API errors** - When API requests fail
- 🚀 **Workflow starts** - When automated fetch begins
- ⏳ **Rate limiting** - When too many requests are made
- 📅 **Schedule-aware** - Only fetches when game modes reset (every 14 days)

## 📋 Setup Steps

### 1. Create a Discord Webhook

1. **Open Discord** and go to your server
2. **Right-click on a channel** where you want notifications
3. **Select "Edit Channel"**
4. **Go to "Integrations" tab**
5. **Click "Create Webhook"**
6. **Give it a name** (e.g., "ZZZ Battle Bot")
7. **Copy the Webhook URL** (looks like: `https://discord.com/api/webhooks/123456789/abcdef...`)

### 2. Configure Your Environment

#### Option A: Local Development

Add to your `.env` file:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

#### Option B: GitHub Actions

1. **Go to your GitHub repository**
2. **Settings → Secrets and variables → Actions**
3. **Add the following secrets:**
   - `DISCORD_WEBHOOK_URL` = Your webhook URL
   - `UID` = Your ZZZ UID
   - `HOYOLAB_EMAIL` = Your Hoyolab email
   - `HOYOLAB_PASSWORD` = Your Hoyolab password
   - `COOKIE_TOKEN_V2` = Your cookie token (optional)
   - `LTOKEN_V2` = Your ltoken (optional)
   - `LTUID_V2` = Your ltuid (optional)
   - `ACCOUNT_ID_V2` = Your account ID (optional)
   - `ACCOUNT_MID_V2` = Your account MID (optional)
   - `LTMID_V2` = Your ltmID (optional)
   - `_HYVUUID` = Your HYVUUID (optional)
   - `_MHYUUID` = Your MHYUUID (optional)
   - `DEVICEFP` = Your device fingerprint (optional)
   - `MI18NLANG` = Your language (optional)

### 3. Test the Setup

#### Local Testing

```bash
# Test with current data
npm run fetch

# Or run manually
node automatedFetch.js
```

#### GitHub Actions Testing

1. **Go to your repository**
2. **Actions tab**
3. **Select "Automated ZZZ Data Fetch"**
4. **Click "Run workflow"**
5. **Choose branch and click "Run workflow"**

## 🔔 Notification Examples

### ✅ Success Notification

```
🎉 ZZZ Battle Data Updated
Successfully fetched battle data for UID: 1500598195

Deadly Assault: ✅ 3 records
Shiyu Defense: ✅ 2 records
Player: Whitefallen
```

### ❌ Authentication Failure

```
❌ ZZZ Authentication Failed
Failed to authenticate for UID: 1500598195

Error: Authentication check failed
Action Required: Check credentials and re-authenticate manually
```

### ⚠️ API Error

```
⚠️ ZZZ API Error
API request failed for UID: 1500598195

Endpoint: /mem_detail
Error: Please log in to take part in the event（-100）
Action Required: Check if cookies are still valid
```

### ⏳ Rate Limiting

```
⏳ ZZZ Rate Limited
Rate limited while fetching data for UID: 1500598195

Action: Will retry later
Next Attempt: In 30 minutes
```

## 🛠️ Customization

### Modify Notification Content

Edit `discordNotifier.js` to customize:

- Message colors
- Notification content
- Embed fields
- Username/bot name

### Add New Notification Types

```javascript
// In discordNotifier.js
async notifyCustomEvent(data) {
  const embed = {
    color: 0x00ff00,
    title: "Custom Event",
    description: "Your custom message",
    // ... more fields
  };

  await this.sendEmbed(embed);
}
```

### Change Schedule

Edit `.github/workflows/automated-fetch.yml`:

```yaml
schedule:
  # Daily at 8 PM UTC (current - smart scheduling)
  - cron: "0 20 * * *"

  # Every Thursday at 8 PM UTC
  - cron: "0 20 * * 4"

  # Twice daily (morning and evening)
  - cron: "0 8,20 * * *"

  # Every 6 hours
  - cron: "0 */6 * * *"
```

**Note**: The system now uses smart scheduling that only fetches data when game modes reset (every 14 days), so running daily is safe and efficient.

## 🔒 Security Notes

- **Never share your webhook URL** publicly
- **Use GitHub Secrets** for sensitive data
- **Rotate webhook URLs** if compromised
- **Monitor webhook usage** in Discord server settings

## 🐛 Troubleshooting

### No Notifications Received

1. **Check webhook URL** is correct
2. **Verify bot permissions** in Discord
3. **Check GitHub Actions logs** for errors
4. **Test webhook manually** with curl:
   ```bash
   curl -H "Content-Type: application/json" \
        -X POST \
        -d '{"content":"Test message"}' \
        YOUR_WEBHOOK_URL
   ```

### GitHub Actions Failing

1. **Check all secrets** are set correctly
2. **Verify workflow file** syntax
3. **Check Node.js version** compatibility
4. **Review action logs** for specific errors

### Rate Limiting Issues

- **Reduce frequency** of automated runs
- **Add delays** between requests
- **Use existing cookies** when possible
- **Monitor Hoyolab rate limits**

## 📊 Data Storage

The automated system saves data to:

- `data/deadly-assault_UID_DATE.json` - Daily Deadly Assault data
- `data/shiyu-defense_UID_DATE.json` - Daily Shiyu Defense data
- `data/combined_UID_TIMESTAMP.json` - Combined data with timestamp
- `data/*_latest.json` - Latest data files

All data is also uploaded as GitHub Actions artifacts for 30 days.
