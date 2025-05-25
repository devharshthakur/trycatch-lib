import { TryCatchError } from "@/errors/TryCatchError";
import { describe, it, expect } from "vitest";

describe("TryCatchError", () => {
  it("should create error with custom message", () => {
    const customErrorMessage: string = "Custom Error Message";
    const originalError = new Error("Original error");
    const trycatchError = new TryCatchError(originalError, customErrorMessage);

    expect(trycatchError.name).toBe("TryCatchError");
    expect(trycatchError.message).toBe(customErrorMessage);
    expect(trycatchError.originalError).toBe(originalError);
    expect(trycatchError.timestamp).toBeTypeOf("number");
  });

  it("should use original error message when no custom message provided", () => {
    const originalError = new Error("Original error message");
    const trycatchError = new TryCatchError(originalError);

    expect(trycatchError.message).toBe("Original error message");
    expect(trycatchError.originalError).toBe(originalError);
  });

  it("should handle non-Error objects as unexpected error", () => {
    const originalError = "String error";
    const trycatchError = new TryCatchError(originalError);

    expect(trycatchError.originalError).toBe(originalError);
    expect(trycatchError.message).toBe("An unexpected error occurred");
  });

  it("should set timestamp correctly", () => {
    const beforeTimeStamp = Date.now();
    const trycatchError = new TryCatchError(new Error("Test"));
    const afterTimeStamp = Date.now();

    expect(trycatchError.timestamp).toBeGreaterThanOrEqual(beforeTimeStamp);
    expect(trycatchError.timestamp).toBeLessThanOrEqual(afterTimeStamp);
  });

  it("should handle null and undefined original errors", () => {
    const nullError = new TryCatchError(null);
    const undefinedError = new TryCatchError(undefined);

    expect(nullError.message).toBe("An unexpected error occurred");
    expect(undefinedError.message).toBe("An unexpected error occurred");
    expect(nullError.originalError).toBeNull();
    expect(undefinedError.originalError).toBeUndefined();
  });
});
