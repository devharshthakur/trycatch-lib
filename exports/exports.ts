/**
 * Defines the public API exports for the trycatch-async-lib package.
 * This file is imported and re-exported by main.ts for the build process.
 */
export { trycatch } from "../lib/trycatch.js";
export { TryCatchError } from "../errors/TryCatchError.js";
export { isTryCatchError } from "../utils/isTryCatchError.js";
export type {
  TryCatchResult,
  SuccessResult,
  FailResult,
} from "../types/result.types.js";
export { makeAsync } from "../lib/makeAsync.js";
export { isAsync, isAsyncRuntime } from "../lib/isAsync.js";
export type { IsAsyncFunction } from "../lib/isAsync.js";
