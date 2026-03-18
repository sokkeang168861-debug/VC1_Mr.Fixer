/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('bookings');
  if (!exists) {
    return knex.schema.createTable('bookings', function (table) {
      table.increments('id').primary();
      table.integer('customer_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.integer('service_id').unsigned().notNullable()
        .references('id').inTable('services').onDelete('CASCADE');
      table.text('service_address');
      table.decimal('latitude', 10, 8);
      table.decimal('longitude', 11, 8);
      table.text('issue_description');
      table.enu('urgent_level', [
        'low',
        'medium',
        'high'
      ]).defaultTo('low');
      table.enu('status', [
        'pending',
        'customer_reject',
        'fixer_reject',
        'fixer_accept',
        'customer_accept',
        'complete'
      ]).defaultTo('pending');
      table.decimal('service_fee', 10, 2);
      table.text('cancellation_reason');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.datetime('scheduled_at');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('bookings');
};
