# GitHub Copilot Instructions for Zenless Zone Zero Battle Records

## 🏗️ Architecture Overview

This is a **Next.js 15 + TypeScript PWA** for tracking Zenless Zone Zero battle records. The project follows a strict client/server boundary pattern and includes automated data collection workflows.

### Core System Components

```
Hoyolab API ← auth.js (Puppeteer) ← Node.js Scripts ← Next.js App
     ↓              ↓                    ↓              ↓
  Cookies      Auto-refresh        Battle Data    User Interface
```

**Data Flow**: `zzzApi.js` → `battleRecords.js` → JSON files → `DataService` → React components

## 🚨 Critical Client/Server Rules

**NEVER mix these:**

- ❌ Client components (`"use client"`) + Node.js modules (`fs`, `path`, `crypto`)
- ❌ Server components + React hooks (`useState`, `useEffect`)
- ❌ Import `agent-utils.ts` (server-only) in client components

**Essential Patterns:**

- ✅ Server components for file operations (`DataService`, `getAgentInfo`)
- ✅ Client components for interactivity (filters, tabs, state)
- ✅ Pass data server → client via props only

### ⚠️ File Editing Safety

**CRITICAL: Always check for duplicate content when editing files**

- ❌ Never duplicate imports, functions, or entire sections
- ❌ Don't add the same component/logic twice in one file
- ✅ Read the full file context before making edits
- ✅ Verify edits don't create redundant code blocks
- ✅ Use precise string replacement to avoid duplication

### File Organization Strategy

```
src/lib/
├── agent-utils.ts      # Server-only (fs operations)
├── data-service.ts     # Server-only (file I/O)
├── grade-utils.ts      # Client-safe (pure functions)
└── date-utils.ts       # Client-safe utilities

src/components/ui/      # shadcn/ui components (Card, Button, Tabs, etc.)
src/components/shared/  # Reusable business components
src/components/[feature]/ # Feature-specific components

Root Level:
├── battleRecords.js    # Node.js data fetcher
├── auth.js            # Puppeteer authentication
├── automatedFetch.js  # Scheduled data collection
└── zzzApi.js          # Hoyolab API wrapper
```

### UI Component System

- **shadcn/ui**: Primary UI library (New York style, Tailwind CSS)
- **Config**: `components.json` defines aliases and styling
- **Icons**: Lucide React icon library
- **Components**: `@/components/ui/*` for base UI, custom components in feature folders

## 🎮 ZZZ-Specific Domain Knowledge

### Battle Record Types

- **Shiyu Defense**: Floor-based progression (14-day cycles, reset Thursdays)
- **Deadly Assault**: Score-based challenges (14-day cycles, offset +7 days)

### Character System

- **Element Types**: `ELEMENT_TYPES[200-205]` → Physical, Fire, Ice, Electric, Ether
- **Rarity**: 3-star = A rank, 4-star = S rank
- **Agent Data**: `/public/characters/{id}.json` files contain stats

### Data Patterns

```typescript
// Always use DataService for file operations (server-side)
const dataService = new DataService();
const records = await dataService.getAllData("shiyu-defense");

// Client-safe utilities for UI
import { mapStarRatingToGrade } from "@/lib/grade-utils";
const grade = mapStarRatingToGrade(agent.rarity);
```

## ⚙️ Development Workflows

### Data Collection Commands

```bash
# Authentication (run when cookies expire)
npm run auth

# Manual data fetch
node battleRecords.js export-all

# Development build (includes data copy)
npm run dev  # Runs predev script automatically
```

### Pre-build Process

1. `copy-data-to-public.js` - Copies JSON data to `/public/`
2. `generateManifest.js` - Updates PWA manifest
3. Next.js build with client/server optimization

### PWA Architecture

- **Manifest**: Auto-generated from `scripts/generateManifest.js`
- **Offline**: Service worker handles cached data
- **Icons**: Auto-generated PNGs in `/public/icons/`

## 🔧 Authentication System

**Critical**: Uses browser cookies, not API keys

- `auth.js` launches Puppeteer → extracts Hoyolab cookies
- `authHelper.js` manages cookie refresh cycles
- `zzzApi.js` builds Cookie headers from environment variables

```javascript
// Environment pattern (.env file)
UID = your_game_uid;
LTUID_V2 = cookie_value;
LTOKEN_V2 = cookie_value;
// ... 8 more cookie values
```

## 🚀 Deployment & Automation

### GitHub Actions Integration

- `automated-fetch.yml` - Scheduled data collection
- `publish-page.yml` - GitHub Pages deployment
- `fetch-characters.yml` - Character data updates

### Data File Naming Convention

```
shiyu-defense-2025-07-18-2025-08-01.json
deadly-assault-2025-08-08-2025-08-22.json
```

Format: `{type}-{start-date}-{end-date}.json`

## 🎯 Quick Development Checklist

**Before making changes:**

1. **Component type**: Hooks needed? → `"use client"`
2. **File operations**: Server component + `DataService`
3. **Data flow**: Server fetches → passes props → client renders
4. **Build test**: `npm run build` must succeed

**Common Fixes:**

- Module not found (fs) → Move to server component or use client-safe alternative
- Hook error → Add `"use client"` directive
- Data not loading → Check `predev` script ran and files copied to `/public/`

## 📚 Key References

- Architecture: `docs/CLIENT-SERVER-ARCHITECTURE.md`
- Battle data types: `src/types/deadly-assault.ts`, `src/types/shiyu-defense.ts`
- Agent utilities: `src/lib/agent-utils.ts` (server), `src/lib/grade-utils.ts` (client)
