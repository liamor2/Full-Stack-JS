/**
 * Return a new object containing only the specified keys from `obj`.
 *
 * This function is intentionally typed to operate on Record<string, unknown>
 * to avoid leaking `any` into callers. It is a small, zero-dependency
 * helper intended for DTO shaping and test utilities.
 *
 * @param obj  - source object
 * @param keys - keys to pick from the source
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]) {
  const out: Partial<T> = {};
  for (const k of keys) {
    if (k in obj) out[k] = obj[k];
  }
  return out as Pick<T, K>;
}

/**
 * Return a shallow copy of `obj` with the provided keys removed.
 *
 * Useful for removing sensitive fields from objects before sending them to
 * clients (for example removing passwords). The function returns a typed
 * Omit<T, K> to help callers maintain type-safety.
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]) {
  const out: Partial<T> = {};
  for (const k of Object.keys(obj) as Array<keyof T>) {
    if (!keys.includes(k as K)) out[k] = obj[k];
  }
  return out as Omit<T, K>;
}
