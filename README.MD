# trycatch-lib

<div align="center">

[![npm version](https://img.shields.io/npm/v/trycatch-lib.svg?style=flat)](https://www.npmjs.com/package/trycatch-lib)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)](https://www.typescriptlang.org/)
[![Dependencies](https://img.shields.io/badge/dependencies-2-brightgreen)](package.json)

**Error handling, simplified.**

A modern TypeScript utility that replaces chaotic try/catch blocks with clean, predictable `[result, error]` tuples.

</div>

<hr>

## 🚀 Quick Start

```bash
npm install trycatch-lib
# or
yarn add trycatch-lib
# or
pnpm add trycatch-lib
```

```typescript
import { trycatch } from "trycatch-lib";

// Wrap any function that might throw
const safeJsonParse = trycatch(JSON.parse);

// Use the wrapped function - no try/catch needed!
async function process(input: string) {
  const [data, error] = await safeJsonParse(input);

  if (error) {
    console.log("Invalid JSON:", error.message);
    return;
  }

  // Use data safely here
  console.log("Parsed data:", data);
}
```

<hr>

## 📌 Why This Library?

<table>
<tr>
<th>Before: Traditional Error Handling</th>
<th>After: With trycatch-lib</th>
</tr>
<tr>
<td>

```typescript
async function fetchUser(id: string) {
  try {
    const response = await fetch(`/api/users/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null; // What should we return?
  }
}

// Usage is awkward
const user = await fetchUser("123");
if (user) {
  // Use user data
} else {
  // Was there an error? What happened?
}
```

</td>
<td>

```typescript
// Original function without error handling
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

// Wrap with trycatch
const safeFetchUser = trycatch(fetchUser);

// Clear, predictable usage
const [user, error] = await safeFetchUser("123");

if (error) {
  console.error("Failed:", error.message);
  // Detailed error info available
  console.error("Original:", error.originalError);
} else {
  // user is guaranteed to have data
}
```

</td>
</tr>
</table>

<hr>

## ✨ Key Features

- 🎯 **Always returns `[result, error]` tuples** - no more try/catch blocks
- 🔄 **Works with both sync and async functions** - same pattern everywhere
- 🧠 **Type-safe** - full TypeScript support with proper types
- 🔍 **Enhanced error details** - access to original errors and timestamps
- 🛠️ **Utilities for async detection** - safely identify async functions
- 👓 **Beautiful error messages** - colorful console output with chalk and signale

<hr>

## 📚 Core API

### `trycatch(fn)`

The main utility - wraps any function (sync or async) with proper error handling.

```typescript
function multiply(a: number, b: number): number {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new TypeError("Both arguments must be numbers");
  }
  return a * b;
}

// Wrap with trycatch
const safeMultiply = trycatch(multiply);

// Use safely with tuple pattern
async function calculate() {
  // No try/catch needed - always returns a tuple
  const [result, error] = await safeMultiply(5, "abc" as any);

  if (error) {
    // error is a TryCatchError with helpful properties
    console.log(`Calculation failed: ${error.message}`);
    console.log(`At: ${new Date(error.timestamp).toLocaleString()}`);
    return null;
  }

  return result; // 100% type-safe, only exists if no error
}
```

### `TryCatchError`

Enhanced error class with additional context.

```typescript
class TryCatchError extends Error {
  // Original error that was caught (can be any type)
  originalError: unknown;

  // Timestamp when the error was caught
  timestamp: number;

  // Check if the original error is an instance of a specific error class
  isOriginalInstanceOf<T extends Error>(
    errorClass: new (...args: any[]) => T,
  ): boolean;

  // Safely get a property from the original error if it exists
  getOriginalProperty<K extends string>(key: K): unknown;

  // Get stack trace from original error if available
  getOriginalStack(): string | undefined;

  // Format the error with detailed information for logging
  toDetailedString(): string;

  // Format the error as a JSON-serializable object
  toJSON(): Record<string, unknown>;

  // Print a formatted error message with color to the console
  print(): void;

  // Create a TryCatchError from a serialized object
  static fromJSON(serialized: Record<string, unknown>): TryCatchError;

  // Type guard to check if a value is a TryCatchError
  static isInstance(error: unknown): error is TryCatchError;
}
```

<hr>

## 🛠️ Utilities

### `isAsync` - Detect async functions

Reliably determine if a function is asynchronous:

```typescript
import { isAsync } from "trycatch-lib";

// Simple detection (returns boolean)
const regularFn = () => 42;
const asyncFn = async () => 42;

isAsync(regularFn); // false
isAsync(asyncFn); // true

// Detailed detection
const result = isAsync(myFunction, { verbose: true });
if (result.isAsync) {
  console.log(`Async with ${result.confidence} confidence`);
  console.log(`Detected via: ${result.details.detectionMethod.join(", ")}`);
}
```

### `makeAsync` - Convert sync functions to async

Safely convert a synchronous function to an asynchronous one:

```typescript
import { makeAsync } from "trycatch-lib";

// Original sync function
function calculateTotal(items: number[]): number {
  return items.reduce((sum, item) => sum + item, 0);
}

// Convert to async
const asyncCalculateTotal = makeAsync(calculateTotal);

// Check if conversion was successful
if (asyncCalculateTotal instanceof MakeAsyncError) {
  // Provides colorful error output with chalk and signale
  asyncCalculateTotal.printError();
  console.error("Conversion failed:", asyncCalculateTotal.message);
} else {
  // Now works with async/await
  const total = await asyncCalculateTotal([1, 2, 3, 4, 5]);
  console.log(total); // 15
}
```

<hr>

## 📋 API Reference

### `trycatch<TFunc>(fn: TFunc)`

Wraps a function (sync or async) to provide tuple-based error handling.

**Parameters:**

- `fn`: The function to wrap (sync or async)

**Returns:**

- A new async function that returns `[result, error]` tuple

**Type:**

```typescript
// SuccessResult<T> is [T, null]
// FailResult is [null, TryCatchError]
// TryCatchResult<T> is SuccessResult<T> | FailResult

function trycatch<TFunc extends (...args: unknown[]) => unknown>(
  fn: TFunc,
): (
  ...args: Parameters<TFunc>
) => Promise<TryCatchResult<Awaited<ReturnType<TFunc>>>>;
```

### `TryCatchError`

Custom error class that provides enhanced error information.

**Properties:**

- `name`: Always `"TryCatchError"`
- `message`: Error message (from original error if available)
- `originalError`: The actual error that was caught
- `timestamp`: When the error occurred (milliseconds since epoch)

**Methods:**

- `isOriginalInstanceOf<T>()`: Check if original error is of a specific type
- `getOriginalProperty()`: Safely access original error properties
- `getOriginalStack()`: Get stack trace from original error
- `toDetailedString()`: Get a string with all error details
- `toJSON()`: Convert to JSON-serializable object
- `print()`: Display a colorful formatted error message with chalk
- `static fromJSON()`: Create a TryCatchError from serialized data
- `static isInstance()`: Type guard for TryCatchError

### `isAsync(fn, options?)`

Detect if a function is asynchronous.

**Parameters:**

- `fn`: The function to check
- `options`: Configuration options
  - `verbose`: Return detailed information instead of boolean
  - `warn`: Print warnings for uncertain detection
  - `uncertaintyMode`: How to handle uncertain results

**Returns:**

- Boolean by default, or detailed `AsyncCheckResult` if verbose option is true

### `makeAsync(fn, options?)`

Convert a synchronous function to an asynchronous one.

**Parameters:**

- `fn`: The sync function to convert
- `options`: Configuration options
  - `forceConversion`: Force conversion even if async detection is uncertain

**Returns:**

- An async function, or `MakeAsyncError` if fn is already async

### `MakeAsyncError`

Error returned when makeAsync fails to convert a function.

**Properties:**

- `name`: Always `"MakeAsyncError"`
- `message`: Explanation of why conversion failed

**Methods:**

- `printError()`: Displays a colorful error message with chalk and signale
- `toString()`: Returns a string representation of the error

<hr>

## 🔌 Dependencies

This library has two lightweight dependencies:

- `chalk`: For colorful terminal output in error messages
- `signale`: For structured logging with badges in error reporting

<hr>

## 🤔 Common Questions

<details>
<summary><b>Why use [result, error] tuples instead of try/catch?</b></summary>
<p>
Using tuples creates a consistent pattern for error handling that:

1. Makes errors explicit in your code's flow
2. Avoids mixing error handling with business logic
3. Provides a uniform approach for both sync and async functions
4. Eliminates the need to decide what to return on error
5. Gives you detailed error information by default
</p>
</details>

<details>
<summary><b>How does this differ from Result/Either types in functional programming?</b></summary>
<p>
While similar in concept, this library:

1. Uses native JavaScript tuples for simplicity
2. Automatically handles both sync and async functions
3. Provides enhanced error details without additional wrappers
4. Doesn't require learning functional programming concepts
</p>
</details>

<details>
<summary><b>Is there a performance impact?</b></summary>
<p>
The performance overhead is minimal:

1. For sync functions: Just the cost of an async wrapper and try/catch
2. For async functions: Only the cost of the try/catch (already using promises)

The benefits of cleaner code and consistent error handling typically outweigh this small overhead.

</p>
</details>

<hr>

## 📄 License

[MIT](./LICENSE)

<hr>
