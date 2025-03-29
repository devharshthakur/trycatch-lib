/**
 * Converts a synchronous function into an asynchronous function.
 * TypeScript will provide a compile-time error if an async function is passed.
 *
 * @template TFunc The type of the synchronous function to convert.
 * @param fn The synchronous function to convert.
 * @returns An asynchronous function wrapping the original function.
 */
export function makeAsync<TFunc extends (...args: any[]) => any>(
  fn: ReturnType<TFunc> extends Promise<any> ? never : TFunc,
): (...args: Parameters<TFunc>) => Promise<ReturnType<TFunc>> {
  return async (...args: Parameters<TFunc>): Promise<ReturnType<TFunc>> => {
    return fn(...args);
  };
}
