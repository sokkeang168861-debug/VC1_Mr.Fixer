/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('issue_img', (table) => {
    table.increments('id').unsigned().primary();              // INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY

    table
      .integer('booking_id')
      .unsigned()
      .notNullable()
      .index();                                               // good for lookups by booking

    table
      .longblob('image')
      .notNullable();                                         // LONG BLOB for storing binary image data

    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());                              // DEFAULT CURRENT_TIMESTAMP

    // Foreign key constraint
    table
      .foreign('booking_id')
      .references('id')
      .inTable('bookings')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('issue_img');
};
