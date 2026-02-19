/**
 * @module voltlog-io
 * @description Helper to create custom transports easily.
 * @universal Works in all environments.
 */

import type { LogEntry, Transport } from "../core/types.js";

/**
 * Helper to build a transport without manually defining the object structure.
 *
 * @example
 * const myTransport = createTransport('my-api', async (entry) => {
 *   await fetch('https://api.example.com/logs', { body: JSON.stringify(entry) });
 * });
 *
 * @param name - Unique name for the transport
 * @param write - Function to process log entries
 * @param options - Optional overrides (level, flush, close)
 */
export function createTransport(
  name: string,
  write: (entry: LogEntry) => void | Promise<void>,
  options: Partial<Omit<Transport, "name" | "write">> = {},
): Transport {
  return {
    name,
    write,
    ...options,
  };
}
