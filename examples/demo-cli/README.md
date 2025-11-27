# GosikiOS Demo CLI

Demonstrates the core features of GosikiOS Phase 1a (Port Manager).

## How to Run

### From the Root Directory

```bash
# Run with npm script
npm run demo

# Or run directly
node examples/demo-cli/index.mjs
```

### From This Directory

```bash
cd examples/demo-cli
node index.mjs
```

## Demo Features

1. **Port Allocation**: Automatic allocation of a single port
2. **Group Allocation**: Batch allocation of multiple ports (frontend, backend, test)
3. **Dashboard Display**: Visualization of allocation status
4. **Cleanup**: Port release

## Next Steps

- [Basic App Example](../basic-app/README.md) - Usage example in a real application
- [Port Manager API](../../core/port-manager/README.md) - Detailed API specification
