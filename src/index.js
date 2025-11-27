#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Registry path
const REGISTRY_DIR = join(homedir(), '.gosiki-os');
const REGISTRY_FILE = join(REGISTRY_DIR, 'port-registry.json');

/**
 * Ensure registry directory exists
 */
function ensureRegistryDir() {
  if (!existsSync(REGISTRY_DIR)) {
    mkdirSync(REGISTRY_DIR, { recursive: true });
  }
}

/**
 * Load registry from file
 * @returns {Object} Registry data
 */
function loadRegistry() {
  ensureRegistryDir();
  if (!existsSync(REGISTRY_FILE)) {
    return { version: '1.0.0', allocations: {} };
  }
  try {
    return JSON.parse(readFileSync(REGISTRY_FILE, 'utf-8'));
  } catch {
    return { version: '1.0.0', allocations: {} };
  }
}

/**
 * Save registry to file
 * @param {Object} registry - Registry data
 */
function saveRegistry(registry) {
  ensureRegistryDir();
  writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), 'utf-8');
}

/**
 * Check if a port is free
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>}
 */
async function isPortFree(port) {
  try {
    const result = execSync(
      `powershell -Command "(Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue) -eq $null"`,
      { stdio: 'pipe' }
    );
    return result.toString().trim() === 'True';
  } catch {
    return false;
  }
}

/**
 * Acquire an available port (with registry tracking)
 * @param {number} preferred - Preferred port (default: 3000)
 * @param {number} range - Search range (default: 100)
 * @returns {Promise<number>}
 */
export async function acquirePort(preferred = 3000, range = 100) {
  const registry = loadRegistry();

  for (let port = preferred; port < preferred + range; port++) {
    if (await isPortFree(port)) {
      // Record allocation in registry
      registry.allocations[port] = {
        allocatedAt: new Date().toISOString(),
        pid: process.pid
      };
      saveRegistry(registry);

      console.log(`Port ${port} acquired`);
      return port;
    }
  }

  console.error(`No available ports in range ${preferred}-${preferred + range - 1}`);
  process.exit(1);
}

/**
 * Release a port from the registry
 * @param {number} port - Port number to release
 * @returns {Promise<boolean>}
 */
export async function releasePort(port) {
  const registry = loadRegistry();

  if (registry.allocations[port]) {
    delete registry.allocations[port];
    saveRegistry(registry);
    console.log(`Port ${port} released`);
    return true;
  }

  console.log(`Port ${port} was not allocated`);
  return false;
}

/**
 * List all port allocations
 * @returns {Promise<Array>}
 */
export async function listAllocations() {
  const registry = loadRegistry();

  return Object.entries(registry.allocations).map(([port, info]) => ({
    port: parseInt(port, 10),
    allocatedAt: info.allocatedAt,
    pid: info.pid
  }));
}

// CLI execution - Check if this file is being run directly
const scriptPath = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] && (
  scriptPath === process.argv[1] ||
  scriptPath.replace(/\\/g, '/') === process.argv[1].replace(/\\/g, '/')
);

if (isMainModule) {
  const command = process.argv[2];

  if (command === '--release' || command === '-r') {
    const port = parseInt(process.argv[3], 10);
    if (isNaN(port)) {
      console.error('Usage: npx @gosiki-os/port-manager --release <port>');
      process.exit(1);
    }
    await releasePort(port);

  } else if (command === '--list' || command === '-l') {
    const allocations = await listAllocations();
    if (allocations.length === 0) {
      console.log('No port allocations');
    } else {
      console.log('Port Allocations:');
      allocations.forEach(({ port, allocatedAt, pid }) => {
        console.log(`  ${port} - allocated at ${allocatedAt} (PID: ${pid})`);
      });
    }

  } else if (command === '--help' || command === '-h') {
    console.log(`
@gosiki-os/port-manager v0.1.0

Usage:
  npx @gosiki-os/port-manager [port]           Acquire a port (default: 3000)
  npx @gosiki-os/port-manager --release <port> Release a port
  npx @gosiki-os/port-manager --list           List all allocations
  npx @gosiki-os/port-manager --help           Show this help

Examples:
  npx @gosiki-os/port-manager 3000             Acquire port starting from 3000
  npx @gosiki-os/port-manager --release 3001   Release port 3001
  npx @gosiki-os/port-manager --list           Show all allocated ports
    `);

  } else {
    const preferred = command ? parseInt(command, 10) : 3000;
    if (isNaN(preferred)) {
      console.error('Usage: npx @gosiki-os/port-manager [preferred-port]');
      process.exit(1);
    }
    const port = await acquirePort(preferred);
    process.stdout.write(port.toString());
  }
}
