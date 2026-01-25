exports.up = (pgm) => {
    pgm.dropColumn('auth_sessions', 'token_hash', { ifExists: true });
};

exports.down = (pgm) => {
    // no-op (token_hash intentionally removed forever)
};
