# trycatch-lib

[![npm version](https://img.shields.io/npm/v/trycatch-lib.svg?style=flat)](https://www.npmjs.com/package/trycatch-lib) <!-- Replace with your actual npm link if published -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) <!-- Ensure you have an MIT LICENSE file -->

<!-- Optional: Add build status, coverage badges etc. -->

A lightweight, zero-dependency TypeScript utility to simplify error handling for synchronous and asynchronous operations by replacing `try...catch` blocks with a consistent `[result, error]` tuple pattern.

## The Problem

Handling errors in JavaScript/TypeScript, especially with asynchronous operations, often involves writing repetitive `try...catch` blocks:

```typescript
async function fetchData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    // Handle the error, maybe return null or re-throw
    return null;
  }
}

async function process() {
  const data = await fetchData("/api/data");
  if (data) {
    // Use data
  } else {
    // Handle the case where data fetching failed
  }
}
```

This library provides a `trycatch` wrapper function to streamline this pattern, making your code cleaner and more predictable. It also provides a `makeAsync` utility (with caveats) to convert sync functions to async.

## Installation

Using pnpm (recommended):

```bash
pnpm add trycatch-lib
```

Using npm:

```bash
npm install trycatch-lib
```

Using yarn:

```bash
yarn add trycatch-lib
```

## Usage

### `trycatch` Wrapper

Wrap any function (sync or async) that might throw with `trycatch`. The wrapped function becomes async (if not already) and _always_ resolves with a tuple `[result, error]`.

```typescript
import { trycatch, isTryCatchError, TryCatchError } from "trycatch-lib";

// 1. Use an existing async function (e.g., fetch)
async function getJson(url: string): Promise<any> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

// 2. Wrap the function
const safeGetJson = trycatch(getJson);

// 3. Call the wrapped function and handle the tuple result
async function displayData(url: string) {
  console.log(`Attempting to fetch data from ${url}...`);

  // safeGetJson always resolves, no try/catch needed here!
  // Tuple is now [result, error]
  const [data, error] = await safeGetJson(url);

  // 4. Check for errors (error is the second element)
  if (error) {
    // 'error' is guaranteed to be an instance of TryCatchError
    console.error(`Failed to fetch data: ${error.message}`);

    // You can inspect the original error that was thrown
    console.error("Original error:", error.originalError);

    // Use the type guard for extra safety if needed
    if (isTryCatchError(error)) {
      // Access properties like timestamp or originalError safely
      console.error(
        `Error occurred at: ${new Date(error.timestamp).toISOString()}`,
      );
      if (error.originalError instanceof Error) {
        console.error("Original stack:", error.originalError.stack);
      }
    }
    // Update UI, log error, etc.
    return; // Stop execution for this URL if needed
  }

  // 5. Handle success - 'data' (first element) has the resolved value
  if (data) {
    console.log("Successfully retrieved data:", data);
    // Update UI with data
  } else {
    console.log("Data resolved to null/undefined successfully.");
  }
}

// Run examples (replace with actual URLs)
(async () => {
  await displayData("https://rickandmortyapi.com/api/character"); // Success case
  await displayData("/api/nonexistent"); // Failure case (404)
  await displayData("invalid-url"); // Failure case (invalid URL)
})();
```

### Example with Synchronous Function using `trycatch`

`trycatch` works the same way, wrapping the sync function and returning a Promise resolving to `[result, error]`.

```typescript
import { trycatch } from "trycatch-lib";

// 1. Define a sync function that might throw
function parseJson(jsonString: string): object {
  if (!jsonString) {
    throw new Error("Input string cannot be empty");
  }
  return JSON.parse(jsonString); // This can throw JSON.parse error
}

// 2. Wrap the function
const safeParseJson = trycatch(parseJson);

// 3. Call the wrapped function (it now returns a Promise)
async function processJson(input: string) {
  console.log(`Parsing: "${input}"`);
  const [data, error] = await safeParseJson(input); // Tuple: [result, error]

  if (error) {
    console.error(`Parsing failed: ${error.message}`);
    console.error("Original error:", error.originalError);
  } else {
    // 'data' is the parsed object (or null if original resolved null)
    console.log("Parsing successful:", data);
  }
}

// Run examples
(async () => {
  await processJson('{"valid": true}'); // Success
  await processJson(""); // Failure (custom error)
  await processJson('{"invalid"}'); // Failure (JSON.parse error)
})();
```

### `makeAsync` Utility (Use with Caution)

Converts a _synchronous_ function into an _asynchronous_ function. It attempts a runtime check to prevent wrapping already-async functions, returning a `MakeAsyncError` in that case. **Warning:** This runtime check (`fn.constructor.name`) is known to be unreliable in some JavaScript environments (e.g., after transpilation/bundling). Prefer compile-time checks or refactoring if possible.

```typescript
import { makeAsync, MakeAsyncError } from "trycatch-lib";

// 1. Define a synchronous function
function synchronousDouble(x: number): number {
  console.log("Running synchronousDouble...");
  if (typeof x !== "number") throw new TypeError("Input must be a number");
  return x * 2;
}

// 2. Use makeAsync
const asyncDouble = makeAsync(synchronousDouble);

// 3. Check if makeAsync returned an error or the async function
if (asyncDouble instanceof MakeAsyncError) {
  console.error("Failed to make function async:", asyncDouble.message);
} else {
  // 4. Call the new async function
  async function runCalculation() {
    console.log("Calling asyncDouble(5)...");
    const result = await asyncDouble(5); // No try-catch needed for makeAsync itself
    console.log("Result:", result); // Output: Result: 10

    try {
      console.log("Calling asyncDouble('abc')...");
      await asyncDouble("abc" as any); // Still throws if original sync function throws
    } catch (e) {
      console.error("Caught error from asyncDouble:", e); // Catches the TypeError
    }
  }
  runCalculation();
}

// Example with an async function (makeAsync should return MakeAsyncError)
async function alreadyAsync(y: number): Promise<number> {
  return y;
}
const result = makeAsync(alreadyAsync);
if (result instanceof MakeAsyncError) {
  console.log("Correctly identified async function:", result.message);
} else {
  console.error("Error: makeAsync did not detect the async function!");
}
```

## API Reference

### `trycatch(fn)`

Wraps a function (synchronous or asynchronous) to provide tuple-based error handling.

```typescript
function trycatch<TFunc extends (...args: any[]) => any>(
  fn: TFunc,
): (
  ...args: Parameters<TFunc>
) => Promise<TryCatchResult<Awaited<ReturnType<TFunc>>>>;
```

- **`fn`**: The function to wrap. Can be synchronous (`() => Result`) or asynchronous (`async () => Result` or `() => Promise<Result>`).
- **Returns**: A new **asynchronous** function that accepts the same parameters as `fn`. This new function **always resolves** (never rejects) with a `Promise` of `TryCatchResult`.

### `TryCatchResult<T>`

The type alias for the tuple returned by the wrapped function's promise.

```typescript
type SuccessResult<T> = [T, null];
type FailResult = [null, TryCatchError];
type TryCatchResult<T> = SuccessResult<T> | FailResult;
```

- If the original function `fn` executed successfully, the tuple is `[result, null]`, where `result` is the value returned or resolved by `fn` (type `T`).
- If the original function `fn` threw an error or rejected its promise, the tuple is `[null, TryCatchError]`.

### `TryCatchError`

A custom error class that wraps the original error caught from the wrapped function. It extends the built-in `Error` class.

**Properties:**

- **`name`**: `string` (Always `"TryCatchError"`)
- **`message`**: `string` (Inherited from `Error`. Defaults to the original error's message if it was an `Error`, otherwise a generic message.)
- **`stack`**: `string | undefined` (Inherited from `Error`. Attempts to preserve the original stack trace.)
- **`originalError`**: `unknown` (This holds the actual value that was caught (thrown error or rejection reason). **Crucial for inspecting the root cause.**)
- **`timestamp`**: `number` (A `Date.now()` timestamp indicating when the error was caught by the wrapper.)

### `isTryCatchError(error: unknown)`

A TypeScript type guard function to safely check if a caught value is an instance of `TryCatchError`. Useful when dealing with the second element of the `TryCatchResult` tuple.

```typescript
function isTryCatchError(error: unknown): error is TryCatchError;
```

- **`error`**: The value to check.
- **Returns**: `true` if `error` is an instance of `TryCatchError`, `false` otherwise.

### `makeAsync(fn)`

**(Use with Caution due to unreliable runtime async check)**

Attempts to convert a strictly synchronous function to an asynchronous one.

```typescript
function makeAsync<TFunc extends (...args: any[]) => any>(
  fn: TFunc,
):
  | ((...args: Parameters<TFunc>) => Promise<ReturnType<TFunc>>)
  | MakeAsyncError;
```

- **`fn`**: The synchronous function to convert.
- **Returns**: Either:
  - An `async` function that takes the same parameters as `fn` and returns `Promise<ReturnType<TFunc>>`.
  - An instance of `MakeAsyncError` if the runtime check detects `fn` might already be asynchronous.
- **Note**: This function itself does not throw; you must check the return type to see if you received the async function or the `MakeAsyncError`.

### `MakeAsyncError`

A custom error class returned by `makeAsync` when it detects a potentially asynchronous input function. Extends `Error`.

**Properties:**

- **`name`**: `string` (Always `"MakeAsyncError"`)
- **`message`**: `string` (Indicates why the conversion wasn't performed).

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests. If you'd like to contribute code, please consider:

1.  Forking the repository.
2.  Creating a new branch for your feature or fix.
3.  Running `pnpm install` to install dependencies.
4.  Making your changes.
5.  Running `pnpm build` to ensure the code compiles.
6.  (If tests are added later: Running `pnpm test` to ensure tests pass).
7.  Submitting a pull request.

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
