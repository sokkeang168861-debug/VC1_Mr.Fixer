/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('payments', function(table) {
    table.increments('id').primary();
    table.integer('booking_id').unsigned().notNullable()
      .references('id').inTable('bookings').onDelete('CASCADE');
    table.decimal('amount', 10, 2);
    table.string('payment_method', 50);
    table.string('status', 50);
    table.string('transaction_id', 255);
    table.timestamp('paid_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('payments');
};
