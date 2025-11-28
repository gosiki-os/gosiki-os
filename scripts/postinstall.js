#!/usr/bin/env node
import { homedir } from 'os';
import { join } from 'path';

const home = homedir();
const username = home.split(/[/\\]/).pop();
const registryPath = join(home, '.gosiki-os', 'port-registry.json').replace(username, '<username>');

console.log('✅ @gosiki-os/port-manager installed successfully');
console.log(`📁 Registry location: ${registryPath}`);
console.log('');
console.log('Quick start:');
console.log('  npx @gosiki-os/port-manager              # Acquire a port');
console.log('  npx @gosiki-os/port-manager --list       # List allocated ports');
console.log('  npx @gosiki-os/port-manager --help       # Show help');
