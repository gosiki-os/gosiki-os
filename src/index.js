#!/usr/bin/env node
import { execSync } from 'child_process';

/**
 * Automatically acquire an available port (Windows 10/11 fully supported, no admin privileges required)
 * @param {number} preferred Preferred port (e.g., 3000)
 * @param {number} range Search range (default 100)
 * @returns {Promise<number>}
 */
export async function acquirePort(preferred = 3000, range = 100) {
  for (let port = preferred; port < preferred + range; port++) {
    if (await isPortFree(port)) {
      console.log(`Port ${port} acquired`);
      return port;
    }
  }
  console.error(`No available ports in range ${preferred}-${preferred + range - 1}`);
  process.exit(1);
}

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

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const preferred = process.argv[2] ? parseInt(process.argv[2], 10) : 3000;
  if (isNaN(preferred)) {
    console.error('Usage: npx @gosiki-os/port-manager [preferred-port]');
    process.exit(1);
  }
  acquirePort(preferred).then(p => process.stdout.write(p.toString()));
}
