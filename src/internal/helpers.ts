/**
 * Internal helper functions for trycatch-lib.
 * These functions are not part of the public API and should not be used directly by consumers.
 */

/**
 * Checks if a value is a Promise-like object
 * 
 * @param value - The value to check
 * @returns True if the value is Promise-like (has a then method)
 */
export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof (value as any).then === "function"
  );
}

/**
 * Safe JSON stringify that handles circular references and other non-serializable values
 * 
 * @param value - The value to stringify
 * @returns A string representation of the value
 */
export function safeStringify(value: unknown): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(value, (key, val) => {
      // Handle circular references
      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) {
          return "[Circular Reference]";
        }
        seen.add(val);
      }
      
      // Handle functions
      if (typeof val === "function") {
        return `[Function: ${val.name || "anonymous"}]`;
      }
      
      // Handle symbols
      if (typeof val === "symbol") {
        return val.toString();
      }
      
      return val;
    }, 2);
  } catch (error) {
    return String(value);
  }
}

/**
 * Safely retrieves a property from an object, handling cases where
 * the object might be null, undefined, or not have the property
 * 
 * @param obj - The object to get a property from
 * @param prop - The property name to get
 * @returns The property value or undefined if not available
 */
export function safeGet<T = unknown>(
  obj: unknown,
  prop: string
): T | undefined {
  if (obj === null || obj === undefined) {
    return undefined;
  }
  
  try {
    return (obj as any)[prop] as T;
  } catch {
    return undefined;
  }
} 