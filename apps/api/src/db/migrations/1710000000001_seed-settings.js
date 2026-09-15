/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO settings (key, value) VALUES
      ('max_members_per_instructor', '25'),
      ('subscription_grace_period_days', '3')
    ON CONFLICT (key) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM settings WHERE key IN ('max_members_per_instructor', 'subscription_grace_period_days');
  `);
};
