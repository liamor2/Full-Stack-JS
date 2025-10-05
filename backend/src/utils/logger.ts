export type RequestLogger = {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug?: (...args: unknown[]) => void;
};

export function createRequestLogger(context: {
  requestId?: string;
  method?: string;
  url?: string;
}): RequestLogger {
  function prefix() {
    const parts = [] as string[];
    if (context.requestId) parts.push(`[req:${context.requestId}]`);
    if (context.method) parts.push(context.method);
    if (context.url) parts.push(context.url);
    return parts.join(" ") + " -";
  }

  return {
    info: (...args: unknown[]) => console.info(prefix(), ...args),
    error: (...args: unknown[]) => console.error(prefix(), ...args),
    debug: (...args: unknown[]) => console.debug(prefix(), ...args),
  };
}

export default { createRequestLogger };
