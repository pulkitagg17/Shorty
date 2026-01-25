exports.up = (pgm) => {
    pgm.createTable('auth_sessions', {
        id: { type: 'uuid', primaryKey: true },
        user_id: {
            type: 'uuid',
            references: 'users(id)',
            onDelete: 'cascade',
            notNull: true
        },
        expires_at: { type: 'timestamp', notNull: true },
        created_at: { type: 'timestamp', default: pgm.func('now()') }
    });

    pgm.createIndex('auth_sessions', ['user_id']);
    pgm.createIndex('auth_sessions', ['expires_at']);
};
