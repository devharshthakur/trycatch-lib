import { describe, it, expect } from "vitest";
import { trycatch } from "@/core/trycatch.js";
import { TryCatchError } from "@/errors/TryCatchError.js";

describe("trycatch", () => {
  describe("success cases", () => {
    it("should return success case tuple for sync function", async () => {
      const fn = (x: number, y: number): number => x + y;
      const wrappedFn = trycatch(fn);

      const [result, error] = await wrappedFn(2, 3);

      expect(result).toBe(5);
      expect(error).toBeNull();
    });

    it("should return success case tuple for async function", async () => {
      const fn = async (x: number): Promise<number> => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(x * 2), 10);
        });
      };
      const wrappedFn = trycatch(fn);

      const [result, error] = await wrappedFn(5);

      expect(result).toBe(10);
      expect(error).toBeNull();
    });

    it("should handle functions returning complex objects", async () => {
      const fn = (name: string): { user: { name: string; id: number } } => ({
        user: { name, id: Math.random() },
      });
      const wrappedFn = trycatch(fn);

      const [result, error] = await wrappedFn("Harsh");

      expect(result).toMatchObject({
        user: { name: "Harsh", id: expect.any(Number) },
      });
      expect(error).toBeNull();
    });

    it("should handle functions with no return value", async () => {
      const fn = (): void => {
        // Side effect function
      };
      const wrappedFn = trycatch(fn);

      const [result, error] = await wrappedFn();

      expect(result).toBeUndefined();
      expect(error).toBeNull();
    });
  });

  describe("error cases", () => {
    it("should return error tuple for sync function that throws", async () => {
      const fn = (): never => {
        throw new Error("Sync error");
      };
      const wrappedFn = trycatch(fn);

      const [result, error] = await wrappedFn();

      expect(result).toBeNull();
      expect(error).toBeInstanceOf(TryCatchError);
      expect(error?.message).toBe("Sync error");
      expect(error?.originalError).toBeInstanceOf(Error);
    });

    it("should return error tuple for async function that rejects", async () => {
      const fn = async (): Promise<never> => {
        throw new Error("Async error");
      };
      const wrappedFn = trycatch(fn);

      const [result, error] = await wrappedFn();

      expect(result).toBeNull();
      expect(error).toBeInstanceOf(TryCatchError);
      expect(error?.message).toBe("Async error");
    });

    it("should handle non-Error throws", async () => {
      const fn = (): never => {
        throw "String error";
      };
      const wrappedFn = trycatch(fn);

      const [result, error] = await wrappedFn();

      expect(result).toBeNull();
      expect(error).toBeInstanceOf(TryCatchError);
      expect(error?.originalError).toBe("String error");
      expect(error?.message).toBe("An unexpected error occurred");
    });

    it("should handle thrown objects", async () => {
      const fn = (): never => {
        throw { code: 500, message: "Server error" };
      };
      const wrappedFn = trycatch(fn);

      const [result, error] = await wrappedFn();

      expect(result).toBeNull();
      expect(error).toBeInstanceOf(TryCatchError);
      expect(error?.originalError).toEqual({
        code: 500,
        message: "Server error",
      });
    });

    it("should handle null/undefined throws", async () => {
      const fnNull = (): never => {
        throw null;
      };
      const fnUndefined = (): never => {
        throw undefined;
      };

      const wrappedNull = trycatch(fnNull);
      const wrappedUndefined = trycatch(fnUndefined);

      const [resultNull, errorNull] = await wrappedNull();
      const [resultUndefined, errorUndefined] = await wrappedUndefined();

      expect(resultNull).toBeNull();
      expect(errorNull?.originalError).toBeNull();
      expect(resultUndefined).toBeNull();
      expect(errorUndefined?.originalError).toBeUndefined();
    });
  });

  describe("parameter handling", () => {
    it("should correctly pass through multiple parameters", async () => {
      const fn = (a: string, b: number, c: boolean): string => {
        return `${a}-${b}-${c}`;
      };
      const wrappedFn = trycatch(fn);

      const [result, error] = await wrappedFn("test", 42, true);

      expect(result).toBe("test-42-true");
      expect(error).toBeNull();
    });

    it("should handle functions with complex parameter types", async () => {
      interface User {
        name: string;
        age: number;
      }

      const fn = (users: User[], filter: (u: User) => boolean): User[] => {
        return users.filter(filter);
      };
      const wrappedFn = trycatch(fn);

      const users = [
        { name: "Alice", age: 25 },
        { name: "Bob", age: 30 },
      ];
      const filter = (u: User): boolean => u.age > 26;

      const [result, error] = await wrappedFn(users, filter);

      expect(result).toEqual([{ name: "Bob", age: 30 }]);
      expect(error).toBeNull();
    });
  });
});
