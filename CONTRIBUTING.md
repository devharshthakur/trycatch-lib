# 💻 How to Contribute

Thank you for your interest in contributing to trycatch-lib! This document provides guidelines for contributing to this TypeScript utility library for error handling.

## 🚀 Getting Started

1. 🍴 Fork the repository
2. 📋 Clone your fork: `git clone https://github.com/your-username/trycatch-lib.git`
3. 📦 Install dependencies: `pnpm install`
4. 🏃‍♂️ Run the build: `pnpm build`

## 🤝 How to Contribute

### 🌿 Branching

When contributing, please create a branch with this naming convention:

| Type             | Format                           | Example                     |
| ---------------- | -------------------------------- | --------------------------- |
| 🆕 Feature       | `feature/<what-you're-adding>`   | `feature/custom-error-type` |
| 🐛 Fix           | `fix/<what-you're-fixing>`       | `fix/async-detection`       |
| 📚 Documentation | `docs/<what-you're-documenting>` | `docs/api-usage`            |

## 🔀 Git Workflow & Branch Strategy

#### This project follows a structured branch workflow designed for stability and maintainability:

### 📊 Contribution Flow

<table>
  <tr>
    <td width="25%" align="center">
      <img src="https://img.shields.io/badge/Step_1-blue?style=for-the-badge" alt="Step 1" /><br/>
      <b>🍴 Fork from Main</b>
    </td>
    <td width="75%">
      Always fork from the `main` branch to ensure you're working with the most stable version.
      <br/><br/>
      <blockquote>
        💡 <b>Why?</b> The <code>main</code> branch contains thoroughly tested code that serves as a solid foundation for new features.
      </blockquote>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/Step_2-blue?style=for-the-badge" alt="Step 2" /><br/>
      <b>📝 Create PR to Dev</b>
    </td>
    <td>
      Submit your pull request targeting the `dev` branch, not `main`.
      <br/><br/>
      <blockquote>
        🔍 <b>Dev Branch Role:</b> Integration point for all incoming changes
        <br/><br/>
        🧪 <b>What Happens:</b> Initial testing and code review before integration
      </blockquote>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/Step_3-blue?style=for-the-badge" alt="Step 3" /><br/>
      <b>🧪 Testing in Dev</b>
    </td>
    <td>
      Once merged to `dev`, your changes undergo more thorough testing alongside other features.
      <br/><br/>
      <blockquote>
        🔄 <b>Dev Environment:</b> Contains latest features being evaluated
        <br/><br/>
        🛠️ <b>Possible Actions:</b> Bug fixes and adjustments before promotion
      </blockquote>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/Step_4-blue?style=for-the-badge" alt="Step 4" /><br/>
      <b>🚀 Promotion to Main</b>
    </td>
    <td>
      After rigorous testing, changes from `dev` are batched and merged to `main`.
      <br/><br/>
      <blockquote>
        ✨ <b>Main Branch Quality:</b> Always stable, production-ready code
        <br/><br/>
        📊 <b>Merge Strategy:</b> Batched changes with detailed documentation
        <br/><br/>
        🧹 <b>Result:</b> Clean history of significant, stable updates
      </blockquote>
    </td>
  </tr>
</table>

<div align="center">
  <img src="https://img.shields.io/badge/⭐_Benefits-green?style=for-the-badge" alt="Benefits" />
</div>

- 🛡️ **Stability:** Main branch remains reliable and bug-free
- 📈 **Quality:** Thorough testing at multiple stages
- 📚 **Documentation:** Clear history of meaningful changes
- 👥 **Collaboration:** Multiple contributors can work simultaneously

### ✏️ Making Changes

1. Make your changes in small, focused commits
2. Add JSDoc comments to explain public functions and types
3. Follow the established coding patterns in the codebase
4. Write TypeScript properly (avoid `any` when possible)
5. Run `pnpm format` before committing to ensure code style consistency

### 💬 Commit Messages

Keep commit messages clear and descriptive. For extensive changes, add details in the commit description.

For example:

```
Add error serialization methods to TryCatchError

- Implement toJSON method for error serialization
- Add fromJSON static method for deserialization
- Create proper type definitions for serialized errors
- Add JSDoc documentation with examples
- Update README with serialization examples

Resolves #42
```

### 🔀 Pull Requests

When submitting a pull request:

1. 📝 Describe your changes in the PR description
2. 🔗 Reference any related issues (`Fixes #123`)
3. 📸 Include examples of how your changes improve the library
4. 🧪 Ensure existing tests pass and add new tests for your changes
5. 📚 Update documentation if you've added or changed functionality

## 🎨 Code Style

> Clean code always looks like it was written by someone who cares.

- 📝 Use TypeScript properly and avoid `any` type when possible
- 💭 Document your code with JSDoc comments
- 🧩 Follow existing patterns in the codebase
- 🧪 Write tests for new functionality
- ✨ Format your code with `pnpm format` before submitting

### 📚 Documentation & Comments

This project strongly emphasizes JSDoc comments for all public API functions and types:

```typescript
/**
 * Wraps a function (sync or async) with proper error handling
 *
 * @param {Function} fn - The function to wrap
 * @returns {Function} A new function that returns [result, error] tuples
 *
 * @example
 * // Synchronous function
 * const safeParseInt = trycatch(parseInt);
 * const [num, error] = await safeParseInt("123");
 *
 * @example
 * // Asynchronous function
 * const safeFetch = trycatch(fetch);
 * const [response, error] = await safeFetch("https://api.example.com");
 */
function trycatch<TFunc extends (...args: any[]) => any>(
  fn: TFunc,
): (...args: Parameters<TFunc>) => Promise<TryCatchResult<ReturnType<TFunc>>> {
  // Implementation...
}
```

#### Benefits of JSDoc:

- 📖 **Improved Readability**: Makes code self-documenting
- 🔍 **IDE Integration**: Provides intellisense and hover information
- 🧪 **Type Checking**: Works with TypeScript for better type safety
- 📊 **Documentation Generation**: Can be used to generate API docs
- 🧠 **Knowledge Transfer**: Helps new contributors understand the codebase

## 🗺️ Project Progress

The [CHANGELOG.md](CHANGELOG.md) file serves as a living document for tracking project status:

- ✅ Completed features
- 🔄 Current focus areas
- 📝 Planned future work

When contributing:

- Review the CHANGELOG to understand current priorities
- Update it when adding significant features or fixes

## ❓ Questions?

If you have questions or need help, feel free to:

- 🐞 Open an issue
- 💬 Start a discussion in the Discussions tab

## 📋 Using Issue Templates

When opening a new issue, please use the appropriate issue template:

- 🐛 **Bug Report**: For reporting bugs or unexpected behavior
- 🚀 **Feature Request**: For suggesting new features or improvements
- 📚 **Documentation**: For suggesting documentation improvements

The templates help ensure you provide all the necessary information.

---

**Thanks for contributing to trycatch-lib!** 👏
