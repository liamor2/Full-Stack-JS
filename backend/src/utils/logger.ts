import { pino } from "pino";
import type { Logger } from "pino";

/**
 * Application root logger instance. Configured to pretty-print when a
 * terminal-friendly transport is available. The log level can be adjusted
 * via the LOG_LEVEL environment variable.
 */
export const rootLogger = pino({ level: process.env.LOG_LEVEL || "info", transport: { target: "pino-pretty", options: { colorize: true } } });

export type RequestLogger = Logger;

/**
 * Create a child logger bound to a specific request.
 *
 * The returned logger will include the provided metadata on every log
 * entry. Use this helper to produce request-scoped logs that are easier to
 * correlate in multi-request environments.
 *
 * @param context - object with optional requestId, method and url.
 */
export function createRequestLogger(context: { requestId?: string; method?: string; url?: string }): RequestLogger {
  const meta: Record<string, string> = {};
  if (context.requestId) meta.requestId = context.requestId;
  if (context.method) meta.method = context.method;
  if (context.url) meta.url = context.url;
  return rootLogger.child(meta);
}

export default { rootLogger, createRequestLogger };
