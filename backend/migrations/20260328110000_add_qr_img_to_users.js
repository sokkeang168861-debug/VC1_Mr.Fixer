/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable("users");
  if (!hasTable) {
    return;
  }

  const hasQrImg = await knex.schema.hasColumn("users", "qr_img");
  if (!hasQrImg) {
    await knex.schema.alterTable("users", (table) => {
      table.specificType("qr_img", "longblob");
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const hasTable = await knex.schema.hasTable("users");
  if (!hasTable) {
    return;
  }

  const hasQrImg = await knex.schema.hasColumn("users", "qr_img");
  if (hasQrImg) {
    await knex.schema.alterTable("users", (table) => {
      table.dropColumn("qr_img");
    });
  }
};
