#!/usr/bin/env node
/**
 * GosikiOS Demo CLI Entry Point
 *
 * Usage:
 *   gosiki-demo
 *   npm run demo
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const demoPath = join(__dirname, '../examples/demo-cli/index.mjs');

const child = spawn('node', [demoPath], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
