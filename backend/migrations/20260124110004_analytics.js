exports.up = (pgm) => {
    pgm.createTable(
        'analytics',
        {
            event_id: { type: 'uuid', primaryKey: true },
            short_code: { type: 'varchar(8)', notNull: true },
            timestamp: { type: 'timestamp', notNull: true },
            ip_hash: { type: 'varchar(64)', notNull: true },
            user_agent: { type: 'varchar(500)' },
            referer: { type: 'text' },
            country: { type: 'char(2)' },
            device_type: { type: 'varchar(10)' },
            is_bot: { type: 'boolean' }
        },
        {
            partitionBy: 'RANGE (timestamp)'
        }
    );
};

exports.down = (pgm) => {
    pgm.dropTable('analytics');
};
