/**
 * Custom error class used to indicate that a synchronous function
 * could not be converted to an asynchronous function.
 *
 * This error is thrown by the `makeAsync` utility when it detects
 * that the provided function may already be asynchronous, preventing
 * the conversion to an async function.
 *
 * @extends Error
 *
 * @property {string} name - The name of the error, always set to "MakeAsyncError".
 * @property {string} message - A descriptive message explaining why the conversion failed.
 */
import chalk from "chalk";
import { Signale } from "signale";

// Initialize signale with custom types
const signale = new Signale({
  types: {
    error: {
      badge: "✖",
      color: "red",
      label: "trycatch-lib error",
    },
    info: {
      badge: "ℹ",
      color: "blue",
      label: "solution",
    },
  },
});

export class MakeAsyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MakeAsyncError";
  }

  /**
   * Prints a formatted error message to the console with distinct styling
   * using chalk and signale for enhanced readability.
   */
  printError(): void {
    // Header
    console.error(
      chalk.bgRed.white.bold(" trycatch-lib ") +
        " " +
        chalk.red.bold("MakeAsyncError: ") +
        chalk.white(this.message),
    );

    // Detailed message with signale
    signale.error(this.message);
    signale.info(
      "Only pass synchronous functions to makeAsync(). For async functions, use trycatch() directly.",
    );
  }

  /**
   * Returns a formatted string representation of the error.
   */
  toString(): string {
    return `[trycatch-lib] ${this.name}: ${this.message}`;
  }
}
