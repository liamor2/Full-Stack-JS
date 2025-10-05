export function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]) {
  const out: Partial<T> = {};
  for (const k of keys) {
    if (k in obj) out[k] = obj[k];
  }
  return out as Pick<T, K>;
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]) {
  const out: Partial<T> = {};
  for (const k of Object.keys(obj) as Array<keyof T>) {
    if (!keys.includes(k as K)) out[k] = obj[k];
  }
  return out as Omit<T, K>;
}
