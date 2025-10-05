export function pick<T extends Record<string, any>>(obj: T | null | undefined, fields: Array<keyof T>): Partial<T> | null {
  if (!obj) return null;
  const out: Partial<T> = {};
  for (const f of fields) {
    if (f in obj) out[f] = obj[f];
  }
  return out;
}

export function omit<T extends Record<string, any>>(obj: T | null | undefined, fields: Array<keyof T>): Partial<T> | null {
  if (!obj) return null;
  const out: Partial<T> = {};
  for (const k of Object.keys(obj) as Array<keyof T>) {
    if (!fields.includes(k)) out[k] = obj[k];
  }
  return out;
}
