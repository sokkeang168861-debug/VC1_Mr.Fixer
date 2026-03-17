/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('reviews');
  if (!exists) {
    return knex.schema.createTable('reviews', function(table) {
      table.increments('id').primary();
      table.integer('booking_id').unsigned().notNullable()
        .references('id').inTable('bookings').onDelete('CASCADE');
      
      table.tinyint('speed_rating');
      table.tinyint('quality_rating');
      table.tinyint('price_fairness_rating');
      table.tinyint('behavior_rating');
      table.tinyint('overall_rating').notNullable();
      
      table.text('comment');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      // Add check constraints
      table.check('speed_rating >= 1 AND speed_rating <= 5', [], 'reviews_speed_rating_check');
      table.check('quality_rating >= 1 AND quality_rating <= 5', [], 'reviews_quality_rating_check');
      table.check('price_fairness_rating >= 1 AND price_fairness_rating <= 5', [], 'reviews_price_fairness_rating_check');
      table.check('behavior_rating >= 1 AND behavior_rating <= 5', [], 'reviews_behavior_rating_check');
      table.check('overall_rating >= 1 AND overall_rating <= 5', [], 'reviews_overall_rating_check');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('reviews');
};
