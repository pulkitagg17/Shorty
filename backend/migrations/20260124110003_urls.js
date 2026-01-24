exports.up = (pgm) => {
    pgm.createTable('urls', {
        id: { type: 'uuid', primaryKey: true },
        user_id: {
            type: 'uuid',
            references: 'users(id)',
            onDelete: 'cascade'
        },
        short_code: { type: 'char(8)', notNull: true, unique: true },
        long_url: { type: 'text', notNull: true },
        custom_alias: { type: 'varchar(20)' },
        expiry_at: { type: 'timestamp' },
        created_at: { type: 'timestamp', default: pgm.func('now()') },
        updated_at: { type: 'timestamp', default: pgm.func('now()') }
    });

    pgm.addConstraint(
        'urls',
        'unique_user_alias',
        'UNIQUE(user_id, custom_alias)'
    );

    pgm.createIndex('urls', ['user_id', 'created_at']);
    pgm.createIndex('urls', ['expiry_at']);
};

exports.down = (pgm) => {
    pgm.dropTable('urls');
};
