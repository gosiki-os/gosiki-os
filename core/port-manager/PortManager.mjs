/**
 * PortManager - Gosiki OS Core Module
 *
 * Port allocation and management for Gosiki OS
 * Phase1a OSS-ready implementation
 *
 * @module core/port-manager
 */

import net from 'net';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Default configuration for PortManager
 */
const DEFAULT_CONFIG = {
  ports: {
    range: { start: 3000, end: 3999 }
  }
};

/**
 * Ensure directory exists
 * @param {string} path - Directory path
 */
function ensureDir(path) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

/**
 * Load registry from JSON file
 * @param {string} registryPath - Path to registry file
 * @returns {Object} Registry data
 */
function loadRegistry(registryPath) {
  if (!existsSync(registryPath)) {
    return { version: '1.0.0', allocations: {} };
  }
  try {
    return JSON.parse(readFileSync(registryPath, 'utf-8'));
  } catch {
    return { version: '1.0.0', allocations: {} };
  }
}

/**
 * Save registry to JSON file
 * @param {string} registryPath - Path to registry file
 * @param {Object} registry - Registry data
 */
function saveRegistry(registryPath, registry) {
  ensureDir(dirname(registryPath));
  writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');
}

/**
 * Check if a port is available
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} True if available
 */
function checkPortAvailability(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '0.0.0.0');
  });
}

const execAsync = promisify(exec);

/**
 * Detect which process is occupying a port
 * @param {number} port - Port number to check
 * @returns {Promise<Object|null>} { pid, processName } or null if not in use
 */
async function detectOccupier(port) {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      // Windows: netstat -ano | findstr :<port>
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.trim().split('\n');

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const localAddress = parts[1];

        // Check if this line is for our port (exact match)
        if (localAddress && localAddress.endsWith(`:${port}`)) {
          const pid = parts[parts.length - 1];

          // Get process name from PID
          try {
            const { stdout: tasklistOut } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
            const processName = tasklistOut.split(',')[0].replace(/"/g, '');
            return { pid: parseInt(pid), processName };
          } catch {
            return { pid: parseInt(pid), processName: 'unknown' };
          }
        }
      }
    } else {
      // macOS/Linux: lsof -i :<port>
      try {
        const { stdout } = await execAsync(`lsof -i :${port} -t -sTCP:LISTEN`);
        const pid = stdout.trim().split('\n')[0];

        if (pid) {
          // Get process name
          const { stdout: psOut } = await execAsync(`ps -p ${pid} -o comm=`);
          const processName = psOut.trim();
          return { pid: parseInt(pid), processName };
        }
      } catch (lsofErr) {
        // Fallback to netstat if lsof not available
        const { stdout } = await execAsync(`netstat -anp 2>/dev/null | grep :${port} | grep LISTEN`);
        const match = stdout.match(/(\d+)\//);
        if (match) {
          const pid = match[1];
          try {
            const { stdout: psOut } = await execAsync(`ps -p ${pid} -o comm=`);
            const processName = psOut.trim();
            return { pid: parseInt(pid), processName };
          } catch {
            return { pid: parseInt(pid), processName: 'unknown' };
          }
        }
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Kill a process by PID
 * @param {number} pid - Process ID to kill
 * @param {boolean} force - Force kill (SIGKILL on Unix, /F on Windows)
 * @returns {Promise<boolean>} True if killed successfully
 */
async function killProcess(pid, force = false) {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      const forceFlag = force ? '/F' : '';
      await execAsync(`taskkill /PID ${pid} ${forceFlag}`);
      return true;
    } else {
      const signal = force ? '-9' : '-15';
      await execAsync(`kill ${signal} ${pid}`);
      return true;
    }
  } catch (error) {
    return false;
  }
}

/**
 * PortManager - Manages port allocation and tracking
 * 
 * @example
 * ```javascript
 * import { PortManager } from '@gosiki/port-manager';
 * 
 * const pm = new PortManager();
 * const port = await pm.allocate();
 * console.log(`Allocated port: ${port}`);
 * 
 * // Release when done
 * await pm.release(port);
 * ```
 */
export class PortManager {
  /**
   * Create a new PortManager instance
   * @param {Object} options - Configuration options
   * @param {string} [options.registryPath] - Path to registry file
   * @param {Object} [options.config] - Configuration object
   * @param {Object} [options.range] - Port range { start, end }
   */
  constructor(options = {}) {
    this.registryPath = options.registryPath || this._getDefaultRegistryPath();
    this.config = options.config || DEFAULT_CONFIG;
    
    const configRange = this.config?.ports?.range || DEFAULT_CONFIG.ports.range;
    this.defaultRange = options.range || configRange;
  }

  /**
   * Get default registry path
   * @private
   * @returns {string} Default registry path
   */
  _getDefaultRegistryPath() {
    // When used as OSS module, use a local registry
    // When used in Gosiki OS, this can be overridden via options
    return join(__dirname, 'registry', 'ports.json');
  }

  /**
   * Allocate an available port
   * @param {Object} [range] - Port range { start, end }
   * @param {Object} [metadata] - Metadata to store with allocation
   * @returns {Promise<number>} Allocated port number
   * @throws {Error} If no ports available in range
   */
  async allocate(range = this.defaultRange, metadata = {}) {
    const registry = loadRegistry(this.registryPath);
    
    for (let port = range.start; port <= range.end; port += 1) {
      if (registry.allocations[port]) continue;
      
      const available = await checkPortAvailability(port);
      if (available) {
        registry.allocations[port] = {
          allocatedAt: new Date().toISOString(),
          metadata
        };
        saveRegistry(this.registryPath, registry);
        return port;
      }
    }
    
    throw new Error(
      `No available ports in range ${range.start}-${range.end}`
    );
  }

  /**
   * Release an allocated port
   * @param {number} port - Port number to release
   * @returns {Promise<boolean>} True if released
   */
  async release(port) {
    const registry = loadRegistry(this.registryPath);
    if (registry.allocations[port]) {
      delete registry.allocations[port];
      saveRegistry(this.registryPath, registry);
    }
    return true;
  }

  /**
   * Probe a port to check if it's in use
   * @param {number} port - Port number to probe
   * @returns {Promise<Object>} { port, inUse }
   */
  async probe(port) {
    const available = await checkPortAvailability(port);
    return { port, inUse: !available };
  }

  /**
   * List all port allocations
   * @returns {Array<Object>} Array of allocation records
   */
  listAllocations() {
    const registry = loadRegistry(this.registryPath);
    return Object.entries(registry.allocations).map(([port, info]) => ({
      port: Number(port),
      allocatedAt: info.allocatedAt,
      metadata: info.metadata || {}
    }));
  }

  /**
   * Cleanup all allocations
   * @returns {Object} { cleaned: true }
   */
  cleanup() {
    const registry = loadRegistry(this.registryPath);
    registry.allocations = {};
    saveRegistry(this.registryPath, registry);
    return { cleaned: true };
  }

  /**
   * Get current port range
   * @returns {Object} { start, end }
   */
  getRange() {
    return { ...this.defaultRange };
  }

  /**
   * Set port range
   * @param {Object} range - New range { start, end }
   */
  setRange(range) {
    if (range.start && range.end && range.start <= range.end) {
      this.defaultRange = { ...range };
    }
  }

  /**
   * Detect which process is occupying a port
   * @param {number} port - Port number to check
   * @returns {Promise<Object|null>} { pid, processName, port } or null if not in use
   */
  async detectOccupier(port) {
    const result = await detectOccupier(port);
    if (result) {
      return { ...result, port };
    }
    return null;
  }

  /**
   * Kill the process occupying a port
   * @param {number} port - Port number
   * @param {Object} [options] - Kill options
   * @param {boolean} [options.force=false] - Force kill (SIGKILL/taskkill /F)
   * @returns {Promise<Object>} { killed: boolean, pid?, processName? }
   */
  async killOccupier(port, options = {}) {
    const occupier = await this.detectOccupier(port);

    if (!occupier) {
      return { killed: false, reason: 'Port not in use' };
    }

    const killed = await killProcess(occupier.pid, options.force);

    if (killed) {
      // Also release from registry if it was allocated
      await this.release(port);
    }

    return {
      killed,
      pid: occupier.pid,
      processName: occupier.processName
    };
  }

  /**
   * Reserve a port (allocate and optionally kill occupier)
   * @param {number} port - Specific port to reserve
   * @param {Object} [options] - Reserve options
   * @param {boolean} [options.killIfOccupied=false] - Kill process if port is occupied
   * @param {boolean} [options.force=false] - Force kill if killing
   * @param {Object} [options.metadata] - Metadata to store
   * @returns {Promise<Object>} { port, wasOccupied, killed?, occupier? }
   */
  async reserve(port, options = {}) {
    const occupier = await this.detectOccupier(port);

    if (occupier) {
      if (options.killIfOccupied) {
        const killResult = await this.killOccupier(port, { force: options.force });

        if (!killResult.killed) {
          throw new Error(
            `Port ${port} is occupied by ${occupier.processName} (PID: ${occupier.pid}) and could not be killed`
          );
        }

        // Wait a moment for the port to be released
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verify port is now available
        const available = await checkPortAvailability(port);
        if (!available) {
          throw new Error(`Port ${port} is still not available after killing process`);
        }

        // Add to registry
        const registry = loadRegistry(this.registryPath);
        registry.allocations[port] = {
          allocatedAt: new Date().toISOString(),
          metadata: options.metadata || {}
        };
        saveRegistry(this.registryPath, registry);

        return {
          port,
          wasOccupied: true,
          killed: true,
          occupier
        };
      } else {
        throw new Error(
          `Port ${port} is occupied by ${occupier.processName} (PID: ${occupier.pid}). Use killIfOccupied option to force.`
        );
      }
    }

    // Port is available, just allocate it
    const available = await checkPortAvailability(port);
    if (!available) {
      throw new Error(`Port ${port} is not available`);
    }

    const registry = loadRegistry(this.registryPath);
    registry.allocations[port] = {
      allocatedAt: new Date().toISOString(),
      metadata: options.metadata || {}
    };
    saveRegistry(this.registryPath, registry);

    return {
      port,
      wasOccupied: false
    };
  }

  /**
   * Allocate a group of ports together
   * @param {number} count - Number of ports to allocate
   * @param {Object} [metadata] - Metadata for the group
   * @param {Array<string>} [roles] - Role names for each port (e.g., ['frontend', 'backend'])
   * @returns {Promise<Object>} { groupId, ports: {role: port}, metadata }
   */
  async allocateGroup(count, metadata = {}, roles = []) {
    const groupId = randomUUID();
    const registry = loadRegistry(this.registryPath);
    const allocatedPorts = {};
    const portNumbers = [];

    try {
      // Find consecutive or nearby ports
      for (let i = 0; i < count; i++) {
        let allocated = false;

        for (let port = this.defaultRange.start; port <= this.defaultRange.end; port++) {
          if (registry.allocations[port] || portNumbers.includes(port)) continue;

          const available = await checkPortAvailability(port);
          if (available) {
            const role = roles[i] || `port${i + 1}`;
            portNumbers.push(port);
            allocatedPorts[role] = port;

            registry.allocations[port] = {
              allocatedAt: new Date().toISOString(),
              groupId,
              role,
              metadata: { ...metadata }
            };

            allocated = true;
            break;
          }
        }

        if (!allocated) {
          // Rollback already allocated ports
          for (const allocatedPort of portNumbers) {
            delete registry.allocations[allocatedPort];
          }
          throw new Error(`Failed to allocate ${count} ports. Only ${i} were available.`);
        }
      }

      saveRegistry(this.registryPath, registry);

      return {
        groupId,
        ports: allocatedPorts,
        metadata
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Release all ports in a group
   * @param {string} groupId - Group ID to release
   * @returns {Promise<Object>} { released: number, ports: Array<number> }
   */
  async releaseGroup(groupId) {
    const registry = loadRegistry(this.registryPath);
    const releasedPorts = [];

    for (const [port, info] of Object.entries(registry.allocations)) {
      if (info.groupId === groupId) {
        releasedPorts.push(Number(port));
        delete registry.allocations[port];
      }
    }

    saveRegistry(this.registryPath, registry);

    return {
      released: releasedPorts.length,
      ports: releasedPorts
    };
  }

  /**
   * Get all ports for a specific app
   * @param {string} app - App name
   * @returns {Array<Object>} Array of port allocations
   */
  getPortsByApp(app) {
    const registry = loadRegistry(this.registryPath);
    const ports = [];

    for (const [port, info] of Object.entries(registry.allocations)) {
      // Support both 'app' and 'workspace' (legacy) fields
      const appName = info.metadata?.app || info.metadata?.workspace;

      if (appName === app) {
        ports.push({
          port: Number(port),
          ...info
        });
      }
    }

    return ports;
  }

  /**
   * Get all ports for a specific workspace (deprecated, use getPortsByApp)
   * @deprecated Use getPortsByApp() instead
   * @param {string} workspace - Workspace name
   * @returns {Array<Object>} Array of port allocations
   */
  getPortsByWorkspace(workspace) {
    return this.getPortsByApp(workspace);
  }

  /**
   * Get all ports for a specific worktree
   * @param {string} worktree - Worktree name
   * @returns {Array<Object>} Array of port allocations
   */
  getPortsByWorktree(worktree) {
    const registry = loadRegistry(this.registryPath);
    const ports = [];

    for (const [port, info] of Object.entries(registry.allocations)) {
      if (info.metadata?.worktree === worktree) {
        ports.push({
          port: Number(port),
          ...info
        });
      }
    }

    return ports;
  }

  /**
   * Get all ports grouped by app and worktree
   * @returns {Object} Structured port allocations by app/worktree
   */
  async getAllGrouped() {
    const registry = loadRegistry(this.registryPath);
    const grouped = {};

    for (const [port, info] of Object.entries(registry.allocations)) {
      // Support both 'app' and 'workspace' (legacy) fields
      const app = info.metadata?.app || info.metadata?.workspace || 'default';
      const worktree = info.metadata?.worktree || 'default';

      if (!grouped[app]) {
        grouped[app] = {};
      }
      if (!grouped[app][worktree]) {
        grouped[app][worktree] = [];
      }

      // Check if port is actually in use
      const occupier = await detectOccupier(Number(port));

      grouped[app][worktree].push({
        port: Number(port),
        role: info.role || 'unknown',
        groupId: info.groupId,
        allocatedAt: info.allocatedAt,
        status: occupier ? 'active' : 'free',
        process: occupier || null,
        metadata: info.metadata || {}
      });
    }

    return grouped;
  }

  /**
   * Get all groups
   * @returns {Object} Map of groupId to group info
   */
  getGroups() {
    const registry = loadRegistry(this.registryPath);
    const groups = {};

    for (const [port, info] of Object.entries(registry.allocations)) {
      if (info.groupId) {
        if (!groups[info.groupId]) {
          groups[info.groupId] = {
            groupId: info.groupId,
            ports: [],
            metadata: info.metadata || {}
          };
        }
        groups[info.groupId].ports.push({
          port: Number(port),
          role: info.role
        });
      }
    }

    return groups;
  }
}

