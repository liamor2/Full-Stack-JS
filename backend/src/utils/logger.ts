import pino from "pino";

export const rootLogger = pino({ level: process.env.LOG_LEVEL || "info", transport: { target: "pino-pretty", options: { colorize: true } } });

export type RequestLogger = pino.Logger;

export function createRequestLogger(context: { requestId?: string; method?: string; url?: string }): RequestLogger {
  const meta: Record<string, string> = {};
  if (context.requestId) meta.requestId = context.requestId;
  if (context.method) meta.method = context.method;
  if (context.url) meta.url = context.url;
  return rootLogger.child(meta);
}

export default { rootLogger, createRequestLogger };
