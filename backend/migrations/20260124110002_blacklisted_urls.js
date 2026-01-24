exports.up = (pgm) => {
    pgm.createTable('blacklisted_urls', {
        id: 'id',
        pattern: { type: 'text', notNull: true },
        reason: { type: 'text' },
        created_at: { type: 'timestamp', default: pgm.func('now()') }
    });
};

exports.down = (pgm) => {
    pgm.dropTable('blacklisted_urls');
};
