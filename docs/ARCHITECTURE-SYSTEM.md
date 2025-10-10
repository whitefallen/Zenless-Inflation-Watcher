# 🏗️ Architecture Documentation System

## Overview

This system ensures Next.js client/server architecture guidelines are always followed and easily accessible.

## 📚 Documentation Files

### 1. **CLIENT-SERVER-ARCHITECTURE.md**
- Comprehensive guide with rules, patterns, and examples
- Reference for all architectural decisions
- Updated based on real project experience

### 2. **ARCHITECTURE-CHECKLIST.md**  
- Quick pre-development checklist
- Step-by-step validation process
- Common mistake prevention

### 3. **ARCHITECTURE-LINTING.md**
- ESLint configuration for automated checking
- VS Code integration settings
- Git hook setup

## 🔧 Automated Tools

### Package.json Scripts

```bash
# Quick architecture validation
npm run check-architecture

# Show documentation links
npm run docs

# Standard linting (includes architecture rules)
npm run lint
```

### Manual Validation Script

`scripts/validate-architecture.js` - Scans for:
- Node.js imports in client components
- React hooks in server components  
- Browser APIs in server components

## 🚨 Integration Points

### Before Every Development Session

1. **Read Checklist**: `docs/ARCHITECTURE-CHECKLIST.md`
2. **Run Validation**: `npm run check-architecture`
3. **Refer to Docs**: `docs/CLIENT-SERVER-ARCHITECTURE.md`

### When Creating Components

1. **Identify Type** (Server vs Client)
2. **Check Import Safety** 
3. **Validate Data Flow**
4. **Test Build**: `npm run build`

### When Debugging Errors

1. **Check Error Patterns** in `CLIENT-SERVER-ARCHITECTURE.md`
2. **Run Architecture Validation**: `npm run check-architecture`
3. **Follow Solution Examples**

## 🎯 Quick Access Commands

```bash
# Show architecture docs
npm run docs

# Validate current code
npm run check-architecture

# Type check everything
npx tsc --noEmit

# Full project check
npm run lint && npm run check-architecture
```

## 📋 Integration Checklist

- [x] Documentation files created
- [x] Validation script added
- [x] Package.json scripts configured
- [x] Quick reference commands available
- [ ] ESLint rules configured (optional)
- [ ] Git hooks configured (optional)
- [ ] VS Code settings configured (optional)

## 🔄 Maintenance

- Update documentation when patterns change
- Add new error patterns to validation script
- Keep examples current with project structure
- Review and refine based on team feedback

---

**💡 The goal**: Make architecture guidelines so accessible and automated that following them becomes natural and effortless!
