import { Pool } from 'pg';
import { dbConfig } from '../config/database';

export const pool = new Pool({
    connectionString: dbConfig.connectionString,
    max: 20,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
});
