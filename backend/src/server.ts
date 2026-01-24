import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { pool } from './infra/database';
import { redis } from './infra/redis';
import { analyticsWorker } from './analytics/analytics.worker';
import './analytics/queue.monitor';

const app = createApp();
const port = Number(env.PORT);

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});

let shuttingDown = false;

async function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`🛑 ${signal} received. Shutting down...`);

    const forceExit = setTimeout(() => {
        console.error('❌ Forced shutdown');
        process.exit(1);
    }, 10_000);

    try {
        server.close();                 // stop new requests
        await analyticsWorker.close();  // stop worker
        await redis.quit();             // close redis
        await pool.end();               // close postgres

        clearTimeout(forceExit);
        console.log('✅ Graceful shutdown complete');
        process.exit(0);
    } catch (err) {
        console.error('❌ Shutdown error', err);
        process.exit(1);
    }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception', error);
    process.exit(1);
});
