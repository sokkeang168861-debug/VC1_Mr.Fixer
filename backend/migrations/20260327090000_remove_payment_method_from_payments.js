/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('payments');
  if (!hasTable) return;

  const hasPaymentMethod = await knex.schema.hasColumn('payments', 'payment_method');
  if (!hasPaymentMethod) return;

  await knex.schema.alterTable('payments', table => {
    table.dropColumn('payment_method');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasTable = await knex.schema.hasTable('payments');
  if (!hasTable) return;

  const hasPaymentMethod = await knex.schema.hasColumn('payments', 'payment_method');
  if (hasPaymentMethod) return;

  await knex.schema.alterTable('payments', table => {
    table.string('payment_method', 50);
  });
};
