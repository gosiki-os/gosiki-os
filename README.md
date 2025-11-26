# @gosiki-os/port-manager v0.1.0

**A world where 10 AI agents can run simultaneously without port conflicts**

```js
import { acquirePort, releasePort, listAllocations } from '@gosiki-os/port-manager';

// Acquire a port
const port = await acquirePort(3000);
console.log(`Using port ${port}`);

// Release a port
await releasePort(port);

// List all allocations
const allocations = await listAllocations();
console.log(allocations);
```

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

# Release a port
npx @gosiki-os/port-manager --release 3001

# List all allocations
npx @gosiki-os/port-manager --list

# Show help
npx @gosiki-os/port-manager --help
```

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
