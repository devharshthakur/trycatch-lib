# ⚡️ trycatch-lib

[![npm version](https://img.shields.io/npm/v/trycatch-lib.svg?style=flat)](https://www.npmjs.com/package/trycatch-lib)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)](https://www.typescriptlang.org/)

> **Simple, type-safe error handling for TypeScript.**

---

## 📦 Install

```bash
pnpm add trycatch-lib
# or
yarn add trycatch-lib
# or
npm install trycatch-lib
```

---

## 🚀 Quick Example: API Call

### ❌ Traditional try/catch

```typescript
async function fetchUser(id: string) {
  try {
    const res = await fetch(`/api/user/${id}`);
    const data = await res.json();
    return data;
  } catch (err) {
    return null; // Error details lost
  }
}
```

### ✅ With trycatch-lib

```typescript
import { trycatch } from "trycatch-lib";

async function fetchUser(id: string) {
  // For built-in functions like fetch, pass directly
  const [res, fetchErr] = await trycatch(fetch(`/api/user/${id}`));
  if (fetchErr) return null;

  // For custom logic, use an arrow/anonymous function is what i recommend
  const [data, jsonErr] = await trycatch(() => {
    // your custom logic
  });
  if (jsonErr) return null;

  return data;
}
```

---

## ✨ Features

- 🧩 **[result, error]** tuple for all functions
- 🔄 Works with sync & async (Promise) functions
- 🧠 Fully type-safe, no `any` required
- 🔍 Rich error info via `TryCatchError`
- 🚀 Minimal, zero-config API

---

## 📝 Usage

```typescript
// For built-in or pre-made functions, pass directly: ( way i recommend)
const [result, error] = await trycatch(fetch(url));

// For custom logic, use an arrow/anonymous function i reccomend, it prevents you to make a additional wrappers
const [result, error] = await trycatch(() => {
  // function body
});

if (error) {
  // error is always a TryCatchError instance:
  console.error(error.message);
}
```

- **Use arrow/anonymous functions for custom logic.**
- **Pass built-in or pre-made functions (like fetch, JSON.parse) directly.**
- Handles both sync and async functions.

---

## 📚 API

- `trycatch(fn)` → Returns an async function that returns `[result, error]`.
- `TryCatchError` → Custom error with `.originalError` and `.timestamp`.

---

## 🛑 `TryCatchError` – Error Handling Made Consistent

All errors returned by `trycatch` are wrapped in a `TryCatchError` instance for consistent, type-safe error handling.

### What is `TryCatchError`?

A custom error class (see [`src/errors/TryCatchError.ts`](src/errors/TryCatchError.ts)) that standardizes error information, making it easy to inspect, log, or handle errors in a predictable way.

### Properties

- **`message: string`** – Human-readable error message (from the original error, or a default fallback)
- **`originalError: unknown`** – The original error value (can be any type: `Error`, string, object, etc.)
- **`timestamp: number`** – When the error was created (milliseconds since epoch)

### Usage Example

```typescript
import { trycatch, TryCatchError } from "trycatch-lib";

const [result, error] = await trycatch(() => {
  // function logic which can throw error
  return; // fn return type
});

if (error) {
  // Always a TryCatchError instance
  console.error("Message:", error.message);
  console.error("Original error:", error.originalError);
  console.log("Occurred at:", new Date(error.timestamp));

  // How to use it as Type guard
  if (error instanceof TryCatchError) {
    // ...handle specifically
  }
}
```

### Best Practices

- Use `.originalError` if you need the raw error (for logging, rethrowing, etc.)
- `.message` is always a string, even if the original error was not
- `.timestamp` helps with debugging and tracing error events

---

## 🧪 Test

```bash
pnpm test
```

---

## 📄 License

MIT
