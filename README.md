# ZZZ Battle Records

A Node.js application to fetch and display battle records from Zenless Zone Zero (ZZZ) using the Hoyolab API.

## Setup

1. Copy `.env_example` to `.env`:

   ```bash
   cp .env_example .env
   ```

2. Get your cookies from the browser:

   - Open your browser and go to https://act.hoyolab.com/
   - Open Developer Tools (F12)
   - Go to the Network tab
   - Navigate to the ZZZ event page
   - Find any request to `sg-public-api.hoyolab.com`
   - Copy the Cookie header value
   - Parse the cookies and add them to your `.env` file

3. Update your `.env` file with the cookie values:
   ```
   MI18NLANG=de-de
   _HYVUUID=your_hypvuuid_value
   _MHYUUID=your_mhyuuid_value
   COOKIE_TOKEN_V2=your_cookie_token_v2_value
   ACCOUNT_MID_V2=your_account_mid_v2_value
   ACCOUNT_ID_V2=your_account_id_v2_value
   LTOKEN_V2=your_ltoken_v2_value
   LTMID_V2=your_ltmid_v2_value
   LTUID_V2=your_ltuid_v2_value
   DEVICEFP=your_devicefp_value
   UID=your_game_uid
   ```

## Usage

### Interactive Mode

```bash
node battleRecords.js
```

### Command Line Mode

```bash
# Export Deadly Assault as JSON
node battleRecords.js export-deadly

# Export Shiyu Defense as JSON
node battleRecords.js export-shiyu

# Export both as JSON
node battleRecords.js export-all

# Show summaries in console
node battleRecords.js deadly-summary
node battleRecords.js shiyu-summary

# Generate reports
node battleRecords.js html
node battleRecords.js text
```

### Automated Execution

For GitHub Actions or crontab, use the command-line mode:

```bash
# Example crontab entry (runs every Sunday at 2 AM)
0 2 * * 0 cd /path/to/your/project && node battleRecords.js export-all

# Example GitHub Actions workflow
- name: Export Battle Records
  run: node battleRecords.js export-all
```

The JSON files will be saved in:

- `deadlyAssault/month_week.json` (e.g., `deadlyAssault/7_week3.json`)
- `shiyu/month_week.json` (e.g., `shiyu/7_week3.json`)

## API Changes

The API has been updated to match the browser request format exactly:

- Removed DS (mihoyo_bbs) authentication
- Added all necessary cookies from browser request
- Updated headers to match browser request
- Simplified authentication process

## Troubleshooting

If you get authentication errors:

1. Make sure all cookies are properly set in your `.env` file
2. Verify that your cookies are not expired
3. Try refreshing your browser session and getting new cookies
4. Check that your UID is correct

## Files

- `zzzApi.js` - API wrapper for ZZZ Hoyolab API
- `battleRecords.js` - Main application for fetching and displaying battle records
- `templates/` - Handlebars templates for HTML generation
- `deadlyAssault/` - Directory for exported Deadly Assault JSON files
- `shiyu/` - Directory for exported Shiyu Defense JSON files
