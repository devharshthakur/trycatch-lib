# 📖 API Reference

![API Documentation](https://img.shields.io/badge/API-Documentation-blue?style=for-the-badge)

_Complete reference for the trycatch-lib public API_

## 📑 Contents

- 🔄 [Core Functions](#core-functions)
- 🛡️ [Error Types](#error-types)
- 📋 [Type Definitions](#type-definitions)
- 🛠️ [Utilities](#utilities)

## 🧩 Core Functions

### 🔒 `trycatch(fn)`

**Description**

The main utility function that wraps any function to provide tuple-based error handling.

**Parameters**

- `fn`: The function to wrap (can be synchronous or asynchronous)

**Returns**

- A new function that returns a Promise resolving to a tuple:
  - On success: `[result, null]`
  - On error: `[null, TryCatchError]`

**Type Signature**

```typescript
function trycatch<TFunc extends (...args: any[]) => any>(
  fn: TFunc,
): (
  ...args: Parameters<TFunc>
) => Promise<[Awaited<ReturnType<TFunc>>, null] | [null, TryCatchError]>;
```

<details>
<summary><b>📝 Example Usage</b></summary>
<br>

```typescript
import { trycatch } from "trycatch-lib";

// Wrap a synchronous function
const safeJsonParse = trycatch(JSON.parse);

// Use the wrapped function
async function example() {
  const validJson = '{"name": "John"}';
  const invalidJson = "{name: John}";

  // Success case
  const [data1, error1] = await safeJsonParse(validJson);
  console.log(data1); // { name: "John" }
  console.log(error1); // null

  // Error case
  const [data2, error2] = await safeJsonParse(invalidJson);
  console.log(data2); // null
  console.log(error2?.message); // "Unexpected token n in JSON at position 1"
}
```

</details>

---

### ⚡ `makeAsync(fn)`

**Description**

Converts a function to an asynchronous one by wrapping its return value in a Promise.

**Parameters**

- `fn`: The function to convert

**Returns**

- An asynchronous version of the input function

> ⚠️ **Warning:** Only use with synchronous functions. Using it with functions that already return Promises will cause double-wrapping.

**Type Signature**

```typescript
function makeAsync<TFunc extends (...args: unknown[]) => unknown>(
  fn: TFunc,
): (...args: Parameters<TFunc>) => Promise<Awaited<ReturnType<TFunc>>>;
```

<details>
<summary><b>📝 Example Usage</b></summary>
<br>

```typescript
import { makeAsync } from "trycatch-lib";

// A synchronous function
function multiply(a: number, b: number): number {
  return a * b;
}

// Convert to async
const asyncMultiply = makeAsync(multiply);

// Use the async version
async function example() {
  const result = await asyncMultiply(5, 10);
  console.log(result); // 50
}
```

</details>

## 🔧 Error Types

### `TryCatchError`

**Description**

A specialized error class that provides enhanced error information.

**Properties**

- `name`: Always "TryCatchError"
- `message`: Error message
- `originalError`: The original error that was caught
- `timestamp`: When the error occurred (milliseconds since epoch)

**Methods**

- `isOriginalInstanceOf<T>()`: Check if original error is of a specific type
- `getOriginalProperty<K>()`: Get a property from the original error
- `getOriginalStack()`: Get the stack trace of the original error
- `toDetailedString()`: Get a formatted string representation
- `toJSON()`: Convert to a JSON-serializable object

**Static Methods**

- `fromJSON()`: Create a TryCatchError from a serialized object
- `isInstance()`: Type guard to check if an error is a TryCatchError

**Type Signature**

```typescript
class TryCatchError extends Error {
  readonly originalError: unknown;
  readonly timestamp: number;

  // Methods
  isOriginalInstanceOf<T>(errorClass: new (...args: any[]) => T): boolean;
  getOriginalProperty<K extends string>(key: K): unknown;
  getOriginalStack(): string | undefined;
  toDetailedString(): string;
  toJSON(): Record<string, unknown>;

  // Static methods
  static fromJSON(serialized: Record<string, unknown>): TryCatchError;
  static isInstance(error: unknown): error is TryCatchError;
}
```

<details>
<summary><b>📝 Example Usage</b></summary>
<br>

```typescript
import { trycatch } from "trycatch-lib";

async function example() {
  // Create a function that throws an error
  const throwingFn = () => {
    throw new TypeError("Example error");
  };

  // Wrap it with trycatch
  const safeFunction = trycatch(throwingFn);

  // Use it and examine the error
  const [result, error] = await safeFunction();

  if (error) {
    // Basic error information
    console.log(error.message); // "Example error"

    // Check the error type
    if (error.isOriginalInstanceOf(TypeError)) {
      console.log("It's a TypeError"); // Will print
    }

    // When the error occurred
    const errorTime = new Date(error.timestamp).toLocaleString();
    console.log(`Error occurred at: ${errorTime}`);

    // Get the stack trace
    console.log(error.getOriginalStack());
  }
}
```

</details>

## 📋 Type Definitions

### `TryCatchResult<T>`

**Description**

A type representing the result of a trycatch operation.

**Type Definition**

- `SuccessResult<T>`: `[T, null]` - Success case with result
- `FailResult`: `[null, TryCatchError]` - Failure case with error
- `TryCatchResult<T>`: Union of the two: `SuccessResult<T> | FailResult`

These types help TypeScript understand the tuple pattern and provide proper type safety.

**Type Signature**

```typescript
type SuccessResult<T> = [T, null];
type FailResult = [null, TryCatchError];
type TryCatchResult<T> = SuccessResult<T> | FailResult;
```

<details>
<summary><b>📝 Example Usage</b></summary>
<br>

```typescript
import { trycatch, TryCatchResult } from "trycatch-lib";

// Define a function that processes the result
function processResult<T>(
  result: TryCatchResult<T>,
  onError: (err: string) => void,
) {
  const [data, error] = result;

  if (error) {
    onError(error.message);
    return null;
  }

  // TypeScript knows data is of type T here
  return data;
}

// Use it
async function example() {
  const safeParse = trycatch(JSON.parse);
  const result = await safeParse('{"name": "John"}');

  // Process the result
  const data = processResult(result, (message) => {
    console.error("Error:", message);
  });

  console.log(data); // { name: "John" } or null if there was an error
}
```

</details>

## 🔍 Utilities

### `isTryCatchError(value)`

**Description**

Type guard to check if a value is a TryCatchError.

**Parameters**

- `value`: The value to check

**Returns**

- `true` if the value is a TryCatchError
- `false` otherwise

**Type Signature**

```typescript
function isTryCatchError(value: unknown): value is TryCatchError;
```

<details>
<summary><b>📝 Example Usage</b></summary>
<br>

```typescript
import { isTryCatchError } from "trycatch-lib";

function handleError(error: unknown) {
  if (isTryCatchError(error)) {
    // TypeScript knows this is a TryCatchError
    console.error("TryCatchError:", error.message);
    console.error("Original error:", error.originalError);
    return;
  }

  // Some other type of error
  console.error("Unknown error type:", error);
}
```

</details>

---

<div align="center">

[← Back to Docs](../README.md) | [Examples →](../examples/basic-usage.md)

</div>
