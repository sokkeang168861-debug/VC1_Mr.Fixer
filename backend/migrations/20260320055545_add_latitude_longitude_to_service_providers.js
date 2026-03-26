/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('service_providers');
  if (!hasTable) return;

  const hasLatitude = await knex.schema.hasColumn('service_providers', 'latitude');
  if (!hasLatitude) {
    await knex.schema.alterTable('service_providers', table => {
      table.decimal('latitude', 10, 8).nullable();
    });
  }

  const hasLongitude = await knex.schema.hasColumn('service_providers', 'longitude');
  if (!hasLongitude) {
    await knex.schema.alterTable('service_providers', table => {
      table.decimal('longitude', 11, 8).nullable();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasTable = await knex.schema.hasTable('service_providers');
  if (!hasTable) return;

  const hasLatitude = await knex.schema.hasColumn('service_providers', 'latitude');
  if (hasLatitude) {
    await knex.schema.alterTable('service_providers', table => {
      table.dropColumn('latitude');
    });
  }

  const hasLongitude = await knex.schema.hasColumn('service_providers', 'longitude');
  if (hasLongitude) {
    await knex.schema.alterTable('service_providers', table => {
      table.dropColumn('longitude');
    });
  }
};
