/**
 * ─── Structured Logger ─────────────────────────────────────────────
 * Thin wrapper over console.* that adds structured context.
 * In Cloudflare Workers, console.log/error go to `wrangler tail`
 * and Workers Logpush — this module adds phase + ticker context
 * for debugging production issues without exposing stack traces.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    phase: string;
    message: string;
    ticker?: string;
    durationMs?: number;
}

/** Structured logger — outputs JSON for machine-parseable logs */
export const logger = {
    debug(phase: string, message: string, meta?: Partial<LogEntry>) {
        // Debug logs are no-ops in production (Workers strips them anyway)
        if (typeof globalThis !== 'undefined' && (globalThis as Record<string, unknown>).__DEV__) {
            console.log(JSON.stringify({ level: 'debug', phase, message, ...meta }));
        }
    },

    info(phase: string, message: string, meta?: Partial<LogEntry>) {
        console.log(JSON.stringify({ level: 'info', phase, message, ...meta }));
    },

    warn(phase: string, message: string, meta?: Partial<LogEntry>) {
        console.warn(JSON.stringify({ level: 'warn', phase, message, ...meta }));
    },

    error(phase: string, message: string, err?: unknown, meta?: Partial<LogEntry>) {
        const errorMessage = err instanceof Error ? err.message : String(err ?? '');
        console.error(JSON.stringify({
            level: 'error',
            phase,
            message,
            error: errorMessage,
            ...meta,
        }));
    },
};
