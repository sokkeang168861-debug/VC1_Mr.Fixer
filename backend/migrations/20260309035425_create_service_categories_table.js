/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('service_categories');
  if (!exists) {
    return knex.schema.createTable('service_categories', function(table) {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.text('description');
      table.boolean('is_active').defaultTo(1);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.specificType('image', 'longblob');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('service_categories');
};
