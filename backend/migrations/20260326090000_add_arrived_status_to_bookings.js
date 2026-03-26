/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('bookings');
  if (!hasTable) return;

  await knex.schema.raw(`
    ALTER TABLE bookings
    MODIFY COLUMN status ENUM(
      'pending',
      'customer_reject',
      'fixer_reject',
      'fixer_accept',
      'customer_accept',
      'arrived',
      'complete'
    ) DEFAULT 'pending'
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasTable = await knex.schema.hasTable('bookings');
  if (!hasTable) return;

  await knex('bookings')
    .where('status', 'arrived')
    .update({ status: 'customer_accept' });

  await knex.schema.raw(`
    ALTER TABLE bookings
    MODIFY COLUMN status ENUM(
      'pending',
      'customer_reject',
      'fixer_reject',
      'fixer_accept',
      'customer_accept',
      'complete'
    ) DEFAULT 'pending'
  `);
};
