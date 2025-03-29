/**
 * Type-level utility to determine if a function is asynchronous.
 * This is a compile-time check that examines the return type of the function.
 *
 * @template TFunc The function type to check
 */
export type IsAsyncFunction<TFunc extends (...args: any[]) => any> =
  ReturnType<TFunc> extends Promise<any> ? true : false;

/**
/**
 * Runtime check to determine if a function is asynchronous. **Use with caution.**
 * This uses the function's constructor name, which is generally reliable
 * but can be affected by minification or transpilation.
 *
 *
 * @param fn The function to check
 * @returns true if the function is asynchronous, false otherwise
 */
export function isAsyncRuntime(fn: Function): boolean {
  return fn.constructor.name === "AsyncFunction";
}

/**
 * Type-safe wrapper for isAsyncRuntime that provides both runtime checking
 * and compile-time typing. The return type is determined by TypeScript's
 * analysis of the function's return type.
 *
 * Note: The runtime check and compile-time types may not always agree due
 * to transpilation, bundling, or other transformations.
 *
 * @example
 * ```typescript
 * // Type checking will know these results at compile time:
 * const a = isAsync(async () => {}); // a is typed as 'true'
 * const b = isAsync(() => {}); // b is typed as 'false'
 * ```
 *
 * @template TFunc The function type to check
 * @param fn The function to check
 * @returns The result of isAsyncRuntime, typed based on TFunc's return type
 */
export function isAsync<TFunc extends (...args: any[]) => any>(
  fn: TFunc,
): IsAsyncFunction<TFunc> {
  /**
   * This cast tells TypeScript to use the compile-time type,
   * while the actual runtime value comes from isAsyncRuntime.
   */
  return isAsyncRuntime(fn) as IsAsyncFunction<TFunc>;
}
