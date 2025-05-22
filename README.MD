# trycatch-lib

<div>

[![npm version](https://img.shields.io/npm/v/trycatch-lib.svg?style=flat)](https://www.npmjs.com/package/trycatch-lib)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)](https://www.typescriptlang.org/)
[![Dependencies](https://img.shields.io/badge/dependencies-2-brightgreen)](package.json)

**Error handling, simplified.**

Replace chaotic try/catch blocks with clean, predictable `[result, error]` tuples.

</div>

## 📦 Installation

```bash
# Using npm
npm install trycatch-lib

# Using yarn
yarn add trycatch-lib

# Using pnpm
pnpm add trycatch-lib
```

## 🚀 Quick Example

**Before:** Traditional error handling with try/catch

```typescript
// Traditional try/catch approach
function parseUserData(input: string) {
  try {
    const data = JSON.parse(input);
    return data;
  } catch (error) {
    console.error("Failed to parse:", error);
    return null; // Ambiguous return value
  }
}

// Usage requires null checks
const userData = parseUserData(input);
if (userData) {
  // Process data
} else {
  // Error occurred, but details are lost
}
```

**After:** Clean tuple-based error handling

```typescript
import { trycatch } from "trycatch-lib";

// Wrap the function that might throw
const safeJsonParse = trycatch(JSON.parse);

// Usage with clear error handling
async function parseUserData(input: string) {
  const [data, error] = await safeJsonParse(input);

  if (error) {
    console.error("Failed to parse:", error.message);
    return;
  }

  // Data is guaranteed to exist here
  return data;
}
```

## ✨ Key Features

- 🎯 **Predictable return values** - always get `[result, error]` tuples
- 🔄 **Works with sync and async functions** - same pattern everywhere
- 🧠 **Fully type-safe** - maintains TypeScript types throughout
- 🔍 **Enhanced error details** - access to original error information
- 🚀 **Minimal learning curve** - intuitive API with no complex concepts

## 📚 Usage Guide

### Basic Usage

The core functionality is simple - wrap any function that might throw an error:

```typescript
import { trycatch } from "trycatch-lib";

// Wrap a function that might throw
const safeFetch = trycatch(fetch);

// Then use it with the [result, error] pattern
async function getUser(id: string) {
  const [response, fetchError] = await safeFetch(`/api/users/${id}`);

  if (fetchError) {
    return console.error("Network error:", fetchError.message);
  }

  const [data, parseError] = await trycatch(response.json)();

  if (parseError) {
    return console.error("Parse error:", parseError.message);
  }

  console.log("User data:", data);
}
```

### Working with Error Details

When an error occurs, you get a `TryCatchError` with helpful properties:

```typescript
const [result, error] = await safeOperation();

if (error) {
  // Basic error information
  console.error(error.message);

  // Access the original error
  console.error("Original:", error.originalError);

  // Get when the error occurred
  console.error("Timestamp:", new Date(error.timestamp).toLocaleString());
}
```

### Handling Different Error Types

You can check for specific error types:

```typescript
const [data, error] = await safeFetch("/api/data");

if (error) {
  if (error.isOriginalInstanceOf(TypeError)) {
    console.error("Type error occurred");
  } else if (error.isOriginalInstanceOf(NetworkError)) {
    console.error("Network error occurred");
  } else {
    console.error("Unknown error:", error.message);
  }
}
```

## 🧩 API Overview

### Core Function

#### `trycatch(fn)`

Wraps a function to provide tuple-based error handling.

```typescript
// Signature
function trycatch<TFunc>(
  fn: TFunc,
): (
  ...args: Parameters<TFunc>
) => Promise<[Awaited<ReturnType<TFunc>>, null] | [null, TryCatchError]>;

// Example
const safeFunction = trycatch(originalFunction);
const [result, error] = await safeFunction(...args);
```

### Utilities

#### `makeAsync(fn)`

Converts a function to an asynchronous one.

```typescript
import { makeAsync } from "trycatch-lib";

// Use only with synchronous functions
const asyncFunction = makeAsync(synchronusFunction);
```

⚠️ **Important Note**: Only use `makeAsync` with synchronous functions. Using it with functions that already return Promises will cause double-wrapping, resulting in a `Promise<Promise<T>>` instead of `Promise<T>`.

**Example of proper usage:**

```typescript
// ✅ CORRECT: Using with a synchronous function
function add(a: number, b: number) {
  return a + b;
}

const asyncAdd = makeAsync(add);
const result = await asyncAdd(2, 3); // Returns 5
```

**Example of improper usage:**

```typescript
// ❌ INCORRECT: Using with an already-async function
async function fetchData() {
  return await fetch("/api/data");
}

// This will double-wrap the Promise
const asyncFetch = makeAsync(fetchData);
// Now requires: await (await asyncFetch())
```

If you're unsure whether a function is async, it's usually better to use `trycatch` directly:

```typescript
// Safe with both sync and async functions
const [result, error] = await trycatch(myFunction)(...args);
```

## 📋 Examples

### File Operations

```typescript
import { readFile } from "fs/promises";
import { trycatch } from "trycatch-lib";

const safeReadFile = trycatch(readFile);

async function loadConfig() {
  const [data, error] = await safeReadFile("config.json", "utf8");

  if (error) {
    console.error("Could not read config:", error.message);
    return defaultConfig;
  }

  const [config, parseError] = await trycatch(JSON.parse)(data);

  if (parseError) {
    console.error("Invalid config format:", parseError.message);
    return defaultConfig;
  }

  return config;
}
```

### API Requests

```typescript
import { trycatch } from "trycatch-lib";

async function getWeather(city) {
  const url = `https://api.weather.com/forecast?city=${city}`;

  const [response, fetchError] = await trycatch(fetch)(url);

  if (fetchError) {
    return { success: false, error: "Network error" };
  }

  if (!response.ok) {
    return { success: false, error: `API error: ${response.status}` };
  }

  const [data, parseError] = await trycatch(response.json)();

  if (parseError) {
    return { success: false, error: "Invalid data format" };
  }

  return { success: true, data };
}
```

## 🔌 Dependencies

Two lightweight dependencies:

- `chalk`: For colorful terminal output
- `signale`: For structured logging

## 📄 License

This project is licensed under the [MIT License](./LICENSE) - see the LICENSE file for details.
