/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('issue_img');

  if (!hasTable) {
    return;
  }

  await knex.raw(`
    ALTER TABLE issue_img
    MODIFY COLUMN image LONGBLOB NOT NULL
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasTable = await knex.schema.hasTable('issue_img');

  if (!hasTable) {
    return;
  }

  await knex.raw(`
    ALTER TABLE issue_img
    MODIFY COLUMN image BLOB NOT NULL
  `);
};
