# 💻 Basic Usage Examples

<div align="center">

![Examples](https://img.shields.io/badge/Examples-Code-brightgreen?style=for-the-badge)

_Practical examples of using trycatch-lib in different scenarios_

</div>

<div align="center">

| Example Type                                                  | Description                               |
| ------------------------------------------------------------- | ----------------------------------------- |
| [Simple Function Wrapping](#simple-function-wrapping)         | Basic error handling pattern              |
| [Working with Async Functions](#working-with-async-functions) | Using trycatch with async code            |
| [Chaining Operations](#chaining-operations)                   | Combining multiple error-prone operations |
| [Type Safety](#type-safety)                                   | Leveraging TypeScript type safety         |

</div>

## 🧩 Simple Function Wrapping

The most basic usage pattern is wrapping a function that might throw errors:

```typescript
import { trycatch } from "trycatch-lib";

// A function that might throw
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
}

// Wrap it with trycatch
const safeDivide = trycatch(divide);

// Use the wrapped function
async function performDivision(a: number, b: number) {
  const [result, error] = await safeDivide(a, b);

  if (error) {
    console.error("Division failed:", error.message);
    return null;
  }

  return result;
}
```

> 🧮 **Result:**
>
> ```
> performDivision(10, 2) → 5
> performDivision(10, 0) → logs "Division failed: Division by zero" and returns null
> ```

## 🔄 Working with Async Functions

trycatch-lib works seamlessly with both synchronous and asynchronous functions:

```typescript
import { trycatch } from "trycatch-lib";

// An async function that might throw
async function fetchUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return response.json();
}

// Wrap it with trycatch
const safeFetchUserData = trycatch(fetchUserData);

// Use the wrapped function
async function getUser(userId: string) {
  const [userData, error] = await safeFetchUserData(userId);

  if (error) {
    console.error("Failed to fetch user:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data: userData };
}
```

<details>
<summary><b>📊 Error Details Example</b></summary>
<br>

```typescript
async function getUserWithErrorDetails(userId: string) {
  const [userData, error] = await safeFetchUserData(userId);

  if (error) {
    // Detailed error information
    console.error("Error message:", error.message);
    console.error(
      "Error occurred at:",
      new Date(error.timestamp).toLocaleString(),
    );
    console.error("Original error:", error.originalError);

    // Network error specific handling
    if (error.isOriginalInstanceOf(TypeError)) {
      return { success: false, error: "NETWORK_ERROR" };
    }

    return { success: false, error: "FETCH_ERROR" };
  }

  return { success: true, data: userData };
}
```

</details>

## ⛓️ Chaining Operations

You can chain multiple trycatch operations for workflows with several steps:

```typescript
import { trycatch } from "trycatch-lib";
import fs from "fs/promises";

const safeReadFile = trycatch(fs.readFile);
const safeParseJSON = trycatch(JSON.parse);

async function readConfig(filePath: string) {
  // Read the file
  const [fileContent, readError] = await safeReadFile(filePath, "utf8");

  if (readError) {
    console.error("Could not read config file:", readError.message);
    return null;
  }

  // Parse the JSON
  const [config, parseError] = await safeParseJSON(fileContent);

  if (parseError) {
    console.error("Invalid config format:", parseError.message);
    return null;
  }

  return config;
}
```

> 💡 **Tip:** This pattern is particularly useful for data processing pipelines where multiple operations could potentially fail.

## 🔐 Type Safety

trycatch-lib maintains proper TypeScript types throughout:

```typescript
import { trycatch } from "trycatch-lib";

interface User {
  id: string;
  name: string;
  email: string;
}

// TypeScript knows the return type
const fetchUser = trycatch(async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
});

async function displayUser(id: string) {
  const [user, error] = await fetchUser(id);

  if (error) {
    return console.error("Error:", error.message);
  }

  // TypeScript knows that user is of type User here
  console.log(`Name: ${user.name}, Email: ${user.email}`);
}
```

<details>
<summary><b>🧪 Advanced Type Usage</b></summary>
<br>

```typescript
import { trycatch, TryCatchResult } from "trycatch-lib";

// Generic helper function to process results
function handleResult<T>(
  result: TryCatchResult<T>,
  successHandler: (data: T) => void,
  errorHandler: (error: string) => void,
): void {
  const [data, error] = result;

  if (error) {
    errorHandler(error.message);
    return;
  }

  // TypeScript enforces that data is of type T here
  successHandler(data);
}

// Usage
async function example() {
  const safeFetch = trycatch(fetch);
  const result = await safeFetch("/api/data");

  handleResult(
    result,
    (response) => console.log("Status:", response.status),
    (errorMsg) => console.error("Error:", errorMsg),
  );
}
```

</details>

---

<div align="center">

[← Back to Docs](../README.md) | [API Reference →](../api/README.md)

</div>
