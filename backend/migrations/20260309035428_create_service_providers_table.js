/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('service_providers');
  if (!exists) {
    return knex.schema.createTable('service_providers', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.string('company_name', 255);
      table.text('bio');
      table.string('location', 255);
      table.integer('experience');
      table.boolean('is_verified').defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('service_providers');
};
