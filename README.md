# @gosiki-os/port-manager v0.1.0

**A world where 10 AI agents can run simultaneously without port conflicts**

```js
import { acquirePort } from '@gosiki-os/port-manager';
const port = await acquirePort(3000); // → If 3000 is taken, tries 3001, 3002...
console.log(port);
```

## Try it in 3 seconds
```bash
npx @gosiki-os/port-manager 3000
```

## Current Status
Windows 10/11 MVP (No admin privileges required)
Linux / macOS / WSL2 support coming in v0.2+

## What is this?
This is the first piece of Gosiki OS L2 Runtime.
A 41-line module to end port hell.

## Roadmap
- v0.2 ProcessManager
- v0.3 FolderPolicy
- v1.0 Boundary OS (Completely prevent AI chaos)

## License

MIT License - see [LICENSE](LICENSE)

## Author

Yuki Nomoto <gosiki.org@gmail.com>

---

Learn more at https://gosiki.dev
