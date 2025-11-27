#!/usr/bin/env node
/**
 * Port Manager CLI - Gosiki OS
 *
 * Simple CLI interface for AI agents to manage ports
 *
 * Usage:
 *   gosiki-port --allocate [--range 3000-3999] [--metadata key=value]
 *   gosiki-port --reserve 11434 [--kill] [--force]
 *   gosiki-port --probe 3000
 *   gosiki-port --detect 3000
 *   gosiki-port --kill-port 3000 [--force]
 *   gosiki-port --release 3000
 *   gosiki-port --list
 *   gosiki-port --cleanup
 *
 * Examples:
 *   # Allocate any available port
 *   gosiki-port --allocate
 *
 *   # Reserve port 11434 (fail if occupied)
 *   gosiki-port --reserve 11434
 *
 *   # Reserve port 11434 and kill occupier if needed
 *   gosiki-port --reserve 11434 --kill
 *
 *   # Check who's using port 3000
 *   gosiki-port --detect 3000
 *
 *   # Kill process on port 3000
 *   gosiki-port --kill-port 3000
 */

import { PortManager } from './PortManager.mjs';
import {
  formatOutput,
  logOccupied,
  logTerminated,
  logReserved,
  logAllocated,
  logBlocked,
  logReleased,
  logNotInUse,
  logError
} from './logger.mjs';
import { formatDashboard } from './dashboard.mjs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = {
    command: null,
    port: null,
    count: null,
    groupId: null,
    roles: [],
    range: null,
    metadata: {},
    app: null,
    worktree: null,
    kill: false,
    force: false,
    json: false,
    help: false
  };

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--allocate') {
      args.command = 'allocate';
    } else if (arg === '--allocate-group') {
      args.command = 'allocate-group';
      args.count = parseInt(process.argv[++i]);
    } else if (arg === '--release-group') {
      args.command = 'release-group';
      args.groupId = process.argv[++i];
    } else if (arg === '--dashboard') {
      args.command = 'dashboard';
    } else if (arg === '--reserve') {
      args.command = 'reserve';
      args.port = parseInt(process.argv[++i]);
    } else if (arg === '--probe') {
      args.command = 'probe';
      args.port = parseInt(process.argv[++i]);
    } else if (arg === '--detect') {
      args.command = 'detect';
      args.port = parseInt(process.argv[++i]);
    } else if (arg === '--kill-port') {
      args.command = 'kill';
      args.port = parseInt(process.argv[++i]);
    } else if (arg === '--release') {
      args.command = 'release';
      args.port = parseInt(process.argv[++i]);
    } else if (arg === '--list') {
      args.command = 'list';
    } else if (arg === '--cleanup') {
      args.command = 'cleanup';
    } else if (arg === '--range') {
      const rangeStr = process.argv[++i];
      const [start, end] = rangeStr.split('-').map(Number);
      args.range = { start, end };
    } else if (arg === '--roles') {
      const rolesStr = process.argv[++i];
      args.roles = rolesStr.split(',');
    } else if (arg === '--app') {
      args.app = process.argv[++i];
    } else if (arg === '--worktree') {
      args.worktree = process.argv[++i];
    } else if (arg === '--metadata') {
      const metaStr = process.argv[++i];
      const [key, value] = metaStr.split('=');
      args.metadata[key] = value;
    } else if (arg === '--kill') {
      args.kill = true;
    } else if (arg === '--force') {
      args.force = true;
    } else if (arg === '--json') {
      args.json = true;
    }
  }

  return args;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
Gosiki Port Manager CLI
========================

Usage:
  gosiki-port --allocate [--range 3000-3999] [--app <name>] [--worktree <name>]
  gosiki-port --allocate-group <count> --roles <role1,role2> [--app <name>] [--worktree <name>]
  gosiki-port --reserve <port> [--kill] [--force]
  gosiki-port --probe <port>
  gosiki-port --detect <port>
  gosiki-port --kill-port <port> [--force]
  gosiki-port --release <port>
  gosiki-port --release-group <groupId>
  gosiki-port --dashboard
  gosiki-port --list
  gosiki-port --cleanup

Commands:
  --allocate                Allocate any available port in range
  --allocate-group <count>  Allocate multiple ports as a group
  --release-group <id>      Release all ports in a group
  --dashboard               Show port allocations dashboard
  --reserve <port>          Reserve a specific port
  --probe <port>            Check if a port is in use
  --detect <port>           Detect which process is using a port
  --kill-port <port>        Kill the process using a port
  --release <port>          Release an allocated port
  --list                    List all port allocations
  --cleanup                 Remove all allocations from registry

Options:
  --range <start-end>       Port range (e.g., 3000-3999)
  --roles <role1,role2>     Role names for group allocation (e.g., frontend,backend)
  --app <name>              Application name (e.g., miyabi, gosiki, xevaral-bus)
  --worktree <name>         Worktree name
  --metadata <k=v>          Add metadata to allocation
  --kill                    Kill occupier when reserving
  --force                   Force kill process (SIGKILL/taskkill /F)
  --json                    Output in JSON format (AI-readable)
  --help, -h                Show this help message

Examples:
  # Allocate any available port
  gosiki-port --allocate --app gosiki --worktree feature/ports

  # Allocate group for frontend + backend
  gosiki-port --allocate-group 3 --roles frontend,backend,test --app miyabi

  # Show dashboard
  gosiki-port --dashboard

  # Reserve port 11434 (fail if occupied)
  gosiki-port --reserve 11434

  # Reserve port 11434 and kill occupier if needed
  gosiki-port --reserve 11434 --kill

  # Check who's using port 3000
  gosiki-port --detect 3000

  # Kill process on port 3000
  gosiki-port --kill-port 3000

  # List all allocations
  gosiki-port --list
`);
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = parseArgs();

  if (args.help || !args.command) {
    printHelp();
    process.exit(0);
  }

  const pm = new PortManager();

  try {
    // Build metadata from app/worktree if provided
    if (args.app) {
      args.metadata.app = args.app;
    }
    if (args.worktree) {
      args.metadata.worktree = args.worktree;
    }

    switch (args.command) {
      case 'allocate': {
        const port = await pm.allocate(args.range, args.metadata);
        const logData = logAllocated(port);
        console.log(formatOutput(logData, args.json));
        break;
      }

      case 'allocate-group': {
        if (!args.count || args.count < 1) {
          const errorData = logError('--allocate-group requires a count >= 1');
          console.error(formatOutput(errorData, args.json));
          process.exit(1);
        }

        const result = await pm.allocateGroup(args.count, args.metadata, args.roles);

        if (args.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Gosiki OS: Allocated port group ${result.groupId}`);
          for (const [role, port] of Object.entries(result.ports)) {
            console.log(`  ${role}: ${port}`);
          }
        }
        break;
      }

      case 'release-group': {
        if (!args.groupId) {
          const errorData = logError('--release-group requires a group ID');
          console.error(formatOutput(errorData, args.json));
          process.exit(1);
        }

        const result = await pm.releaseGroup(args.groupId);

        if (args.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Gosiki OS: Released ${result.released} port(s) from group ${args.groupId}`);
          console.log(`  Ports: ${result.ports.join(', ')}`);
        }
        break;
      }

      case 'dashboard': {
        const grouped = await pm.getAllGrouped();
        console.log(formatDashboard(grouped, args.json));
        break;
      }

      case 'reserve': {
        if (!args.port) {
          const errorData = logError('--reserve requires a port number');
          console.error(formatOutput(errorData, args.json));
          process.exit(1);
        }

        const result = await pm.reserve(args.port, {
          killIfOccupied: args.kill,
          force: args.force,
          metadata: args.metadata
        });

        const logData = logReserved(result.port, result);
        console.log(formatOutput(logData, args.json));
        break;
      }

      case 'probe': {
        if (!args.port) {
          const errorData = logError('--probe requires a port number');
          console.error(formatOutput(errorData, args.json));
          process.exit(1);
        }

        const result = await pm.probe(args.port);
        const logData = result.inUse
          ? { status: 'in-use', port: args.port, message: 'Port is currently in use.' }
          : logNotInUse(args.port);
        console.log(formatOutput(logData, args.json));
        break;
      }

      case 'detect': {
        if (!args.port) {
          const errorData = logError('--detect requires a port number');
          console.error(formatOutput(errorData, args.json));
          process.exit(1);
        }

        const occupier = await pm.detectOccupier(args.port);
        const logData = occupier
          ? logOccupied(args.port, occupier)
          : logNotInUse(args.port);
        console.log(formatOutput(logData, args.json));
        break;
      }

      case 'kill': {
        if (!args.port) {
          const errorData = logError('--kill-port requires a port number');
          console.error(formatOutput(errorData, args.json));
          process.exit(1);
        }

        const result = await pm.killOccupier(args.port, { force: args.force });
        const logData = result.killed
          ? logTerminated(args.port, result)
          : logNotInUse(args.port);
        console.log(formatOutput(logData, args.json));
        break;
      }

      case 'release': {
        if (!args.port) {
          const errorData = logError('--release requires a port number');
          console.error(formatOutput(errorData, args.json));
          process.exit(1);
        }

        await pm.release(args.port);
        const logData = logReleased(args.port);
        console.log(formatOutput(logData, args.json));
        break;
      }

      case 'list': {
        const allocations = pm.listAllocations();
        const logData = {
          status: 'list',
          allocations,
          message: `Found ${allocations.length} allocated port(s).`
        };
        console.log(formatOutput(logData, args.json));
        break;
      }

      case 'cleanup': {
        pm.cleanup();
        const logData = {
          status: 'cleanup',
          message: 'All port allocations have been cleared.'
        };
        console.log(formatOutput(logData, args.json));
        break;
      }

      default:
        const errorData = logError(`Unknown command: ${args.command}`);
        console.error(formatOutput(errorData, args.json));
        process.exit(1);
    }
  } catch (error) {
    const errorData = logError(error.message);
    console.error(formatOutput(errorData, args.json));
    process.exit(1);
  }
}

main().catch(error => {
  const errorData = logError(error.message);
  console.error(formatOutput(errorData, false)); // Default to human-readable for uncaught errors
  process.exit(1);
});
