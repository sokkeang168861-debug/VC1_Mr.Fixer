/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('bookings', function(table) {
    table.enu('status', [
      'pending',
      'customer_reject',
      'fixer_reject',
      'fixer_accept',
      'customer_accept',
      'complete',
      'missed'
    ]).defaultTo('pending').alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('bookings', function(table) {
    table.enu('status', [
      'pending',
      'customer_reject',
      'fixer_reject',
      'fixer_accept',
      'customer_accept',
      'complete'
    ]).defaultTo('pending').alter();
  });
};
