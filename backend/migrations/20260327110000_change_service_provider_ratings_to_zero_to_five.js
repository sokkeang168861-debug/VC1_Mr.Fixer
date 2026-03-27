/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const TABLE_NAME = "service_providers";
const RATING_COLUMNS = [
  "speed_rating",
  "quality_rating",
  "price_fairness_rating",
  "behavior_rating",
  "overall_rating",
];

async function updateRatingRange(knex, minValue) {
  for (const column of RATING_COLUMNS) {
    await knex.raw(`
      ALTER TABLE ${TABLE_NAME}
      MODIFY COLUMN ${column} FLOAT
      CHECK (${column} >= ${minValue} AND ${column} <= 5)
    `);
  }
}

exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable(TABLE_NAME);
  if (!hasTable) return;

  await updateRatingRange(knex, 0);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasTable = await knex.schema.hasTable(TABLE_NAME);
  if (!hasTable) return;

  for (const column of RATING_COLUMNS) {
    await knex(TABLE_NAME)
      .whereNotNull(column)
      .andWhere(column, "<", 1)
      .update({ [column]: 1 });
  }

  await updateRatingRange(knex, 1);
};
