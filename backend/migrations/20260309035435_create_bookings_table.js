/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('bookings', function(table) {
    table.increments('id').primary();
    table.integer('customer_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('service_id').unsigned().notNullable()
      .references('id').inTable('services').onDelete('CASCADE');
    table.text('service_address');
    table.text('issue_description');
    table.string('status', 50);
    table.string('rejected_by', 255);
    table.decimal('service_fee', 10, 2);
    table.decimal('proposed_price', 10, 2);
    table.decimal('final_price', 10, 2);
    table.specificType('proposal_notes', 'mediumblob');
    table.specificType('receipt', 'mediumblob');
    table.text('cancellation_reason');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.datetime('scheduled_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('bookings');
};
