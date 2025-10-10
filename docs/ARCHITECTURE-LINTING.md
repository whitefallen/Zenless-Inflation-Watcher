# ESLint Rules for Next.js Client/Server Architecture

These rules help prevent client/server boundary violations automatically.

## Installation

```bash
npm install --save-dev @typescript-eslint/eslint-plugin
```

## Configuration

Add to your `eslint.config.mjs`:

```javascript
export default [
  // ... existing config
  {
    files: ['**/*.tsx', '**/*.ts'],
    rules: {
      // Prevent Node.js imports in files with "use client"
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['fs', 'path', 'crypto', 'os', 'util', 'stream'],
              message: 'Node.js modules cannot be imported in client components. Remove "use client" or use server components.',
            },
          ],
        },
      ],
      
      // Warn about React hooks in files without "use client"
      '@typescript-eslint/no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: ['react'],
              importNames: ['useState', 'useEffect', 'useMemo', 'useCallback'],
              message: 'React hooks require "use client" directive.',
            },
          ],
        },
      ],
    },
  },
  
  // Specific rules for client components
  {
    files: ['**/*.tsx'],
    rules: {
      // If file contains "use client", restrict Node.js imports
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program:has(ExpressionStatement > Literal[value="use client"]) ImportDeclaration[source.value=/^(fs|path|crypto|os|util|stream)$/]',
          message: 'Cannot import Node.js modules in client components.',
        },
      ],
    },
  },
];
```

## VS Code Integration

Add to `.vscode/settings.json`:

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": ["."]
}
```

## Git Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run architecture checklist
echo "🏗️ Checking Next.js Architecture..."

# Check for client/server violations
npx eslint --ext .ts,.tsx src/ --quiet

if [ $? -eq 0 ]; then
  echo "✅ Architecture check passed!"
else
  echo "❌ Architecture violations found. Check docs/ARCHITECTURE-CHECKLIST.md"
  exit 1
fi
```

## Manual Checks

Before each commit, run:

```bash
# Architecture lint check
npm run lint

# Type check
npx tsc --noEmit

# Manual checklist
cat docs/ARCHITECTURE-CHECKLIST.md
```
