# Error Handling Patterns

This guide explores common error handling patterns using trycatch-lib.

## Basic Pattern

The most basic pattern is to check if an error exists and handle it:

```typescript
import { trycatch } from "trycatch-lib";

const safeOperation = trycatch(riskyFunction);

async function performOperation() {
  const [result, error] = await safeOperation();

  if (error) {
    // Handle error
    console.error("Operation failed:", error.message);
    return null;
  }

  // Process result
  return result;
}
```

## Early Return Pattern

Use early returns to avoid nested conditionals:

```typescript
async function processData(input: string) {
  // Parse the input
  const [data, parseError] = await trycatch(JSON.parse)(input);

  if (parseError) {
    console.error("Invalid input format:", parseError.message);
    return { success: false, error: "INVALID_FORMAT" };
  }

  // Validate the data
  const [valid, validationError] = await trycatch(validateData)(data);

  if (validationError) {
    console.error("Validation failed:", validationError.message);
    return { success: false, error: "VALIDATION_FAILED" };
  }

  // Process the data
  const [result, processError] = await trycatch(processValidData)(data);

  if (processError) {
    console.error("Processing failed:", processError.message);
    return { success: false, error: "PROCESSING_FAILED" };
  }

  // Success path
  return { success: true, result };
}
```

## Chaining Operations

You can chain multiple operations that depend on each other:

```typescript
import { trycatch } from "trycatch-lib";
import fs from "fs/promises";

async function loadAndProcessConfig(filePath: string) {
  // Read the file
  const [content, readError] = await trycatch(fs.readFile)(filePath, "utf8");

  if (readError) {
    return { success: false, error: `File read error: ${readError.message}` };
  }

  // Parse the JSON
  const [config, parseError] = await trycatch(JSON.parse)(content);

  if (parseError) {
    return { success: false, error: `JSON parse error: ${parseError.message}` };
  }

  // Validate the config
  const [validConfig, validateError] = await trycatch(validateConfig)(config);

  if (validateError) {
    return {
      success: false,
      error: `Validation error: ${validateError.message}`,
    };
  }

  return { success: true, config: validConfig };
}
```

## Error Type Checking

You can check for specific error types:

```typescript
async function fetchData(url: string) {
  const [response, error] = await trycatch(fetch)(url);

  if (error) {
    // Check for specific error types
    if (error.isOriginalInstanceOf(TypeError)) {
      // Network error or other type error
      return { success: false, error: "NETWORK_ERROR" };
    }

    if (
      error.originalError instanceof Error &&
      error.originalError.name === "AbortError"
    ) {
      // Request was aborted
      return { success: false, error: "REQUEST_TIMEOUT" };
    }

    // Generic error
    return { success: false, error: "FETCH_FAILED" };
  }

  // Check response status
  if (!response.ok) {
    return { success: false, error: `HTTP_ERROR_${response.status}` };
  }

  // Parse the response
  const [data, parseError] = await trycatch(() => response.json())();

  if (parseError) {
    return { success: false, error: "INVALID_RESPONSE_FORMAT" };
  }

  return { success: true, data };
}
```

## Error Propagation

Sometimes you want to let errors bubble up:

```typescript
async function innerFunction() {
  const [data, error] = await trycatch(fetch)("/api/data");

  if (error) {
    // Add context to the error
    throw new Error(`Data fetch failed: ${error.message}`, {
      cause: error.originalError,
    });
  }

  return data;
}

async function outerFunction() {
  // The error from innerFunction will be caught here
  const [data, error] = await trycatch(innerFunction)();

  if (error) {
    console.error("Operation failed:", error.message);
    // Access the original cause
    if (error.originalError instanceof Error && error.originalError.cause) {
      console.error("Root cause:", error.originalError.cause);
    }
    return null;
  }

  return data;
}
```

## Fallback Values

You can provide fallback values when an operation fails:

```typescript
async function getUserPreference(
  userId: string,
  key: string,
  defaultValue: any,
) {
  const [preference, error] = await trycatch(fetchUserPreference)(userId, key);

  // Return the default value if there's an error
  if (error) {
    console.warn(`Could not fetch user preference ${key}:`, error.message);
    return defaultValue;
  }

  return preference;
}
```

## Retry Logic

You can implement retry logic for transient errors:

```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  let retries = 0;

  while (retries <= maxRetries) {
    const [response, error] = await trycatch(fetch)(url);

    // If successful, return the response
    if (!error) {
      return response;
    }

    // If we've reached max retries, throw the error
    if (retries === maxRetries) {
      throw new Error(`Failed after ${maxRetries} retries: ${error.message}`);
    }

    // Check if error is retryable (e.g., network error, 5xx status)
    const isRetryable =
      error.isOriginalInstanceOf(TypeError) ||
      (error.originalError instanceof Error &&
        error.originalError.name === "AbortError");

    if (!isRetryable) {
      throw new Error(`Non-retryable error: ${error.message}`);
    }

    // Wait before retrying (exponential backoff)
    const delay = Math.pow(2, retries) * 100;
    await new Promise((resolve) => setTimeout(resolve, delay));

    retries++;
    console.log(`Retry ${retries}/${maxRetries}`);
  }

  // This should never be reached due to the throw in the loop
  throw new Error("Unexpected end of retry logic");
}
```
