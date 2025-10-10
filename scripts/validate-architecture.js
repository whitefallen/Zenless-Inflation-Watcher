#!/usr/bin/env node

/**
 * Architecture Validation Script
 * 
 * Automatically checks for Next.js client/server boundary violations
 * Run before any component changes to catch issues early
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ERRORS = [];
const WARNINGS = [];

// Colors for console output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const isClientComponent = content.includes('"use client"') || content.includes("'use client'");
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Check for Node.js imports in client components
    if (isClientComponent) {
      const nodeModules = ['fs', 'path', 'crypto', 'os', 'util', 'stream'];
      nodeModules.forEach(module => {
        if (line.includes(`import`) && line.includes(`'${module}'`) || line.includes(`"${module}"`)) {
          ERRORS.push({
            file: filePath,
            line: lineNumber,
            message: `Client component cannot import Node.js module '${module}'`,
            suggestion: `Move to server component or use client-safe alternative`
          });
        }
      });
    }
    
    // Check for React hooks in server components
    if (!isClientComponent) {
      const reactHooks = ['useState', 'useEffect', 'useMemo', 'useCallback', 'useReducer'];
      reactHooks.forEach(hook => {
        if (line.includes(hook) && (line.includes('import') || line.includes('='))) {
          WARNINGS.push({
            file: filePath,
            line: lineNumber,
            message: `React hook '${hook}' used without "use client" directive`,
            suggestion: `Add "use client" at the top of the file`
          });
        }
      });
    }
    
    // Check for browser APIs in server components
    if (!isClientComponent) {
      const browserAPIs = ['window', 'document', 'localStorage', 'sessionStorage'];
      browserAPIs.forEach(api => {
        if (line.includes(api) && !line.includes('//') && !line.includes('typeof')) {
          WARNINGS.push({
            file: filePath,
            line: lineNumber,
            message: `Browser API '${api}' used in server component`,
            suggestion: `Move to client component or add conditional check`
          });
        }
      });
    }
  });
}

function validateArchitecture() {
  log('\n🏗️  Next.js Architecture Validation\n', 'bold');
  
  // Find all TypeScript/React files
  const files = glob.sync('src/**/*.{ts,tsx}', { cwd: process.cwd() });
  
  log(`📁 Checking ${files.length} files...\n`, 'blue');
  
  files.forEach(checkFile);
  
  // Report results
  if (ERRORS.length > 0) {
    log('❌ ERRORS FOUND:', 'red');
    ERRORS.forEach(error => {
      log(`   ${error.file}:${error.line}`, 'red');
      log(`   ${error.message}`, 'red');
      log(`   💡 ${error.suggestion}\n`, 'yellow');
    });
  }
  
  if (WARNINGS.length > 0) {
    log('⚠️  WARNINGS:', 'yellow');
    WARNINGS.forEach(warning => {
      log(`   ${warning.file}:${warning.line}`, 'yellow');
      log(`   ${warning.message}`, 'yellow');
      log(`   💡 ${warning.suggestion}\n`, 'blue');
    });
  }
  
  if (ERRORS.length === 0 && WARNINGS.length === 0) {
    log('✅ All architecture checks passed!', 'green');
    log('📖 Architecture guidelines: docs/CLIENT-SERVER-ARCHITECTURE.md', 'blue');
  } else {
    log('\n📚 For detailed guidelines, see:', 'blue');
    log('   • docs/CLIENT-SERVER-ARCHITECTURE.md', 'blue');
    log('   • docs/ARCHITECTURE-CHECKLIST.md', 'blue');
  }
  
  // Exit with error code if there are errors
  if (ERRORS.length > 0) {
    process.exit(1);
  }
}

// Run validation
validateArchitecture();
