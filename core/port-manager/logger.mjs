/**
 * Port Manager Logger - Gosiki OS
 *
 * Unified logging format for both human and AI agents
 *
 * @module core/port-manager/logger
 */

/**
 * Format output based on mode (human or JSON)
 * @param {Object} data - Log data
 * @param {boolean} jsonMode - Whether to output JSON
 * @returns {string} Formatted output
 */
export function formatOutput(data, jsonMode = false) {
  if (jsonMode) {
    return JSON.stringify(data, null, 2);
  }

  // Human-readable format
  return formatHuman(data);
}

/**
 * Format human-readable output
 * @private
 * @param {Object} data - Log data
 * @returns {string} Human-readable message
 */
function formatHuman(data) {
  const { status, port, process, message, reason } = data;

  switch (status) {
    case 'occupied':
      return `Gosiki OS: Port ${port} is currently occupied.
Process: ${process.name} (PID: ${process.pid})
No action was taken.`;

    case 'terminated':
      return `Gosiki OS: Port ${port} was occupied by PID ${process.pid}.
Gosiki OS has safely terminated the process.
PortShot was prevented.`;

    case 'reserved':
      if (data.wasOccupied && data.killed) {
        return `Gosiki OS: Port ${port} was occupied by ${data.occupier.processName} (PID: ${data.occupier.pid}).
Gosiki OS has safely terminated the process.
Port ${port} is now reserved for this workspace.
PortShot was prevented.`;
      }
      return `Gosiki OS: Port ${port} is now reserved for this workspace.`;

    case 'allocated':
      return `Gosiki OS: Allocated port ${port}.`;

    case 'blocked':
      if (reason === 'reserved-by-another') {
        return `Gosiki OS: Port ${port} is reserved by another workspace.
Your request was blocked to prevent PortShot.`;
      }
      return `Gosiki OS: Port ${port} is not available.
Your request was blocked to prevent PortShot.`;

    case 'released':
      return `Gosiki OS: Port ${port} has been released.`;

    case 'not-in-use':
      return `Gosiki OS: Port ${port} is not currently in use.`;

    case 'list': {
      if (!data.allocations || data.allocations.length === 0) {
        return `Gosiki OS: No ports are currently allocated.`;
      }
      const portList = data.allocations
        .map(a => `  Port ${a.port} (allocated at ${a.allocatedAt})`)
        .join('\n');
      return `Gosiki OS: Currently allocated ports:\n${portList}`;
    }

    case 'cleanup':
      return `Gosiki OS: All port allocations have been cleared.`;

    case 'in-use':
      return `Gosiki OS: Port ${port} is currently in use.`;

    case 'error':
      return `Gosiki OS: Error - ${message}`;

    default:
      return message || JSON.stringify(data);
  }
}

/**
 * Create log data for occupied port
 * @param {number} port - Port number
 * @param {Object} process - Process info { pid, processName }
 * @returns {Object} Log data
 */
export function logOccupied(port, process) {
  return {
    status: 'occupied',
    port,
    process: {
      pid: process.pid,
      name: process.processName
    },
    message: 'Port is occupied. No action taken.'
  };
}

/**
 * Create log data for terminated process
 * @param {number} port - Port number
 * @param {Object} process - Process info { pid, processName }
 * @returns {Object} Log data
 */
export function logTerminated(port, process) {
  return {
    status: 'terminated',
    port,
    action: 'kill',
    process: {
      pid: process.pid,
      name: process.processName
    },
    message: 'Process terminated. PortShot prevented.'
  };
}

/**
 * Create log data for reserved port
 * @param {number} port - Port number
 * @param {Object} [options] - Additional data
 * @returns {Object} Log data
 */
export function logReserved(port, options = {}) {
  const data = {
    status: 'reserved',
    port,
    message: 'Port successfully reserved.'
  };

  if (options.wasOccupied) {
    data.wasOccupied = true;
    data.killed = options.killed;
    data.occupier = options.occupier;
  }

  return data;
}

/**
 * Create log data for allocated port
 * @param {number} port - Port number
 * @returns {Object} Log data
 */
export function logAllocated(port) {
  return {
    status: 'allocated',
    port,
    message: 'Port allocated automatically.'
  };
}

/**
 * Create log data for blocked request
 * @param {number} port - Port number
 * @param {string} reason - Reason for blocking
 * @returns {Object} Log data
 */
export function logBlocked(port, reason = 'port-not-available') {
  return {
    status: 'blocked',
    port,
    reason,
    message: 'Request blocked. PortShot prevented.'
  };
}

/**
 * Create log data for released port
 * @param {number} port - Port number
 * @returns {Object} Log data
 */
export function logReleased(port) {
  return {
    status: 'released',
    port,
    message: 'Port successfully released.'
  };
}

/**
 * Create log data for port not in use
 * @param {number} port - Port number
 * @returns {Object} Log data
 */
export function logNotInUse(port) {
  return {
    status: 'not-in-use',
    port,
    message: 'Port is not currently in use.'
  };
}

/**
 * Create log data for error
 * @param {string} message - Error message
 * @param {Object} [details] - Additional error details
 * @returns {Object} Log data
 */
export function logError(message, details = {}) {
  return {
    status: 'error',
    message,
    ...details
  };
}
