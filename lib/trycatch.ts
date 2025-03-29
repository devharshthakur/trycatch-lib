import { TryCatchError } from "../errors/TryCatchError.js";
import type {
  TryCatchResult,
  FailResult,
  SuccessResult,
} from "../types/result.types.js";

/**
 * Wraps a function (synchronous or asynchronous) and returns a new async
 * function that always resolves with a `TryCatchResult` tuple.
 * This eliminates the need for explicit try...catch blocks when calling
 * the wrapped function.
 *
 * - If the original function succeeds, the tuple is `[result, null]`.
 * - If the original function throws, the tuple is `[null, TryCatchError]`.
 *
 * @template TFunc The type of the function to wrap (sync or async).
 * @param fn The function to wrap.
 * @returns A new asynchronous function that takes the same parameters as `fn`
 *          and returns a Promise resolving to a `TryCatchResult` tuple.
 */
export function trycatch<TFunc extends (...args: any[]) => any>(fn: TFunc) {
  return async (
    ...args: Parameters<TFunc>
  ): Promise<TryCatchResult<Awaited<ReturnType<TFunc>>>> => {
    try {
      const functionExecutionResult = await fn(...args);

      const successResult: SuccessResult<Awaited<ReturnType<TFunc>>> = [
        functionExecutionResult,
        null,
      ];
      return successResult;
    } catch (error) {
      const trycatchError = new TryCatchError(error);
      const failResult: FailResult = [null, trycatchError];
      return failResult;
    }
  };
}
