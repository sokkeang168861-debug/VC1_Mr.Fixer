/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('services');
  if (!exists) {
    return knex.schema.createTable('services', function(table) {
      table.increments('id').primary();
      table.integer('provider_id').unsigned().notNullable()
        .references('id').inTable('service_providers').onDelete('CASCADE');
      table.integer('category_id').unsigned().notNullable()
        .references('id').inTable('service_categories').onDelete('CASCADE');
      table.boolean('is_active').defaultTo(1);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('services');
};
