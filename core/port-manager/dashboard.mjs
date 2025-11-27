/**
 * Port Manager Dashboard - Gosiki OS
 *
 * Terminal visualization for port allocations
 *
 * @module core/port-manager/dashboard
 */

/**
 * Format dashboard output
 * @param {Object} grouped - Grouped port data from getAllGrouped()
 * @param {boolean} jsonMode - Whether to output JSON
 * @returns {string} Formatted dashboard
 */
export function formatDashboard(grouped, jsonMode = false) {
  if (jsonMode) {
    return JSON.stringify({ apps: grouped }, null, 2);
  }

  return formatHumanDashboard(grouped);
}

/**
 * Format human-readable dashboard
 * @private
 * @param {Object} grouped - Grouped port data
 * @returns {string} Human-readable dashboard
 */
function formatHumanDashboard(grouped) {
  const lines = [];

  lines.push('');
  lines.push('Gosiki OS - Port Allocations');
  lines.push('=============================');
  lines.push('');

  const apps = Object.keys(grouped);

  if (apps.length === 0) {
    lines.push('No ports currently allocated.');
    lines.push('');
    return lines.join('\n');
  }

  for (const app of apps.sort()) {
    lines.push(`📦 App: ${app}`);

    const worktrees = Object.keys(grouped[app]);

    for (const worktree of worktrees.sort()) {
      lines.push(`  🌿 Worktree: ${worktree}`);

      const ports = grouped[app][worktree];

      // Group by groupId if available
      const groupedPorts = {};
      const ungroupedPorts = [];

      for (const portInfo of ports) {
        if (portInfo.groupId) {
          if (!groupedPorts[portInfo.groupId]) {
            groupedPorts[portInfo.groupId] = [];
          }
          groupedPorts[portInfo.groupId].push(portInfo);
        } else {
          ungroupedPorts.push(portInfo);
        }
      }

      // Display grouped ports
      for (const [groupId, groupPorts] of Object.entries(groupedPorts)) {
        for (const portInfo of groupPorts.sort((a, b) => a.port - b.port)) {
          const status = portInfo.status === 'active' ? '[ACTIVE]' : '[FREE]  ';
          const processInfo = portInfo.process
            ? `${portInfo.process.processName} (PID ${portInfo.process.pid})`
            : '';
          const roleDisplay = portInfo.role.padEnd(10);

          lines.push(`     ${roleDisplay} ${portInfo.port}  ${status} ${processInfo}`);
        }
      }

      // Display ungrouped ports
      for (const portInfo of ungroupedPorts.sort((a, b) => a.port - b.port)) {
        const status = portInfo.status === 'active' ? '[ACTIVE]' : '[FREE]  ';
        const processInfo = portInfo.process
          ? `${portInfo.process.processName} (PID ${portInfo.process.pid})`
          : '';
        const roleDisplay = (portInfo.role || 'port').padEnd(10);

        lines.push(`     ${roleDisplay} ${portInfo.port}  ${status} ${processInfo}`);
      }

      lines.push('');
    }
  }

  // Summary
  const totalPorts = Object.values(grouped).reduce((sum, workspace) => {
    return sum + Object.values(workspace).reduce((wsum, ports) => wsum + ports.length, 0);
  }, 0);

  const activePorts = Object.values(grouped).reduce((sum, workspace) => {
    return sum + Object.values(workspace).reduce((wsum, ports) => {
      return wsum + ports.filter(p => p.status === 'active').length;
    }, 0);
  }, 0);

  lines.push('Summary:');
  lines.push(`  Total allocated: ${totalPorts}`);
  lines.push(`  Active: ${activePorts}`);
  lines.push(`  Free: ${totalPorts - activePorts}`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Format compact port list
 * @param {Object} grouped - Grouped port data
 * @returns {string} Compact list
 */
export function formatCompact(grouped) {
  const lines = [];

  for (const [workspace, worktrees] of Object.entries(grouped)) {
    for (const [worktree, ports] of Object.entries(worktrees)) {
      for (const portInfo of ports) {
        const status = portInfo.status === 'active' ? '●' : '○';
        lines.push(`${status} ${portInfo.port} [${workspace}/${worktree}] ${portInfo.role}`);
      }
    }
  }

  return lines.join('\n');
}
