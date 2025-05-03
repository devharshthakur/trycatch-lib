import { TryCatchError } from "../errors/TryCatchError.js";

/**
 * Type guard to check if an error is an instance of TryCatchError.
 * @param error The value to check.
 * @returns True if the value is an instance of TryCatchError, false otherwise.
 */

export function isTryCatchError(error: unknown): boolean {
  const result: boolean = error instanceof TryCatchError;
  return result;
}
