exports.up = (pgm) => {
    pgm.createTable('users', {
        id: { type: 'uuid', primaryKey: true },
        email: { type: 'varchar(255)', notNull: true, unique: true },
        password_hash: { type: 'varchar(255)', notNull: true },
        custom_aliases_used: { type: 'int', default: 0 },
        created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') }
    });
};

exports.down = (pgm) => {
    pgm.dropTable('users');
};
