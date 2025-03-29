import type { TryCatchError } from "../errors/TryCatchError.js";

/**
 * Represents the result tuple returned by the `trycatch` function.
 * It contains either a successful value and null error,
 * or null value and an error (TryCatchError).
 *
 * @template T The expected type of the successful value.
 */

// Need to define SuccessResult type
export type SuccessResult<T> = [T, null];

export type FailResult = [null, TryCatchError]; // Here result = null
export type TryCatchResult<T> = SuccessResult<T> | FailResult;
