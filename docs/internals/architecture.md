# 🔧 trycatch-lib Architecture

<div align="center">

![Architecture](https://img.shields.io/badge/Internal-Architecture-red?style=for-the-badge)

_A guide to the internal structure for contributors_

</div>

## 📁 Project Structure

The codebase follows a modular organization to separate concerns:

```
src/
├── index.ts              # Main entry point and exports
│
├── core/                 # Core functionality
│   ├── trycatch.ts       # Main trycatch function implementation
│   └── makeAsync.ts      # Async conversion utility
│
├── errors/               # Error handling
│   └── TryCatchError.ts  # Enhanced error class
│
├── utils/                # Utility functions
│   └── isTryCatchError.ts # Type guard for TryCatchError
│
├── types/                # TypeScript type definitions
│   └── result.types.ts   # Result tuple type definitions
│
└── internal/             # Internal helpers (not exported)
    └── helpers.ts        # Internal utility functions
```

## 🧩 Core Components

### 🎯 trycatch Function

The main `trycatch` function is the heart of the library:

<table>
<tr>
<td width="60%">

**Implementation Overview:**

1. Takes a function `fn` as input
2. Returns a new function that:
   - Accepts the same parameters as `fn`
   - Wraps the call to `fn` in a try/catch block
   - Returns a tuple of `[result, null]` or `[null, error]`
3. Handles both sync and async functions transparently

</td>
<td width="40%">

```typescript
// Simplified implementation
function trycatch<TFunc>(fn: TFunc) {
  return async (...args) => {
    try {
      const result = await fn(...args);
      return [result, null];
    } catch (error) {
      return [null, new TryCatchError(error)];
    }
  };
}
```

</td>
</tr>
</table>

#### Flow Diagram

```
Input Function → trycatch → Wrapped Function → [result, null] | [null, error]
                                  │
                                  ├── 1. Call original function
                                  ├── 2. Await if result is Promise
                                  ├── 3. Return [result, null] on success
                                  └── 4. Return [null, error] on failure
```

### 🔍 TryCatchError Class

The `TryCatchError` class enhances error information:

<table>
<tr>
<td width="60%">

**Key Features:**

- Extends JavaScript's built-in `Error` class
- Captures the original thrown error
- Records a timestamp when the error occurred
- Provides utility methods to inspect the original error
- Includes serialization for error transmission

</td>
<td width="40%">

```typescript
// Key properties
class TryCatchError extends Error {
  // Original error that was caught
  readonly originalError: unknown;

  // When the error occurred
  readonly timestamp: number;

  // Methods for error introspection
  isOriginalInstanceOf<T>(...): boolean;
  getOriginalProperty(...): unknown;
  // ...more methods
}
```

</td>
</tr>
</table>

## 📊 Type System

The type system is carefully designed to provide strong type safety:

### Type Definitions

```typescript
// Success case: result with null error
type SuccessResult<T> = [T, null];

// Failure case: null result with error
type FailResult = [null, TryCatchError];

// Union type representing possible outcomes
type TryCatchResult<T> = SuccessResult<T> | FailResult;
```

### Type Inference

The trycatch function uses TypeScript's powerful type inference:

```typescript
function trycatch<TFunc extends (...args: any[]) => any>(
  fn: TFunc,
): (
  ...args: Parameters<TFunc>
) => Promise<TryCatchResult<Awaited<ReturnType<TFunc>>>>;
```

This type signature ensures:

1. Parameter types match the original function
2. Return type properly transforms the original function's return type
3. Promises are properly unwrapped using `Awaited<T>`
4. The result is always a tuple matching `TryCatchResult<T>`

## 🔄 Flow of Execution

When using trycatch-lib, the execution follows this pattern:

1. **Wrapping**: A function is wrapped using `trycatch`

   ```typescript
   const safeFunction = trycatch(originalFunction);
   ```

2. **Invocation**: The wrapped function is called with arguments

   ```typescript
   const result = await safeFunction(arg1, arg2);
   ```

3. **Execution**:

   - The original function is called with the provided arguments
   - If the function returns a Promise, it's awaited

4. **Result Handling**:

   - Success: Returns `[result, null]`
   - Error: Returns `[null, new TryCatchError(error)]`

5. **Consumption**:

   ```typescript
   const [data, error] = result;

   if (error) {
     // Handle error
   } else {
     // Use data
   }
   ```

## 🧠 Design Decisions

### Why Tuples?

We chose tuples over other patterns (like Result/Either objects) because:

<table>
<tr>
<td width="50%">

**✅ Benefits**

- Native to JavaScript/TypeScript
- Simple array destructuring syntax
- No additional abstractions to learn
- Familiar to developers from other languages (Go, Rust)

</td>
<td width="50%">

**⚠️ Considerations**

- Requires consistent ordering
- No named access to parts of the result
- Requires TypeScript for proper type safety

</td>
</tr>
</table>

### Why Promise-based?

All wrapped functions return Promises because:

1. **Consistency**: Provides uniform API for both sync and async functions
2. **Simplicity**: Single mental model for consumers
3. **Modern**: Works well with async/await patterns
4. **Flexibility**: Allows for Promise-specific features (like timeout, race, etc.)

### Error Enhancement Strategy

We enhance errors rather than just passing them through because:

1. **Consistency**: Original errors might have inconsistent structures
2. **Context**: Enhanced errors provide additional metadata (timestamp, etc.)
3. **Safety**: Helps prevent common issues with error handling
4. **Utility**: Provides helpful methods for inspecting errors

## 👥 Contributing Guidelines

When contributing to the codebase, please follow these guidelines:

1. **API Compatibility**: Maintain backward compatibility in the public API
2. **Pattern Integrity**: Preserve the tuple-based return pattern
3. **Type Safety**: Keep type safety as a high priority
4. **Documentation**: Document all public functions with JSDoc comments
5. **Testing**: Add unit tests for new functionality

### Code Style

- Use TypeScript features like strict typing
- Follow functional programming principles when appropriate
- Use descriptive variable and function names
- Keep functions focused and small
- Include JSDoc comments for all public APIs

---

<div align="center">

[← Back to Docs](../README.md) | [Examples →](../examples/basic-usage.md)

</div>
