const bcrypt = require("bcrypt");

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function seed(knex) {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@mrfixer.com").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "secret123";
  const fullName = (process.env.SEED_ADMIN_FULL_NAME || "Admin User").trim();
  const phone = (process.env.SEED_ADMIN_PHONE || "0812345678").trim();
  const role = (process.env.SEED_ADMIN_ROLE || "admin").trim();
  const now = knex.fn.now();

  const hashedPassword = await bcrypt.hash(password, 10);

  await knex("users")
    .insert({
      email,
      password: hashedPassword,
      full_name: fullName,
      phone,
      role,
      is_active: 1,
      created_at: now,
      updated_at: now,
    })
    .onConflict("email")
    .merge({
      password: hashedPassword,
      full_name: fullName,
      phone,
      role,
      is_active: 1,
      updated_at: now,
    });
};
