/**
 * trycatch-lib
 *
 * A utility library that replaces try/catch blocks with clean tuple-based error handling.
 * This is the main entry point that exports the public API.
 */

export { trycatch } from "@/core/trycatch.js";
export { TryCatchError } from "@/errors/TryCatchError.js";
export { isTryCatchError } from "@/utils/isTryCatchError.js";

export type {
  TryCatchResult,
  SuccessResult,
  FailResult,
} from "@/types/result.types.js";
