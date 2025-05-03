# 📚 trycatch-lib Examples

<div align="center">

![Examples](https://img.shields.io/badge/Code-Examples-brightgreen?style=for-the-badge)

_Learn through practical code examples_

</div>

## 📖 Available Examples

| Example                                                            | Description                                        |
| ------------------------------------------------------------------ | -------------------------------------------------- |
| [🧩 Basic Usage](./basic-usage.md)                                 | Core patterns for wrapping functions with trycatch |
| [🔄 Error Handling Patterns](../guides/error-handling-patterns.md) | Advanced error handling techniques                 |

## 🏃‍♂️ Running the Examples

<details open>
<summary><b>Setting up a local environment</b></summary>
<br>

The examples in this directory are code snippets that demonstrate how to use trycatch-lib. To run them locally:

### 1️⃣ Create a new TypeScript project

```bash
# Create directory
mkdir trycatch-example
cd trycatch-example

# Initialize project
npm init -y

# Install dependencies
npm install typescript ts-node trycatch-lib
```

### 2️⃣ Create an example file

```bash
# Create a TypeScript file
touch example.ts
```

### 3️⃣ Copy and run an example

Paste any example code into your file and run it:

```bash
npx ts-node example.ts
```

</details>

## 🧪 Example Project Structure

For larger examples, we recommend this structure:

```
trycatch-example/
├── package.json          # Dependencies including trycatch-lib
├── tsconfig.json         # TypeScript configuration
├── src/
│   ├── index.ts          # Main entry point
│   ├── api/              # API functions that use trycatch
│   │   └── users.ts      # User API with error handling
│   └── utils/            # Utility functions
│       └── safeApi.ts    # API wrapper using trycatch
└── README.md             # Project documentation
```

## 🚀 TypeScript Configuration

A recommended `tsconfig.json` for using trycatch-lib:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"]
}
```

## 💡 Create Your Own Examples

Feel free to experiment with these examples and adapt them to your needs. If you create a particularly useful example, consider contributing it back to the documentation!

### How to Contribute Examples

1. Fork the repository
2. Add your example to the appropriate section
3. Submit a pull request with a clear description
4. Ensure your example follows the project's code style

---

<div align="center">

[← Back to Docs](../README.md) | [Basic Usage →](./basic-usage.md)

</div>
