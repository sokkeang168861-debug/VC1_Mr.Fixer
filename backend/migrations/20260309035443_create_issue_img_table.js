exports.up = function(knex) {
  return knex.schema.createTable('issue_img', (table) => {
    table.increments('id').unsigned().primary();

    table
      .integer('booking_id')
      .unsigned()
      .notNullable()
      .index();

    table
      .binary('image')   // ✅ FIXED (no 'long')
      .notNullable();

    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .foreign('booking_id')
      .references('id')
      .inTable('bookings')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('issue_img');
};