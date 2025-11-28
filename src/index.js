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
 * Get PID of process using a port
 * @param {number} port - Port number to check
 * @returns {Promise<number|null>}
 */
async function getPortPid(port) {
  try {
    const result = execSync(
      `powershell -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"`,
      { stdio: 'pipe' }
    );
    const pid = parseInt(result.toString().trim());
    return isNaN(pid) ? null : pid;
  } catch {
    return null;
  }
}

/**
 * Check if a port is free (both system and registry)
 * @param {number} port - Port number to check
 * @param {Object} registry - Registry data
 * @returns {Promise<boolean>}
 */
async function isPortFree(port, registry) {
  // Check system level (is any process using this port?)
  const systemPid = await getPortPid(port);
  if (systemPid !== null) {
    return false;  // Port is in use by system
  }

  // Check registry (is this port allocated by Gosiki OS?)
  const managed = registry.allocations[port];
  if (managed) {
    // Check if the process is still alive
    try {
      process.kill(managed.pid, 0);  // Signal 0 checks if process exists
      return false;  // Process exists, port is still allocated
    } catch {
      // Process doesn't exist, port allocation is stale
      // Remove stale entry
      delete registry.allocations[port];
      saveRegistry(registry);
      return true;  // Port is free (stale entry removed)
    }
  }

  return true;  // Port is free
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
    if (await isPortFree(port, registry)) {
      // Port is free, allocate it
      registry.allocations[port] = {
        allocatedAt: new Date().toISOString(),
        pid: process.pid
      };
      saveRegistry(registry);

      console.log(`Port ${port} acquired ✓`);
      return port;
    } else {
      // Port is in use - check why
      const systemPid = await getPortPid(port);
      const managed = registry.allocations[port];

      if (systemPid && managed) {
        // Both system and registry
        console.log(`Checking port ${port}... in use (PID: ${managed.pid}) [managed]`);
      } else if (managed) {
        // Registry only (process might have ended but port reallocated)
        console.log(`Checking port ${port}... in use (PID: ${managed.pid}) [managed]`);
      } else {
        // System only
        console.log(`Checking port ${port}... in use [not managed]`);
      }
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
    const registry = loadRegistry();

    // Get all ports used by system in common ranges
    const portsToCheck = new Set();

    // Add managed ports
    Object.keys(registry.allocations).forEach(port => {
      portsToCheck.add(parseInt(port));
    });

    // Add common port range (3000-3020 for development)
    for (let port = 3000; port <= 3020; port++) {
      portsToCheck.add(port);
    }

    console.log('Port Status:');
    const sortedPorts = Array.from(portsToCheck).sort((a, b) => a - b);
    let hasAnyPort = false;

    for (const port of sortedPorts) {
      const systemPid = await getPortPid(port);
      const managed = registry.allocations[port];

      if (systemPid && managed) {
        // Managed by Gosiki and currently in use
        console.log(`  ${port} - managed by Gosiki (PID: ${managed.pid}) ✓`);
        hasAnyPort = true;
      } else if (systemPid) {
        // In use but not managed by Gosiki
        console.log(`  ${port} - in use by system [not managed]`);
        hasAnyPort = true;
      } else if (managed) {
        // Managed but process ended (stale entry)
        console.log(`  ${port} - managed but process ended (PID: ${managed.pid}) [stale]`);
        hasAnyPort = true;
      }
    }

    if (!hasAnyPort) {
      console.log('  No ports in use');
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
