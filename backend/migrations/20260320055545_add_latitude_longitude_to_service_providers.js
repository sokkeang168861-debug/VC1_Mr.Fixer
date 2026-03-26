/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('service_providers');
  if (!hasTable) return;

  await knex.raw(`
    ALTER TABLE service_providers
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) NULL,
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) NULL
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasTable = await knex.schema.hasTable('service_providers');
  if (!hasTable) return;

  await knex.raw(`
    ALTER TABLE service_providers
    DROP COLUMN IF EXISTS latitude,
    DROP COLUMN IF EXISTS longitude
  `);
};
