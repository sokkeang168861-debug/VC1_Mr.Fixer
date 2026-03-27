/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('service_providers');
  if (!hasTable) return;

  const hasOldColumn = await knex.schema.hasColumn('service_providers', 'is_actice');
  const hasNewColumn = await knex.schema.hasColumn('service_providers', 'is_active');

  if (hasOldColumn && !hasNewColumn) {
    await knex.schema.alterTable('service_providers', table => {
      table.renameColumn('is_actice', 'is_active');
    });
    return;
  }

  if (!hasOldColumn && !hasNewColumn) {
    await knex.schema.alterTable('service_providers', table => {
      table.boolean('is_active').defaultTo(1);
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

  const hasOldColumn = await knex.schema.hasColumn('service_providers', 'is_actice');
  const hasNewColumn = await knex.schema.hasColumn('service_providers', 'is_active');

  if (!hasOldColumn && hasNewColumn) {
    await knex.schema.alterTable('service_providers', table => {
      table.renameColumn('is_active', 'is_actice');
    });
  }
};
