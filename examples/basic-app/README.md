# GosikiOS Basic App Example

A minimal application example. This demonstrates the basic pattern for port management using Port Manager.

## Setup

```bash
cd examples/basic-app
npm install  # Only if dependencies exist
```

## Running

```bash
npm start
# or
node index.mjs
```

## Code Explanation

```javascript
import { PortManager } from '../../core/port-manager/index.mjs';

const pm = new PortManager();

// Port allocation
const port = await pm.allocate(undefined, {
  app: 'basic-app',
  worktree: 'main',
  service: 'http-server'
});

// Release port on exit
process.on('SIGINT', async () => {
  await pm.release(port);
  process.exit(0);
});
```

---

## Production Usage

This section explains the migration path for using this demo in production environments.

### Phase 1 (Current, v0.1.x)

**Import with relative paths**

```javascript
// Reference from your project using relative paths
import { PortManager } from './path/to/gosiki/core/port-manager/index.mjs';

const pm = new PortManager();
const port = await pm.allocate();
```

### Phase 2 (After npm publication, v1.0.0+)

**Import as npm package**

```bash
# Install via npm
npm install @gosiki-os/port-manager
```

```javascript
// Import as npm package
import { PortManager } from '@gosiki-os/port-manager';

const pm = new PortManager();
const port = await pm.allocate();
```

### Configuration Customization

In production environments, you can customize the configuration:

```javascript
const pm = new PortManager({
  // Specify port range
  range: { start: 8000, end: 8999 },

  // Registry file location
  registryPath: '/var/app/gosiki-ports.json'
});

// Add metadata
const port = await pm.allocate(undefined, {
  app: 'my-production-app',
  worktree: 'production',
  environment: 'prod',
  region: 'us-west-2'
});
```

### Error Handling

Production environments require proper error handling:

```javascript
try {
  const port = await pm.allocate();
  console.log(`Server started on port ${port}`);
} catch (error) {
  if (error.message.includes('No available ports')) {
    // Fallback processing
    console.error('All ports are in use, trying alternative range...');
    const fallbackPm = new PortManager({
      range: { start: 9000, end: 9999 }
    });
    const port = await fallbackPm.allocate();
    console.log(`Server started on fallback port ${port}`);
  } else {
    throw error;
  }
}
```

### Using Group Allocation

When managing multiple services simultaneously (frontend, backend, database, etc.):

```javascript
// Group allocation
const group = await pm.allocateGroup(3,
  { app: 'my-app', worktree: 'production' },
  ['frontend', 'backend', 'database']
);

console.log('Allocated ports:');
console.log(`  Frontend: ${group.ports.frontend}`);
console.log(`  Backend: ${group.ports.backend}`);
console.log(`  Database: ${group.ports.database}`);

// Batch release after use
await pm.releaseGroup(group.groupId);
```

---

## Features Added in Phase 1b and Later (v0.2.0+)

Process Manager will be added in v0.2.0 (Phase 1b):

```javascript
import { ProcessManager } from '@gosiki-os/process-manager';

const procManager = new ProcessManager();

// Integrate process startup and port management
const process = await procManager.start('node', ['server.js'], {
  port,
  app: 'my-app',
  worktree: 'production'
});

// Monitor processes
procManager.on('exit', (proc) => {
  console.log(`Process ${proc.pid} exited`);
  pm.release(proc.port);
});
```

---

## References

- [Port Manager API Reference](../../core/port-manager/README.md)
- [GosikiOS Protocol](../../docs/gosiki-protocol.md)
- [Demo CLI](../demo-cli/README.md)

---

## Troubleshooting

### Port Cannot Be Allocated

```bash
# Check port usage status
node ../../core/port-manager/cli.mjs --list

# or
node ../../core/port-manager/cli.mjs --dashboard
```

### Registry Cleanup

```bash
# Clear all port allocations
node ../../core/port-manager/cli.mjs --cleanup
```

### Check Specific Port

```bash
# Check if port is in use
node ../../core/port-manager/cli.mjs --detect 3000

# Force kill process
node ../../core/port-manager/cli.mjs --kill-port 3000 --force
```
