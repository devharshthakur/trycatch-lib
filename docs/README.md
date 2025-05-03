# 📘 trycatch-lib Documentation

<div align="center">
  
[![npm version](https://img.shields.io/npm/v/trycatch-lib.svg?style=flat-square)](https://www.npmjs.com/package/trycatch-lib)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Error handling, simplified.**

_Replace chaotic try/catch blocks with clean, predictable `[result, error]` tuples._

</div>

## 📚 Documentation Sections

| Section                                           | Description                        |
| ------------------------------------------------- | ---------------------------------- |
| [🚀 Getting Started](./guides/getting-started.md) | Quick introduction and basic usage |
| [📖 API Reference](./api/README.md)               | Detailed API documentation         |
| [💻 Examples](./examples/basic-usage.md)          | Code examples for common scenarios |
| [🔧 Internals](./internals/architecture.md)       | Architecture for contributors      |

## ✨ Key Features

- 🎯 **Predictable return values** - always get `[result, error]` tuples
- 🔄 **Works with sync and async functions** - same pattern everywhere
- 🧠 **Fully type-safe** - maintains TypeScript types throughout
- 🔍 **Enhanced error details** - access to original error information
- 🚀 **Minimal learning curve** - intuitive API with no complex concepts

## 🔍 Quick Example

```typescript
import { trycatch } from "trycatch-lib";

// Wrap a function that might throw
const safeJsonParse = trycatch(JSON.parse);

// Use it with destructuring
async function parseConfig(configStr: string) {
  const [data, error] = await safeJsonParse(configStr);

  if (error) {
    console.error("Failed to parse config:", error.message);
    return null;
  }

  return data;
}
```

<details>
<summary>📝 <b>Why use the tuple pattern?</b></summary>
<br>

The tuple-based `[result, error]` pattern offers several advantages over traditional try/catch blocks:

- Makes errors part of your function's return type
- Impossible to forget to handle errors (TypeScript enforces this)
- Provides a consistent pattern across sync and async code
- Improves code readability with explicit error paths
- Enhances error information with original error context

</details>

## 🔗 Resources

- [GitHub Repository](https://github.com/yourusername/trycatch-lib)
- [NPM Package](https://www.npmjs.com/package/trycatch-lib)
- [Release Notes](../CHANGELOG.md)
- [License](../LICENSE)

---

<div align="center">
  
**[Get Started →](./guides/getting-started.md)**

</div>
