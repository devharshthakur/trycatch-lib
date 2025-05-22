/**
 * Converts a function to an asynchronous one.
 *
 * @template TFunc - Type of the function to convert
 * @param {Function} fn - The function to convert
 * @returns {Function} An asynchronous version of the input function
 */
export function makeAsync<TFunc extends (...args: unknown[]) => unknown>(
  fn: TFunc,
): (...args: Parameters<TFunc>) => Promise<Awaited<ReturnType<TFunc>>> {
  // Simply wrap the function in Promise.resolve
  return (...args: Parameters<TFunc>): Promise<Awaited<ReturnType<TFunc>>> =>
    Promise.resolve(fn(...args)) as Promise<Awaited<ReturnType<TFunc>>>;
}
