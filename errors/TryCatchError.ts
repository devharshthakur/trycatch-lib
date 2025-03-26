/**
 * Custom error class used by the trycatch function
 * Contains original error for inspection
 */

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
}
