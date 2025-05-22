/**
 * Custom error class used for errors in the makeAsync utility.
 *
 * @extends Error
 *
 * @property {string} name - The name of the error, always set to "MakeAsyncError".
 * @property {string} message - A descriptive message explaining the error.
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
    signale.info("Check the documentation for proper usage of makeAsync().");
  }

  /**
   * Returns a formatted string representation of the error.
   */
  toString(): string {
    return `[trycatch-lib] ${this.name}: ${this.message}`;
  }
}
