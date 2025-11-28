# @gosiki-os/port-manager v0.1.1

**A world where 10 AI agents can run simultaneously without port conflicts**

```js
import { PortManager } from '@gosiki-os/port-manager';

const pm = new PortManager();

// Allocate a port
const port = await pm.allocate();
console.log(`Using port ${port}`);

// Release a port
await pm.release(port);

// List all allocations
const allocations = await pm.listAll();
console.log(allocations);
```

---

## 🚀 Quick Start

### Try the Demo (5 minutes)

```bash
# Clone the repository
git clone https://github.com/gosiki-os/gosiki-os
cd gosiki-os

# Install dependencies
npm install

# Run the demo
npm run demo
```

The demo will show you:
- ✅ Port allocation
- ✅ Group allocation (frontend, backend, test)
- ✅ Dashboard visualization
- ✅ Automatic cleanup

### Try the Basic App Example

```bash
cd examples/basic-app
node index.mjs
```

### Use in Your Project

**Phase 1 (current, v0.1.x)**:
```javascript
// Import from relative path
import { PortManager } from './path/to/gosiki/core/port-manager/index.mjs';

const pm = new PortManager();
const port = await pm.allocate();
console.log(`Allocated port: ${port}`);
```

**Phase 2 (npm package, v1.0.0+)**:
```bash
npm install @gosiki-os/port-manager
```

```javascript
// Import as npm package
import { PortManager } from '@gosiki-os/port-manager';
```

### Learn More

- [Examples](examples/) - Working code samples
- [Basic App Example](examples/basic-app/README.md) - Migration path to production
- [Demo CLI](examples/demo-cli/README.md) - Interactive demonstration
- [Port Manager API](core/port-manager/README.md) - Full API reference

---

## Try it in 3 seconds
```bash
# Acquire a port
npx @gosiki-os/port-manager 3000

# Release a port
npx @gosiki-os/port-manager --release 3001

# List all allocations
npx @gosiki-os/port-manager --list

# Show help
npx @gosiki-os/port-manager --help
```

## Features (v0.1.0)

✅ **Port Acquisition** - Automatically find and allocate available ports
✅ **Registry Management** - Track allocated ports in `~/.gosiki-os/port-registry.json`
✅ **Port Release** - Free up allocated ports
✅ **List Allocations** - View all currently allocated ports
✅ **Windows Support** - Full Windows 10/11 support (no admin required)

## ⚠ Execution Requirements (Important)

`@gosiki-os/port-manager` is a **local OS-level tool**.
It requires actual access to your filesystem, process table, and network ports.

Because of these restrictions:

### ✅ Supported Environments
- **Claude Code – VS Code Terminal**
- **Claude Code CLI**
- **Windows 10 / 11** (PowerShell + Node.js v18+)
- **macOS / Linux / WSL2** (coming in v0.2)

### ❌ Not Supported (Will NOT work)
These environments **cannot access your local OS**, so the tool cannot run:

- ChatGPT WebUI (browser sandbox prevents local execution)
- ChatGPT Desktop App
- Claude WebUI
- Cursor AI Editor (browser sandbox cannot manage ports/processes)
- Antigravity "AI-only mode" (insufficient local privileges)
- GitHub Codespaces / Cloud Shell

### Why?
Port Manager needs:
- Local process scanning
- Port probing
- PowerShell / lsof
- True filesystem access
- Node.js execution

Browser-based AI environments **cannot** perform these operations.

➡ **You MUST run this in Claude Code Terminal (VS Code).**

## API Reference

### `acquirePort(preferred, range)`

Acquire an available port starting from the preferred port.

```js
const port = await acquirePort(3000, 100); // Search 3000-3099
```

### `releasePort(port)`

Release an allocated port from the registry.

```js
await releasePort(3001);
```

### `listAllocations()`

List all port allocations with metadata.

```js
const allocations = await listAllocations();
// Returns: [{ port: 3001, allocatedAt: '2025-11-26T...', pid: 12345 }]
```

## CLI Usage

```bash
# Acquire a port (default: 3000)
npx @gosiki-os/port-manager

# Acquire from specific port
npx @gosiki-os/port-manager 8080

# Acquire with label (v0.1.3+)
npx @gosiki-os/port-manager --label frontend
npx @gosiki-os/port-manager 8080 --label backend

# Release a port
npx @gosiki-os/port-manager --release 3001

# List all allocations (shows labels and registry location)
npx @gosiki-os/port-manager --list

# Show help
npx @gosiki-os/port-manager --help
```

**New in v0.1.3**:
- 🏷️ **Labels**: Organize ports with labels (`--label frontend`, `--label backend`)
- 🎬 **Demo Mode**: Set `GOSIKI_DEMO_MODE=true` to mask username for recording demos
- 📁 **Registry Location**: Displayed in all commands for transparency

## Current Status

**Platform Support**:
- ✅ Windows 10/11 (no admin privileges required)
- 🚧 Linux / macOS / WSL2 (coming in v0.2)

## What's Next?

- **v0.2**: Process detection, kill occupier, cross-platform support
- **v0.3**: Dashboard, group allocation, JSON mode
- **v1.0**: Full Boundary OS with Process Manager & Token Manager

## What is this?

This is the first piece of Gosiki OS L2 Runtime - a unified runtime layer for all AI development tools (Claude Code, Cursor, Copilot, etc.).

Port Manager prevents port conflicts when multiple AI agents are running simultaneously.

## License

MIT License - see [LICENSE](LICENSE)

## Author

Yuki Nomoto <gosiki.org@gmail.com>

---

Learn more at https://gosiki.dev
