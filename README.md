# ZZZ Battle Records

A Next.js 15 Progressive Web App (PWA) for tracking Zenless Zone Zero battle records with automated data collection from Hoyolab API.

## 🚀 Performance Metrics

_Performance metrics are automatically collected across all main application pages (landing page, Deadly Assault, and Shiyu Defense) via Lighthouse CI on every deployment._

> **Note**: Lighthouse reports are available in GitHub Actions artifacts. Click the "Latest Reports" badge to view the most recent workflow run, then download the "lighthouse-reports" artifact to access detailed performance reports.

### Lighthouse Scores

#### Landing Page

[![Latest Reports](https://img.shields.io/badge/reports-view%20latest-blue?style=flat-square&logo=github)](https://github.com/whitefallen/Zenless-Inflation-Watcher/actions/workflows/publish-page.yml)

#### Deadly Assault

[![PWA](https://img.shields.io/badge/pwa-check%20report-blueviolet?style=flat-square&logo=pwa)](https://pagespeed.web.dev/analysis?url=https://whitefallen.github.io/Zenless-Inflation-Watcher/deadly-assault)

#### Shiyu Defense

[![PWA](https://img.shields.io/badge/pwa-check%20report-blueviolet?style=flat-square&logo=pwa)](https://pagespeed.web.dev/analysis?url=https://whitefallen.github.io/Zenless-Inflation-Watcher/shiyu-defense)

### Bundle Size

[![Package Size](https://img.shields.io/github/repo-size/whitefallen/Zenless-Inflation-Watcher?style=flat-square)](https://github.com/whitefallen/Zenless-Inflation-Watcher)
[![Last Commit](https://img.shields.io/github/last-commit/whitefallen/Zenless-Inflation-Watcher?style=flat-square)](https://github.com/whitefallen/Zenless-Inflation-Watcher/commits)

### Build Status

[![Build and Deploy](https://github.com/whitefallen/Zenless-Inflation-Watcher/actions/workflows/publish-page.yml/badge.svg)](https://github.com/whitefallen/Zenless-Inflation-Watcher/actions/workflows/publish-page.yml)
[![Data Fetch](https://github.com/whitefallen/Zenless-Inflation-Watcher/actions/workflows/automated-fetch.yml/badge.svg)](https://github.com/whitefallen/Zenless-Inflation-Watcher/actions/workflows/automated-fetch.yml)

## 📱 Web Application

This is a modern PWA built with Next.js 15, featuring:

- **Real-time battle record tracking** for Shiyu Defense and Deadly Assault
- **Character performance analytics** with detailed statistics
- **Offline functionality** with service worker caching
- **Responsive design** optimized for mobile and desktop
- **Automated data collection** via GitHub Actions

🌐 **Live Demo**: [https://whitefallen.github.io/Zenless-Inflation-Watcher/](https://whitefallen.github.io/Zenless-Inflation-Watcher/)

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/whitefallen/Zenless-Inflation-Watcher.git
   cd Zenless-Inflation-Watcher
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables for data collection:

   ```bash
   cp .env_example .env
   ```

4. Configure Hoyolab authentication (see Data Collection section below)

5. Start development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm run start
```

## 📊 Data Collection Setup

The application includes automated scripts to fetch battle records from Hoyolab API.

### Authentication Setup

1. Get your cookies from the browser:

   - Open your browser and go to https://act.hoyolab.com/
   - Open Developer Tools (F12)
   - Go to the Network tab
   - Navigate to the ZZZ event page
   - Find any request to `sg-public-api.hoyolab.com`
   - Copy the Cookie header value
   - Parse the cookies and add them to your `.env` file

2. Update your `.env` file with the cookie values:
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

### Automated Data Collection

The project includes GitHub Actions workflows for automated data collection:

- **Daily Battle Records**: `automated-fetch.yml` - Fetches new battle data daily
- **Character Updates**: `fetch-characters.yml` - Updates character information
- **PWA Deployment**: `publish-page.yml` - Builds and deploys the web app

### Manual Data Collection Scripts

For manual data fetching or testing:

```bash
# Authenticate with Hoyolab (run when cookies expire)
npm run auth

# Export battle records
node battleRecords.js export-all

# Export specific record types
node battleRecords.js export-deadly
node battleRecords.js export-shiyu

# Generate reports
node battleRecords.js html
node battleRecords.js text
```

### Data Storage

Battle records are stored as JSON files in:

- `deadlyAssault/` - Deadly Assault records
- `shiyu/` - Shiyu Defense records
- `public/` - Web app accessible data (copied during build)

## ⚡ Performance & PWA Features

### Performance Monitoring

- **Lighthouse CI**: Automated performance testing across all main pages (landing, Deadly Assault, Shiyu Defense)
- **Core Web Vitals**: Monitored for optimal user experience on every page
- **PWA Audit**: Ensures installability and offline functionality
- **Build Size Tracking**: Repository size monitoring

### PWA Features

- **Offline Support**: Service worker caches critical resources
- **Installable**: Add to home screen on mobile devices
- **Fast Loading**: Optimized bundles with code splitting
- **Responsive**: Works seamlessly across all devices

### Build Optimization

- **Next.js 15**: Latest framework with App Router
- **Tailwind CSS**: Utility-first styling with purging
- **Service Worker**: Automatic caching and offline functionality
- **Responsive Images**: Optimized character and UI assets

## 🔧 API Integration

## 🔧 API Integration

The application integrates with Hoyolab's ZZZ API using browser-based authentication:

- **Cookie-based Auth**: Matches browser request format exactly
- **Puppeteer Automation**: Automated cookie refresh and authentication
- **Error Handling**: Robust retry logic and authentication refresh
- **Rate Limiting**: Respectful API usage with delays

## 🐛 Troubleshooting

### Authentication Issues

If you get authentication errors:

1. Run `npm run auth` to refresh cookies
2. Verify all environment variables are set in `.env`
3. Check that your Hoyolab session hasn't expired
4. Ensure your game UID is correct

### Build Issues

- Run `npm run check-architecture` to validate project structure
- Use `npm run docs` to view architecture documentation
- Check that all data files are copied to `public/` during build

### Performance Issues

- Clear browser cache and service worker
- Check network tab for failed asset loads
- Verify PWA is properly installed

## 📁 Project Structure

### Core Application (`src/`)

- `app/` - Next.js 15 App Router pages and layouts
- `components/` - React components (UI and business logic)
- `lib/` - Utility functions and data services
- `types/` - TypeScript type definitions
- `utils/` - Helper functions

### Data Collection (`root level`)

- `zzzApi.js` - Hoyolab API wrapper
- `battleRecords.js` - Main data fetching application
- `auth.js` - Puppeteer authentication script
- `automatedFetch.js` - Scheduled data collection

### Build & Deployment (`scripts/`)

- `copy-data-to-public.js` - Data file synchronization
- `generateManifest.js` - PWA manifest generation
- `generateIconsPNG.js` - Icon generation from HTML templates

### Data Storage

- `deadlyAssault/` - Deadly Assault battle records (JSON)
- `shiyu/` - Shiyu Defense battle records (JSON)
- `public/` - Static assets and web-accessible data
