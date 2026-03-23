/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable("users");
  if (!hasTable) return;

  const hasEmailNotifications = await knex.schema.hasColumn("users", "email_notifications");
  const hasPushNotifications = await knex.schema.hasColumn("users", "push_notifications");
  const hasSmsNotifications = await knex.schema.hasColumn("users", "sms_notifications");

  return knex.schema.alterTable("users", function (table) {
    if (!hasEmailNotifications) {
      table.boolean("email_notifications").defaultTo(1);
    }
    if (!hasPushNotifications) {
      table.boolean("push_notifications").defaultTo(1);
    }
    if (!hasSmsNotifications) {
      table.boolean("sms_notifications").defaultTo(0);
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const hasTable = await knex.schema.hasTable("users");
  if (!hasTable) return;

  const hasEmailNotifications = await knex.schema.hasColumn("users", "email_notifications");
  const hasPushNotifications = await knex.schema.hasColumn("users", "push_notifications");
  const hasSmsNotifications = await knex.schema.hasColumn("users", "sms_notifications");

  return knex.schema.alterTable("users", function (table) {
    if (hasEmailNotifications) {
      table.dropColumn("email_notifications");
    }
    if (hasPushNotifications) {
      table.dropColumn("push_notifications");
    }
    if (hasSmsNotifications) {
      table.dropColumn("sms_notifications");
    }
  });
};
