exports.up = (pgm) => {
    // Optional: add last_used_at for sliding expiry (future-proof)
    pgm.addColumns('auth_sessions', {
        last_used_at: {
            type: 'timestamp',
            default: pgm.func('now()'),
            notNull: true,
        },
        // Optional: fingerprint TEXT for device binding
        fingerprint: { type: 'text' },
    });

    // Indexes (performance + security against table scans)
    pgm.createIndex('users', 'email'); // already unique, but explicit
    pgm.createIndex('auth_sessions', 'user_id'); // already there
    pgm.createIndex('auth_sessions', 'expires_at'); // already there
    pgm.createIndex('auth_sessions', 'last_used_at'); // if added
};

exports.down = (pgm) => {
    pgm.dropColumns('auth_sessions', ['last_used_at', 'fingerprint']);
    // drop indexes if needed, but usually not reversed
};