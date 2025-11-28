#!/usr/bin/env node
import { homedir } from 'os';
import { join } from 'path';

/**
 * Get display path with optional username masking for demo mode
 * @param {string} path - Full file path
 * @returns {string} Path with username replaced by <username> in demo mode
 */
function getDisplayPath(path) {
  // Only mask username in demo mode
  if (process.env.GOSIKI_DEMO_MODE === 'true') {
    const home = homedir();
    const username = home.split(/[/\\]/).pop();
    return path.replace(username, '<username>');
  }
  return path;
}

const registryPath = join(homedir(), '.gosiki-os', 'port-registry.json');

console.log('✅ @gosiki-os/port-manager installed successfully');
console.log(`📁 Registry location: ${getDisplayPath(registryPath)}`);
console.log('');
console.log('Quick start:');
console.log('  npx @gosiki-os/port-manager              # Acquire a port');
console.log('  npx @gosiki-os/port-manager --list       # List allocated ports');
console.log('  npx @gosiki-os/port-manager --help       # Show help');
