/**
 * Converts a synchronous function into an asynchronous function.
 * Performs both compile-time and runtime checks to prevent wrapping already-async functions.
 *
 * @template TFunc The type of the synchronous function to convert.
 * @param fn The synchronous function to convert.
 * @returns Either an asynchronous function wrapping the original function,
 *          or a MakeAsyncError if the function is detected to be already asynchronous.
 */
import {
  isAsync,
  AsyncCheckResult,
  AsyncDetectionOptions,
  ConfidenceLevel,
} from "./isAsync.js";
import { MakeAsyncError } from "../errors/MakeAsyncError.js";

/**
 * Configuration options for makeAsync behavior
 */
export interface MakeAsyncOptions extends AsyncDetectionOptions {
  /**
   * When true, force conversion even if async detection is inconclusive
   * @default false - safer to reject ambiguous functions
   */
  forceConversion?: boolean;
}

/**
 * Converts a synchronous function to an asynchronous one.
 * Uses enhanced detection to ensure the input function is truly synchronous.
 */
export function makeAsync<TFunc extends (...args: unknown[]) => unknown>(
  fn: ReturnType<TFunc> extends Promise<unknown> ? never : TFunc,
  options: MakeAsyncOptions = {},
):
  | ((...args: Parameters<TFunc>) => Promise<ReturnType<TFunc>>)
  | MakeAsyncError {
  // Use our unified isAsync function with verbose output for detailed information
  const checkResult = isAsync(fn, {
    warn: true,
    verbose: true,
    ...options,
  }) as AsyncCheckResult;

  // Function is definitely or likely async - return error
  if (checkResult.isAsync && checkResult.confidence !== "uncertain") {
    const error = new MakeAsyncError(
      "Function appears to be already asynchronous. Cannot convert an async function to async.",
    );
    error.printError();
    return error;
  }

  // Function has uncertain detection
  if (checkResult.confidence === ("uncertain" as ConfidenceLevel)) {
    if (!options.forceConversion) {
      const error = new MakeAsyncError(
        "Could not conclusively determine if function is async or sync. Use { forceConversion: true } to override.",
      );
      error.printError();
      return error;
    }
    // Otherwise, proceed with conversion despite ambiguity
    console.warn(
      "[trycatch-lib] Forcing conversion of function with ambiguous async detection.",
    );
  }

  // Function is sync or we're forcing conversion - proceed with making it async
  return (...args: Parameters<TFunc>): Promise<ReturnType<TFunc>> =>
    Promise.resolve(fn(...args) as ReturnType<TFunc>);
}
