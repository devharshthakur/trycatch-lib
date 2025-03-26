# trycatch-lib

[![npm version](https://img.shields.io/npm/v/trycatch-lib.svg?style=flat)](https://www.npmjs.com/package/trycatch-lib) <!-- Replace with your actual npm link if published -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) <!-- Ensure you have an MIT LICENSE file -->

<!-- Optional: Add build status, coverage badges etc. -->

A lightweight, zero-dependency TypeScript utility to simplify error handling for synchronous and asynchronous operations by replacing `try...catch` blocks with a consistent `[error, result]` tuple pattern.

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

This library provides a `trycatch` wrapper function to streamline this pattern, making your code cleaner and more predictable.

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

The core idea is to wrap any function (synchronous or asynchronous) that might throw an error with the `trycatch` utility. The wrapped function becomes asynchronous (if it wasn't already) and _always_ resolves with a tuple `[error, result]`.

### Basic Example with Async Function

```typescript
import { trycatch, isTryCatchError, TryCatchError } from "trycatch-lib";

// 1. Define your potentially failing async function
async function getUserData(
  userId: number,
): Promise<{ id: number; name: string }> {
  if (userId <= 0) {
    throw new Error("Invalid user ID");
  }
  // Simulate API call
  await new Promise((res) => setTimeout(res, 100));
  if (userId === 99) {
    throw { code: "NOT_FOUND", message: "User 99 does not exist" }; // Simulate non-Error throw
  }
  return { id: userId, name: `User ${userId}` };
}

// 2. Wrap the function
const safeGetUser = trycatch(getUserData);

// 3. Call the wrapped function and handle the tuple result
async function displayUser(id: number) {
  console.log(`Attempting to get user ${id}...`);

  // safeGetUser always resolves, no try/catch needed here!
  const [error, user] = await safeGetUser(id);

  // 4. Check for errors
  if (error) {
    // 'error' is guaranteed to be an instance of TryCatchError
    console.error(`Failed to get user ${id}: ${error.message}`);

    // You can inspect the original error that was thrown
    console.error("Original error:", error.originalError);

    // Use the type guard for extra safety if needed (though error is always TryCatchError here)
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
    return; // Stop execution for this user if needed
  }

  // 5. Handle success - 'user' has the resolved value
  // Note: 'user' type is { id: number; name: string } | null
  if (user) {
    console.log(`Successfully retrieved user: ${user.name} (ID: ${user.id})`);
    // Update UI with user data
  } else {
    // This case might happen if the original function resolved with null/undefined
    console.log(`User ${id} data resolved to null/undefined.`);
  }
}

// Run examples
(async () => {
  await displayUser(123); // Success case
  await displayUser(0); // Failure case (Error thrown)
  await displayUser(99); // Failure case (Object thrown)
})();
```

### Example with Synchronous Function

`trycatch` also works with synchronous functions, converting them to return a Promise resolving with the tuple.

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
  const [error, data] = await safeParseJson(input);

  if (error) {
    console.error(`Parsing failed: ${error.message}`);
    console.error("Original error:", error.originalError);
  } else {
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

## API Reference

### `trycatch(fn)`

Wraps a function (synchronous or asynchronous) to provide tuple-based error handling.

```typescript
function trycatch<TFunc extends (...args: any[]) => any>(
  fn: TFunc,
): (
  ...args: Parameters<TFunc>
) => Promise<TryCatchResultTuple<Awaited<ReturnType<TFunc>>>>;
```

- **`fn`**: The function to wrap. Can be synchronous (`() => Result`) or asynchronous (`async () => Result` or `() => Promise<Result>`).
- **Returns**: A new **asynchronous** function that accepts the same parameters as `fn`. This new function **always resolves** (never rejects) with a `Promise` of `TryCatchResultTuple`.

### `TryCatchResultTuple<T>`

The type alias for the tuple returned by the wrapped function's promise.

```typescript
type TryCatchResultTuple<T> = [TryCatchError | null, T | null];
```

- If the original function `fn` executed successfully, the tuple is `[null, result]`, where `result` is the value returned or resolved by `fn` (type `T`).
- If the original function `fn` threw an error or rejected its promise, the tuple is `[TryCatchError, null]`.

### `TryCatchError`

A custom error class that wraps the original error caught from the wrapped function. It extends the built-in `Error` class.

**Properties:**

- **`name`**: `string` (Always `"TryCatchError"`)
- **`message`**: `string` (Inherited from `Error`. Defaults to the original error's message if it was an `Error`, otherwise a generic message.)
- **`stack`**: `string | undefined` (Inherited from `Error`. Attempts to preserve the original stack trace.)
- **`originalError`**: `unknown` (This holds the actual value that was caught (thrown error or rejection reason). **Crucial for inspecting the root cause.**)
- **`timestamp`**: `number` (A `Date.now()` timestamp indicating when the error was caught by the wrapper.)

### `isTryCatchError(error: unknown)`

A TypeScript type guard function to safely check if a caught value is an instance of `TryCatchError`.

```typescript
function isTryCatchError(error: unknown): error is TryCatchError;
```

- **`error`**: The value to check.
- **Returns**: `true` if `error` is an instance of `TryCatchError`, `false` otherwise. Useful within `catch` blocks if you're mixing `trycatch-lib` with standard `try...catch`.

### `toasync(fn)`

An alias for the `trycatch` function. It behaves identically.

```typescript
export { trycatch as toasync };
```

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
