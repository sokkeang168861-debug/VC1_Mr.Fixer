/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable("proposal_price");
  if (!exists) {
    return knex.schema.createTable("proposal_price", function(table) {
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
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists("proposal_price");
};
