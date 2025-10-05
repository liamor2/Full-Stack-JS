import { pino } from "pino";
import type { Logger } from "pino";

export const rootLogger = pino({ level: process.env.LOG_LEVEL || "info", transport: { target: "pino-pretty", options: { colorize: true } } });

export type RequestLogger = Logger;

/**
 * Create a request-scoped child logger.
 *
 * This function creates a pino child logger that includes a small set of
 * contextual bindings (requestId, method, url). Use the returned logger for
 * structured logging inside request handlers and middleware.
 *
 * @param context - Partial request metadata to bind to the child logger.
 * @returns A pino Logger instance with the provided bindings.
 */
export function createRequestLogger(context: { requestId?: string; method?: string; url?: string }): RequestLogger {
  const meta: Record<string, string> = {};
  if (context.requestId) meta.requestId = context.requestId;
  if (context.method) meta.method = context.method;
  if (context.url) meta.url = context.url;
  return rootLogger.child(meta);
}

export default { rootLogger, createRequestLogger };
