/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('bookings');
  if (!hasTable) return;

  const hasLatitude = await knex.schema.hasColumn('bookings', 'latitude');
  if (!hasLatitude) {
    await knex.schema.alterTable('bookings', table => {
      table.decimal('latitude', 10, 8).nullable();
    });
  }

  const hasLongitude = await knex.schema.hasColumn('bookings', 'longitude');
  if (!hasLongitude) {
    await knex.schema.alterTable('bookings', table => {
      table.decimal('longitude', 11, 8).nullable();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasTable = await knex.schema.hasTable('bookings');
  if (!hasTable) return;

  const hasLatitude = await knex.schema.hasColumn('bookings', 'latitude');
  if (hasLatitude) {
    await knex.schema.alterTable('bookings', table => {
      table.dropColumn('latitude');
    });
  }

  const hasLongitude = await knex.schema.hasColumn('bookings', 'longitude');
  if (hasLongitude) {
    await knex.schema.alterTable('bookings', table => {
      table.dropColumn('longitude');
    });
  }
};
