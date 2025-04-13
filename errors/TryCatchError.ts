/**
 * Custom error class used by the trycatch function
 * Contains original error for inspection
 */
import chalk from "chalk";

export class TryCatchError extends Error {
  public readonly originalError: unknown;
  public readonly timestamp: number;

  constructor(originalError: unknown, message?: string) {
    const errorMessage =
      message ??
      (originalError instanceof Error
        ? originalError.message
        : "An unexpected error occurred");
    super(errorMessage);

    this.name = "TryCatchError";
    this.originalError = originalError;
    this.timestamp = Date.now();
  }

  /**
   * Check if the original error is an instance of a specific error class
   * @param errorClass The error class to check against
   * @returns True if the original error is an instance of the provided error class
   */
  isOriginalInstanceOf<T extends Error>(
    errorClass: new (...args: any[]) => T,
  ): boolean {
    return this.originalError instanceof errorClass;
  }

  /**
   * Safely get a property from the original error if it exists
   * @param key The property name to retrieve
   * @returns The property value or undefined if not found
   */
  getOriginalProperty<K extends string>(key: K): unknown {
    if (this.originalError && typeof this.originalError === "object") {
      return (this.originalError as Record<string, unknown>)[key];
    }
    return undefined;
  }

  /**
   * Get the original stack trace if available
   * @returns The original stack trace or undefined if not available
   */
  getOriginalStack(): string | undefined {
    if (this.originalError instanceof Error) {
      return this.originalError.stack;
    }
    return undefined;
  }

  /**
   * Format the error with detailed information for logging
   * @returns A formatted string with error details
   */
  toDetailedString(): string {
    const errorTime = new Date(this.timestamp).toISOString();
    const originalStack = this.getOriginalStack();

    let result = `[TryCatchError] at ${errorTime}\n`;
    result += `Message: ${this.message}\n`;

    if (originalStack) {
      result += `Original Stack: ${originalStack}\n`;
    }

    return result;
  }

  /**
   * Format the error as a JSON-serializable object
   * @returns An object representation of the error
   */
  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp,
    };

    // Handle original error serialization
    if (this.originalError) {
      if (this.originalError instanceof Error) {
        result.originalError = {
          name: this.originalError.name,
          message: this.originalError.message,
          stack: this.originalError.stack,
        };
      } else {
        // Try to serialize the original error
        try {
          result.originalError = JSON.parse(JSON.stringify(this.originalError));
        } catch {
          result.originalError = String(this.originalError);
        }
      }
    }

    return result;
  }

  /**
   * Print a formatted error message to the console
   */
  print(): void {
    console.error(
      chalk.red.bold("[TryCatchError]") + " " + chalk.yellow(this.message),
    );

    console.error(
      chalk.gray(`Timestamp: ${new Date(this.timestamp).toISOString()}`),
    );

    if (this.originalError instanceof Error) {
      console.error(
        chalk.red.bold("Original Error:"),
        chalk.yellow(this.originalError.message),
      );
      if (this.originalError.stack) {
        console.error(
          chalk.gray(this.originalError.stack.split("\n").slice(1).join("\n")),
        );
      }
    } else if (
      this.originalError !== null &&
      this.originalError !== undefined
    ) {
      console.error(chalk.red.bold("Original Error:"), this.originalError);
    }
  }

  /**
   * Create a TryCatchError from a serialized object (useful for errors transmitted over network)
   * @param serialized The serialized error object
   * @returns A new TryCatchError instance
   */
  static fromJSON(serialized: Record<string, unknown>): TryCatchError {
    const originalError: Error = new Error(
      serialized.originalError?.toString() || "Unknown error",
    );
    const error = new TryCatchError(
      originalError,
      serialized.message as string,
    );

    // Override the timestamp if provided
    if (typeof serialized.timestamp === "number") {
      Object.defineProperty(error, "timestamp", {
        value: serialized.timestamp,
        writable: false,
      });
    }

    return error;
  }

  /**
   * Type guard to check if an error is an instance of TryCatchError
   * @param error The value to check
   * @returns True if the value is an instance of TryCatchError
   */
  static isInstance(error: unknown): error is TryCatchError {
    return error instanceof TryCatchError;
  }
}
