/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('issue_img');
  if (!exists) {
    return knex.schema.createTable('issue_img', function(table) {
      table.increments('id').unsigned().primary();
      table.integer('booking_id').unsigned().notNullable().index();
      table.specificType('image', 'longblob').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table
        .foreign('booking_id')
        .references('id')
        .inTable('bookings')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('issue_img');
};
