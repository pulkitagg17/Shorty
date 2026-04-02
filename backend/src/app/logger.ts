import { randomUUID } from 'crypto';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogContext = Record<string, unknown>;

function write(level: LogLevel, message: string, context: LogContext = {}) {
    const payload = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...context,
    };

    const line = JSON.stringify(payload);

    if (level === 'error') {
        console.error(line);
        return;
    }

    if (level === 'warn') {
        console.warn(line);
        return;
    }

    console.log(line);
}

export function createRequestId() {
    return randomUUID();
}

export const logger = {
    debug(message: string, context?: LogContext) {
        write('debug', message, context);
    },
    info(message: string, context?: LogContext) {
        write('info', message, context);
    },
    warn(message: string, context?: LogContext) {
        write('warn', message, context);
    },
    error(message: string, context?: LogContext) {
        write('error', message, context);
    },
};
