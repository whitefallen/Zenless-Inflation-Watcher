# 🏗️ Next.js Architecture Checklist

> **Auto-run this checklist before making any component changes!**

## 📋 Pre-Development Checklist

Before creating or modifying any component, ask:

### 1. **Component Type Identification**
- [ ] Does this component need React hooks (`useState`, `useEffect`, etc.)?
  - ✅ **Yes** → Must be a Client Component (`"use client"`)
  - ❌ **No** → Keep as Server Component (default)

- [ ] Does this component need to access file system or Node.js APIs?
  - ✅ **Yes** → Must be a Server Component (no `"use client"`)
  - ❌ **No** → Can be either type

- [ ] Does this component need browser APIs (`window`, `document`, etc.)?
  - ✅ **Yes** → Must be a Client Component (`"use client"`)
  - ❌ **No** → Can be either type

### 2. **Import Safety Check**
- [ ] Are you importing any of these in a client component? **🚨 FORBIDDEN:**
  - `fs`, `path`, `crypto`, `os`, `util`, `stream`
  - Any Node.js built-in modules
  - Server-only utilities that use file system

- [ ] Are you importing React hooks in a server component? **🚨 FORBIDDEN:**
  - `useState`, `useEffect`, `useMemo`, `useCallback`
  - Any custom hooks that use React hooks

### 3. **Utility Function Check**
- [ ] Server utilities (file system, database) → Only import in server components
- [ ] Client-safe utilities (pure functions) → Safe for both
- [ ] If mixing both → Split into separate files

### 4. **Data Flow Verification**
- [ ] Server components fetch data and pass via props ✅
- [ ] Client components receive data via props ✅
- [ ] No direct file system access in client components ✅

## 🔧 **Quick Architecture Decisions**

### Adding React State/Hooks?
```typescript
"use client"; // ← Add this directive
import { useState } from 'react';
```

### Adding File System Operations?
```typescript
// NO "use client" directive
import fs from 'fs';
// Keep as server component
```

### Need Both Hooks AND File System?
```typescript
// Split into two components:
// 1. Server component (data fetching)
// 2. Client component (state management)
```

## 🚨 **Common Mistake Prevention**

### ❌ **NEVER DO:**
```typescript
// BAD: Client component with fs
"use client";
import fs from 'fs'; // ERROR!

// BAD: Server component with hooks
import { useState } from 'react'; // ERROR in server component!

// BAD: Mixed utilities
// agent-utils.ts
import fs from 'fs';
export function getAgentGrade() { useState() } // ERROR!
```

### ✅ **ALWAYS DO:**
```typescript
// GOOD: Server component for data
// page.tsx
import { getAgentInfo } from '@/lib/agent-utils'; // fs operations
export default function Page() {
  const data = getAgentInfo();
  return <ClientTable data={data} />;
}

// GOOD: Client component for state
// ClientTable.tsx
"use client";
import { useState } from 'react';
import { getAgentGrade } from '@/lib/grade-utils'; // pure functions
```

---

**💡 Remember**: When in doubt, check `docs/CLIENT-SERVER-ARCHITECTURE.md` for detailed examples!
