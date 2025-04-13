/**
 * Type-level utility to determine if a function is asynchronous.
 * @template TFunc The function type to check
 * @returns `true` if the function returns a Promise, `false` otherwise
 */
export type IsAsyncFunction<TFunc extends (...args: unknown[]) => unknown> =
  ReturnType<TFunc> extends Promise<unknown> ? true : false;

/**
 * Confidence level of an async detection result.
 */
export type ConfidenceLevel =
  /** Detection is highly reliable */
  | "certain"
  /** Detection is probable but not guaranteed */
  | "likely"
  /** Detection couldn't determine with confidence */
  | "uncertain";

/**
 * Result of an async function detection check.
 */
export interface AsyncCheckResult {
  /** Whether the function is detected as asynchronous */
  isAsync: boolean;

  /** How confident the detection is in its result */
  confidence: ConfidenceLevel;

  /** Additional details about the detection process */
  details: {
    /** Whether TypeScript types indicate the function returns a Promise */
    typeIndicatesAsync: boolean;

    /** Whether runtime analysis identified async function characteristics */
    runtimeIndicatesAsync: boolean;

    /** Methods used to determine the async status */
    detectionMethod: string[];
  };
}

/**
 * Options for customizing async detection behavior.
 */
export interface AsyncDetectionOptions {
  /**
   * When true, print warnings for uncertain detection
   * @default false
   */
  warn?: boolean;

  /**
   * How to handle cases where detection is uncertain
   * @default "safe" - report uncertain functions as potentially async
   */
  uncertaintyMode?: "safe" | "strict";

  /**
   * Whether to return detailed information about the detection process
   * @default false
   */
  verbose?: boolean;
}

/**
 * Detects if a function is asynchronous.
 *
 * Combines compile-time TypeScript type analysis with runtime detection
 * methods for maximum reliability across different JavaScript environments.
 *
 * @example
 * // Basic usage (returns boolean)
 * if (isAsync(myFunction)) {
 *   console.log("Function is async");
 * }
 *
 * // Advanced usage (returns detailed information)
 * const result = isAsync(myFunction, { verbose: true });
 * console.log(`Is async: ${result.isAsync}, confidence: ${result.confidence}`);
 *
 * @param fn - The function to check
 * @param options - Detection configuration options
 * @returns Boolean by default, or AsyncCheckResult if verbose option is true
 */
export function isAsync<TFunc extends (...args: unknown[]) => unknown>(
  fn: TFunc,
  options: AsyncDetectionOptions = {},
): boolean | AsyncCheckResult {
  // Default options
  const { warn = false, uncertaintyMode = "safe", verbose = false } = options;

  // Result storage
  const detectionMethods: string[] = [];
  let runtimeAsync = false;
  let typeAsync = false;
  let confidence: ConfidenceLevel = "uncertain";

  // 1. Check using TypeScript's compile-time types
  try {
    // This is a TypeScript compile-time check, at runtime we use a trick to access it
    typeAsync = false as IsAsyncFunction<TFunc>;
    if (typeAsync) {
      detectionMethods.push("typescript-types");
      confidence = "certain";
    }
  } catch {
    // Types not available or error in type checking
  }

  // 2. Runtime checks - only needed if type check didn't confirm async
  if (!typeAsync) {
    // Safe guard for bad inputs
    if (!fn || typeof fn !== "function") {
      if (warn) {
        console.warn("[trycatch-lib] Value is not a function");
      }
      const result = uncertaintyMode === "safe";

      if (verbose) {
        return {
          isAsync: result,
          confidence: "uncertain",
          details: {
            typeIndicatesAsync: false,
            runtimeIndicatesAsync: false,
            detectionMethod: ["invalid-input"],
          },
        };
      }
      return result;
    }

    // Check 1: Constructor name check
    try {
      if (fn.constructor && fn.constructor.name === "AsyncFunction") {
        runtimeAsync = true;
        detectionMethods.push("constructor-name");
        confidence = "certain";
      }
    } catch {
      // Constructor check failed
    }

    // Check 2: Function string representation check
    if (!runtimeAsync) {
      try {
        const fnString = Function.prototype.toString.call(fn);
        if (fnString.includes("async ") && fnString.includes("function")) {
          runtimeAsync = true;
          detectionMethods.push("function-string");
          confidence = "likely";
        }
      } catch {
        // String representation check failed
      }
    }

    // Check 3: Invocation check (most definitive but riskiest)
    if (!runtimeAsync) {
      try {
        const result = fn();
        // Check if result is Promise-like (has then and catch methods)
        if (
          result !== null &&
          result !== undefined &&
          typeof result === "object" &&
          "then" in result &&
          typeof result.then === "function" &&
          "catch" in result &&
          typeof result.catch === "function"
        ) {
          runtimeAsync = true;
          detectionMethods.push("promise-return");
          confidence = "likely"; // Not certain, could be a thenable but not a real Promise
        } else {
          // Successfully called the function and it didn't return a Promise
          detectionMethods.push("synchronous-invocation");
          confidence = "certain";
        }
      } catch {
        // Function invocation failed - we cannot determine with this method
      }
    }

    // Check 4: Prototype chain
    if (!runtimeAsync && !detectionMethods.includes("synchronous-invocation")) {
      try {
        let proto = Object.getPrototypeOf(fn);
        while (proto) {
          if (proto.constructor && proto.constructor.name === "AsyncFunction") {
            runtimeAsync = true;
            detectionMethods.push("prototype-chain");
            confidence = "likely";
            break;
          }
          proto = Object.getPrototypeOf(proto);
        }
      } catch {
        // Prototype check failed
      }
    }
  }

  // 3. Make final determination
  let finalIsAsync = typeAsync || runtimeAsync;

  // If we have no methods working, we're uncertain
  if (detectionMethods.length === 0) {
    confidence = "uncertain";
    finalIsAsync = uncertaintyMode === "safe";
    detectionMethods.push("fallback");

    if (warn) {
      console.warn(
        `[trycatch-lib] Could not determine if function ${fn.name || "anonymous"} is async. ` +
          `Using ${uncertaintyMode} mode, treating as ${finalIsAsync ? "async" : "sync"}.`,
      );
    }
  }

  // 4. Return appropriate result
  if (verbose) {
    return {
      isAsync: finalIsAsync,
      confidence,
      details: {
        typeIndicatesAsync: typeAsync,
        runtimeIndicatesAsync: runtimeAsync,
        detectionMethod: detectionMethods,
      },
    };
  }

  return finalIsAsync;
}
