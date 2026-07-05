#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Read url and token from local .env file (not hardcoded)
const dotenvPath = path.join(__dirname, '.env');
let url = '';
let token = '';

if (fs.existsSync(dotenvPath)) {
  const content = fs.readFileSync(dotenvPath, 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2] || '';
      if (val.length > 0 && val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') {
        val = val.substring(1, val.length - 1);
      } else if (val.length > 0 && val.charAt(0) === "'" && val.charAt(val.length - 1) === "'") {
        val = val.substring(1, val.length - 1);
      }
      if (key === 'EMDASH_URL') url = val.trim();
      if (key === 'EMDASH_TOKEN') token = val.trim();
    }
  }
}

const args = process.argv.slice(2);

// Append -u and -t if they are not already provided
if (url && !args.includes('-u') && !args.includes('--url')) {
  args.push('-u', url);
}
if (token && !args.includes('-t') && !args.includes('--token')) {
  args.push('-t', token);
}

// Locate local emdash JS script path to execute directly via node
const emdashPath = path.join(__dirname, 'node_modules', 'emdash', 'dist', 'cli', 'index.mjs');

const child = spawn(process.execPath, [emdashPath, ...args], {
  stdio: 'inherit',
  shell: false
});

child.on('close', (code) => {
  process.exit(code || 0);
});
