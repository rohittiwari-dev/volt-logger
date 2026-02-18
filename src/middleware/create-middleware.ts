import type { LogMiddleware } from "../core/types.js";

/**
 * Helper to create a type-safe middleware function.
 *
 * @example
 * const myMiddleware = createMiddleware((entry, next) => {
 *   entry.meta.foo = 'bar';
 *   next(entry);
 * });
 */
export function createMiddleware<TMeta = Record<string, unknown>>(
  fn: LogMiddleware<TMeta>,
): LogMiddleware<TMeta> {
  return fn;
}
