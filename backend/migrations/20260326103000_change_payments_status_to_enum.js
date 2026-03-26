/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('payments');
  if (!hasTable) return;

  const hasStatus = await knex.schema.hasColumn('payments', 'status');
  if (!hasStatus) return;

  await knex.raw(`
    UPDATE payments
    SET status = CASE
      WHEN status IS NULL OR TRIM(status) = '' THEN 'pending'
      WHEN LOWER(status) IN ('pending', 'paid', 'success', 'completed', 'failed') THEN LOWER(status)
      ELSE 'pending'
    END
  `);

  await knex.raw(`
    ALTER TABLE payments
    MODIFY COLUMN status ENUM('pending', 'paid', 'success', 'completed', 'failed')
    NOT NULL
    DEFAULT 'pending'
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasTable = await knex.schema.hasTable('payments');
  if (!hasTable) return;

  const hasStatus = await knex.schema.hasColumn('payments', 'status');
  if (!hasStatus) return;

  await knex.raw(`
    ALTER TABLE payments
    MODIFY COLUMN status VARCHAR(50)
    NULL
  `);
};
