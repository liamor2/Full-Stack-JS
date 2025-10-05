export function greet(name: string): string {
  return `Hello, ${name}! (from shared package)`;
}

export const VERSION = "0.0.1";

export * from "./types/auth.js";
export * from "./validation/auth.js";
export * from "./api/contracts.js";
export * from "./utils.js";
