/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('service_providers');
  if (!exists) {
    return knex.schema.createTable('service_providers', function (table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.string('company_name', 255);
      table.text('bio');
      table.string('location', 255);
      table.integer('experience');
      table.float('speed_rating').checkBetween([1, 5]);
      table.float('quality_rating').checkBetween([1, 5]);
      table.float('price_fairness_rating').checkBetween([1, 5]);
      table.float('behavior_rating').checkBetween([1, 5]);
      table.float('overall_rating').checkBetween([1, 5]);
      table.boolean('is_verified').defaultTo(1);
      table.boolean('is_actice').defaultTo(1);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('service_providers');
};
