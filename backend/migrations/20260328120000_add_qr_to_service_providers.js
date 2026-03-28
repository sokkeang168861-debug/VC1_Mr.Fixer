/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('service_providers');
  if (!hasTable) return;

  const hasQrColumn = await knex.schema.hasColumn('service_providers', 'qr');
  if (hasQrColumn) return;

  await knex.schema.alterTable('service_providers', table => {
    table.specificType('qr', 'longblob').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasTable = await knex.schema.hasTable('service_providers');
  if (!hasTable) return;

  const hasQrColumn = await knex.schema.hasColumn('service_providers', 'qr');
  if (!hasQrColumn) return;

  await knex.schema.alterTable('service_providers', table => {
    table.dropColumn('qr');
  });
};
