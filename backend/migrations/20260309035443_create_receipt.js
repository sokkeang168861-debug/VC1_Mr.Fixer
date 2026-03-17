exports.up = function (knex) {
  return knex.schema.createTable("receipt", function (table) {
    table.increments("id").primary();
    table.integer("booking_id").unsigned().notNullable();
    table.string("name");
    table.decimal("price", 10, 2);

    table
      .foreign("booking_id")
      .references("id")
      .inTable("bookings")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("receipt");
};