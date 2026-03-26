/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('bookings');
  if (!hasTable) return;

  const hasLatitude = await knex.schema.hasColumn('bookings', 'latitude');
  const hasLongitude = await knex.schema.hasColumn('bookings', 'longitude');

  return knex.schema.alterTable('bookings', function(table) {
    if (!hasLatitude) {
      table.decimal('latitude', 10, 8).nullable();
    }
    if (!hasLongitude) {
      table.decimal('longitude', 11, 8).nullable();
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasTable = await knex.schema.hasTable('bookings');
  if (!hasTable) return;

  const hasLatitude = await knex.schema.hasColumn('bookings', 'latitude');
  const hasLongitude = await knex.schema.hasColumn('bookings', 'longitude');

  return knex.schema.alterTable('bookings', function(table) {
    if (hasLatitude) {
      table.dropColumn('latitude');
    }
    if (hasLongitude) {
      table.dropColumn('longitude');
    }
  });
};
