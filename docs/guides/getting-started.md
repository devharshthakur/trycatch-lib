# 🚀 Getting Started with trycatch-lib

<div align="center">

![trycatch-lib](https://img.shields.io/badge/trycatch--lib-TypeScript-blue?style=for-the-badge&logo=typescript)

_A modern approach to error handling in TypeScript_

</div>

## 📦 Installation

Choose your preferred package manager:

<details open>
<summary><b>📂 Installation options</b></summary>
<br>

```bash
# Using npm
npm install trycatch-lib

# Using yarn
yarn add trycatch-lib

# Using pnpm
pnpm add trycatch-lib
```

</details>

## 🔍 Basic Usage

The core concept of trycatch-lib is wrapping functions that might throw errors and receiving a tuple with either the result or an error.

### Example

```typescript
import { trycatch } from "trycatch-lib";

// Wrap a function that might throw
const safeJsonParse = trycatch(JSON.parse);

// Use the wrapped function with the [result, error] pattern
async function parseConfig(configStr: string) {
  const [data, error] = await safeJsonParse(configStr);

  if (error) {
    console.error("Failed to parse config:", error.message);
    return null;
  }

  // TypeScript knows that data is defined here
  return data;
}
```

> 💡 **Tip:** You can wrap both synchronous and asynchronous functions with `trycatch`. The wrapped function will always return a Promise resolving to a `[result, error]` tuple.

## 🤔 Why Use trycatch-lib?

<table>
<tr>
<th width="50%">❌ Problems with try/catch</th>
<th width="50%">✅ Benefits of trycatch-lib</th>
</tr>
<tr>
<td>

- Mixes error handling with business logic
- Leads to ambiguous return values
- Error details are often lost
- Easy to forget to handle errors
- Inconsistent across sync/async functions

</td>
<td>

- **Clean separation** of error handling
- **Predictable** `[result, error]` tuples
- **Enhanced error info** with original error preserved
- **TypeScript enforced** error handling
- **Unified pattern** for sync and async code

</td>
</tr>
</table>

## 📋 Core Concepts

### The Tuple Pattern

The `[result, error]` tuple pattern is the foundation of trycatch-lib:

- When an operation succeeds: `[data, null]`
- When an operation fails: `[null, error]`

TypeScript types ensure you check for errors before using the result:

```typescript
// TypeScript understands this pattern
const [user, error] = await safeFetchUser(userId);

if (error) {
  // Handle error path
  return showError(error.message);
}

// TypeScript knows 'user' is defined in this branch
console.log(user.name);
```

### Enhanced Errors

The `TryCatchError` class provides rich information about what went wrong:

```typescript
if (error) {
  // Basic error info
  console.error(error.message);

  // Original error that was caught
  console.error("Original error:", error.originalError);

  // When the error occurred
  console.error("Timestamp:", new Date(error.timestamp).toLocaleString());

  // Check for specific error types
  if (error.isOriginalInstanceOf(SyntaxError)) {
    console.error("Syntax error in input");
  }
}
```

## 📚 Next Steps

Now that you understand the basics, you can explore more advanced concepts:

- [Error Handling Patterns](./error-handling-patterns.md) - Common patterns and best practices
- [Examples](../examples/basic-usage.md) - Code examples for various scenarios
- [API Reference](../api/README.md) - Detailed API documentation

---

<div align="center">

[← Back to Docs](../README.md) | [Error Handling Patterns →](./error-handling-patterns.md)

</div>
