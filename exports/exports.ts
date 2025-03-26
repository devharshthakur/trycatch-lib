/**
 * Defines the public API exports for the trycatch-async-lib package.
 * This file is imported and re-exported by main.ts for the build process.
 */
export { trycatch } from "../lib/trycatch.js";
export { TryCatchError } from "../errors/TryCatchError.js";
export { isTryCatchError } from "../utils/isTryCatchError.js";
export type { TryCatchResult } from "../types/result.types.js";
export { trycatch as toasync } from "../lib/trycatch.js";
