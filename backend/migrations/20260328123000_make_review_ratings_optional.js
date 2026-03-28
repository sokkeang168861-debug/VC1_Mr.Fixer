/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable("reviews");
  if (!hasTable) {
    return;
  }

  await knex.raw(`
    ALTER TABLE reviews
    MODIFY speed_rating TINYINT NULL,
    MODIFY quality_rating TINYINT NULL,
    MODIFY price_fairness_rating TINYINT NULL,
    MODIFY behavior_rating TINYINT NULL,
    MODIFY overall_rating TINYINT NULL
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const hasTable = await knex.schema.hasTable("reviews");
  if (!hasTable) {
    return;
  }

  await knex.raw(`
    UPDATE reviews
    SET
      speed_rating = COALESCE(speed_rating, 1),
      quality_rating = COALESCE(quality_rating, 1),
      price_fairness_rating = COALESCE(price_fairness_rating, 1),
      behavior_rating = COALESCE(behavior_rating, 1),
      overall_rating = COALESCE(overall_rating, 1)
  `);

  await knex.raw(`
    ALTER TABLE reviews
    MODIFY speed_rating TINYINT NULL,
    MODIFY quality_rating TINYINT NULL,
    MODIFY price_fairness_rating TINYINT NULL,
    MODIFY behavior_rating TINYINT NULL,
    MODIFY overall_rating TINYINT NOT NULL
  `);
};
