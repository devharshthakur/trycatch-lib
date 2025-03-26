import { TryCatchError } from "../errors/TryCatchError.js";
import type { TryCatchResult } from "../types/result.types.js";

/**
 * Wraps a function (synchronous or asynchronous) and returns a new async
 * function that always resolves with a tuple `[error, result]`.
 * This eliminates the need for explicit try...catch blocks when calling
 * the wrapped function.
 *
 * - If the original function succeeds, the tuple is `[null, result]`.
 * - If the original function throws, the tuple is `[TryCatchError, null]`.
 *
 * @template TFunc The type of the function to wrap (sync or async).
 * @param fn The function to wrap.
 * @returns A new asynchronous function that takes the same parameters as `fn`
 *          and returns a Promise resolving to a `TryCatchResultTuple`.
 */
export function trycatch<TFunc extends (...args: any[]) => any>(fn: TFunc) {
  return async (
    ...args: Parameters<TFunc>
  ): Promise<TryCatchResult<Awaited<ReturnType<TFunc>>>> => {
    try {
      // Await works for both promises and non-promise values
      const result = await fn(...args);
      return [null, result];
    } catch (error) {
      return [new TryCatchError(error), null];
    }
  };
}
