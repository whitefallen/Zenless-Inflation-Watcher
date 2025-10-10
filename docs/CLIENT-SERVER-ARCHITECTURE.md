# Next.js Client/Server Architecture Guidelines

## 🚨 Critical Rules to Avoid Client/Server Boundary Issues

### **Server-Side Only Modules (Node.js)**
These modules **CANNOT** be imported in client components:
- `fs` (file system)
- `path` (when used with `fs`)
- `crypto` (Node.js crypto module)
- Any Node.js built-in modules

### **Client-Side Only Features**
These features **ONLY** work in client components (`"use client"`):
- React Hooks: `useState`, `useEffect`, `useMemo`, `useCallback`, etc.
- Browser APIs: `window`, `document`, `localStorage`, etc.
- Event handlers for user interactions
- Real-time updates and dynamic state

## 📁 **File Structure Strategy**

### **Server Components (Default)**
- Pages (`src/app/*/page.tsx`) - Server by default
- Layout components - Server by default
- Data fetching utilities (`src/lib/*-utils.ts`)
- Components that only display data

### **Client Components (`"use client"`)**
- Interactive components with state
- Components using React hooks
- Form components with validation
- Real-time UI updates
- PWA components

## 🔧 **Separation Patterns**

### **1. Utility Function Separation**
```typescript
// ❌ BAD: Mixed server/client utilities
// src/lib/agent-utils.ts
import fs from 'fs'; // Server-only
export function useState() {} // Client-only

// ✅ GOOD: Separate utilities
// src/lib/agent-utils.ts (Server-side)
import fs from 'fs';
export function getAgentInfo() { /* fs operations */ }

// src/lib/grade-utils.ts (Client-safe)
export function getAgentGrade() { /* pure functions */ }
```

### **2. Component Architecture**
```typescript
// ❌ BAD: Server component trying to use hooks
export function ServerTable({ data }) {
  const [filter, setFilter] = useState([]); // ERROR!
  return <table>...</table>
}

// ✅ GOOD: Server component passes data to client
// ServerTable.tsx (Server component)
export function ServerTable({ data }) {
  return <ClientTable data={data} />
}

// ClientTable.tsx (Client component)
"use client";
export function ClientTable({ data }) {
  const [filter, setFilter] = useState([]);
  return <table>...</table>
}
```

### **3. Data Flow Pattern**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Server Page   │───▶│  Server Utils    │    │  Client Utils   │
│   (page.tsx)    │    │  (fs, database)  │    │  (pure logic)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               ▲
         ▼                                               │
┌─────────────────┐                               ┌─────────────────┐
│ Client Component│                               │   Shared Types  │
│ ("use client")  │◄──────────────────────────────│   (types/*.ts)  │
└─────────────────┘                               └─────────────────┘
```

## 🎯 **Best Practices**

### **Do:**
- ✅ Keep data fetching in server components
- ✅ Pass data down as props to client components
- ✅ Use server utilities for file system operations
- ✅ Use client utilities for UI state management
- ✅ Import client-safe utilities in client components
- ✅ Import server utilities only in server components

### **Don't:**
- ❌ Import `fs`, `path`, or Node.js modules in client components
- ❌ Use React hooks in server components
- ❌ Mix server and client logic in the same file
- ❌ Try to access browser APIs in server components
- ❌ Use server utilities in client components

## 🔍 **Common Error Patterns & Solutions**

### **Error: "Module not found: Can't resolve 'fs'"**
```typescript
// ❌ Problem: Client component importing server module
"use client";
import { getAgentInfo } from '@/lib/agent-utils'; // Uses fs

// ✅ Solution: Use client-safe utilities
"use client";
import { getAgentGrade } from '@/lib/grade-utils'; // Pure functions
```

### **Error: "You're importing a component that needs useState"**
```typescript
// ❌ Problem: Server component importing client component
// page.tsx (Server component)
import { ClientTable } from './ClientTable'; // Uses useState

// ✅ Solution: Make sure client components are marked
// ClientTable.tsx
"use client";
import { useState } from 'react';
```

### **Error: "window is not defined"**
```typescript
// ❌ Problem: Server component accessing browser APIs
export function ServerComponent() {
  const width = window.innerWidth; // ERROR!
}

// ✅ Solution: Move to client component or use conditional access
"use client";
export function ClientComponent() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);
}
```

## 📋 **Migration Checklist**

When adding new functionality:

1. **Identify Component Type**
   - [ ] Does it need React hooks? → Client component
   - [ ] Does it need file system access? → Server component
   - [ ] Does it only display data? → Server component (default)

2. **Check Dependencies**
   - [ ] No `fs`, `path`, Node.js modules in client components
   - [ ] No React hooks in server components
   - [ ] Utilities are in appropriate files

3. **Test Boundaries**
   - [ ] Server components can import server utilities
   - [ ] Client components can import client-safe utilities
   - [ ] Data flows from server → client via props

4. **Verify Build**
   - [ ] `npm run build` succeeds
   - [ ] No "Module not found" errors
   - [ ] No "use client" directive errors

## 🚀 **Quick Reference**

| Feature | Server Component | Client Component |
|---------|------------------|------------------|
| React Hooks | ❌ | ✅ |
| File System (`fs`) | ✅ | ❌ |
| Database Access | ✅ | ❌ |
| Browser APIs | ❌ | ✅ |
| User Interactions | ❌ | ✅ |
| Data Fetching | ✅ | ✅ (via API) |
| Pure Functions | ✅ | ✅ |

## 💡 **Example: Grade System Implementation**

```typescript
// ✅ Server-side data loading
// src/app/shiyu-defense/page.tsx
export default async function Page() {
  const data = await getAllShiyuDefenseData(); // fs operations
  return <CharacterTable data={data} />;
}

// ✅ Server component with server utilities
// src/components/CharacterTable.tsx
import { getAgentInfo } from '@/lib/agent-utils'; // fs operations
export function CharacterTable({ data }) {
  return data.map(item => {
    const agent = getAgentInfo(item.id); // Server-side
    return <AgentDisplay agent={agent} />;
  });
}

// ✅ Client-safe display components
// src/components/AgentDisplay.tsx
import { GradeBadge } from '@/components/ui/grade-badge';
export function AgentDisplay({ agent }) {
  return (
    <div>
      {agent.name}
      <GradeBadge stars={agent.rarity} />
    </div>
  );
}

// ✅ Client-safe utilities
// src/utils/ratingMapper.ts
export function mapStarRatingToGrade(stars: number): string {
  // Pure function - no fs, no hooks
  return stars === 4 ? 'S' : 'A';
}
```

---

**Remember**: When in doubt, start with server components and only add `"use client"` when you specifically need React hooks or browser APIs!
