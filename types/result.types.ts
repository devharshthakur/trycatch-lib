import type { TryCatchError } from "../errors/TryCatchError.js";

/**
 * Represents the result tuple returned by the `trycatch` function.
 * It contains either an error (TryCatchError) and null result,
 * or null error and a successful result.
 *
 * @template T The expected type of the successful result.
 */

export type TryCatchResult<T> = [TryCatchError | null, T | null];
