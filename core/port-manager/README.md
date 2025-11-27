# @gosiki/port-manager

Port allocation and management module for Gosiki OS.

## Overview

PortManager provides a simple API for allocating, releasing, and tracking TCP ports in your development environment. It prevents port conflicts by maintaining a registry of allocated ports.

## Installation

```bash
npm install @gosiki/port-manager
```

## Usage

```javascript
import { PortManager } from '@gosiki/port-manager';

// Create instance with default settings
const pm = new PortManager();

// Allocate a port
const port = await pm.allocate();
console.log(`Allocated port: ${port}`);

// Allocate with custom range
const customPort = await pm.allocate({ start: 4000, end: 4999 });

// Allocate with metadata
const trackedPort = await pm.allocate(undefined, {
  project: 'my-app',
  service: 'api'
});

// Check if a port is in use
const status = await pm.probe(3000);
console.log(status.inUse ? 'Port 3000 is in use' : 'Port 3000 is available');

// List all allocations
const allocations = pm.listAllocations();
console.log('Current allocations:', allocations);

// Release a port
await pm.release(port);

// Cleanup all allocations
pm.cleanup();

// Detect who's using a port
const occupier = await pm.detectOccupier(3000);
if (occupier) {
  console.log(`Port 3000 is used by ${occupier.processName} (PID: ${occupier.pid})`);
}

// Kill process on a port
const killResult = await pm.killOccupier(3000);
console.log(`Killed: ${killResult.killed}`);

// Reserve a specific port (with optional kill)
const reserved = await pm.reserve(11434, {
  killIfOccupied: true,
  metadata: { service: 'ollama' }
});
console.log(`Reserved port ${reserved.port}`);
```

## API

### `new PortManager(options)`

Create a new PortManager instance.

**Options:**
- `registryPath` (string): Path to the registry JSON file
- `config` (object): Configuration object with `ports.range`
- `range` (object): Default port range `{ start, end }`

### `allocate(range?, metadata?)`

Allocate an available port.

- **range** (object, optional): Port range `{ start, end }`
- **metadata** (object, optional): Metadata to store with allocation
- **Returns**: `Promise<number>` - Allocated port number

### `release(port)`

Release an allocated port.

- **port** (number): Port number to release
- **Returns**: `Promise<boolean>`

### `probe(port)`

Check if a port is in use.

- **port** (number): Port number to check
- **Returns**: `Promise<{ port, inUse }>`

### `listAllocations()`

List all port allocations.

- **Returns**: `Array<{ port, allocatedAt, metadata }>`

### `cleanup()`

Remove all allocations from the registry.

- **Returns**: `{ cleaned: true }`

### `getRange()`

Get the current default port range.

- **Returns**: `{ start, end }`

### `setRange(range)`

Set the default port range.

- **range** (object): New range `{ start, end }`

### `detectOccupier(port)`

Detect which process is occupying a port.

- **port** (number): Port number to check
- **Returns**: `Promise<{ pid, processName, port } | null>`

### `killOccupier(port, options)`

Kill the process occupying a port.

- **port** (number): Port number
- **options** (object, optional):
  - `force` (boolean): Force kill (SIGKILL on Unix, /F on Windows)
- **Returns**: `Promise<{ killed, pid?, processName? }>`

### `reserve(port, options)`

Reserve a specific port (allocate and optionally kill occupier).

- **port** (number): Specific port to reserve
- **options** (object, optional):
  - `killIfOccupied` (boolean): Kill process if port is occupied
  - `force` (boolean): Force kill if killing
  - `metadata` (object): Metadata to store
- **Returns**: `Promise<{ port, wasOccupied, killed?, occupier? }>`

## CLI Interface

For AI agent integration, use the CLI with two output modes:

### Human-readable mode (default)

```bash
# Allocate any available port
node core/port-manager/cli.mjs --allocate
# Output: Gosiki OS: Allocated port 43112.

# Allocate port for a specific app
node core/port-manager/cli.mjs --allocate --app miyabi --worktree feature/new-ui
# Output: Gosiki OS: Allocated port 43113.

# Allocate group of ports with roles
node core/port-manager/cli.mjs --allocate-group 3 --roles frontend,backend,test --app miyabi
# Output: Gosiki OS: Allocated port group abc123...
#         frontend: 43114
#         backend: 43115
#         test: 43116

# Show port allocation dashboard
node core/port-manager/cli.mjs --dashboard
# Output:
# Gosiki OS - Port Allocations
# =============================
#
# 📦 App: miyabi
#   🌿 Worktree: feature/new-ui
#      frontend   43114  [ACTIVE] node (PID 12345)
#      backend    43115  [ACTIVE] node (PID 12346)
#      test       43116  [FREE]

# Reserve a specific port
node core/port-manager/cli.mjs --reserve 11434
# Output: Gosiki OS: Port 11434 is now reserved.

# Detect who's using a port
node core/port-manager/cli.mjs --detect 3000
# Output: Gosiki OS: Port 3000 is currently occupied.
#         Process: node (PID: 12498)
#         No action was taken.

# Kill process on a port
node core/port-manager/cli.mjs --kill-port 3000 --force
# Output: Gosiki OS: Port 3000 was occupied by PID 12498.
#         Gosiki OS has safely terminated the process.
#         PortShot was prevented.
```

### JSON mode (for AI agents)

Add `--json` flag for structured output:

```bash
# Detect with JSON output
node core/port-manager/cli.mjs --detect 3000 --json
# Output:
# {
#   "status": "occupied",
#   "port": 3000,
#   "process": {
#     "pid": 12498,
#     "name": "node"
#   },
#   "message": "Port is occupied. No action taken."
# }

# Reserve with kill and JSON output
node core/port-manager/cli.mjs --reserve 11434 --kill --json
# Output:
# {
#   "status": "reserved",
#   "port": 11434,
#   "message": "Port successfully reserved."
# }
```

All CLI commands support `--json` for AI-readable structured output.

## Configuration

Default port range: `3000-3999`

You can customize the range via constructor options:

```javascript
const pm = new PortManager({
  range: { start: 8000, end: 8999 }
});
```

## License

MIT

