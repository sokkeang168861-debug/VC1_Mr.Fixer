const bcrypt = require("bcrypt");

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function seed(knex) {
  const now = knex.fn.now();
  const seedUsers = [
    {
      email: (process.env.SEED_ADMIN_EMAIL || "admin@mrfixer.com").trim().toLowerCase(),
      password: process.env.SEED_ADMIN_PASSWORD || "secret123",
      full_name: (process.env.SEED_ADMIN_FULL_NAME || "Admin User").trim(),
      phone: (process.env.SEED_ADMIN_PHONE || "0812345678").trim(),
      role: (process.env.SEED_ADMIN_ROLE || "admin").trim(),
    },
    {
      email: (process.env.SEED_FIXER_EMAIL || "fixer@mrfixer.com").trim().toLowerCase(),
      password: process.env.SEED_FIXER_PASSWORD || "secret123",
      full_name: (process.env.SEED_FIXER_FULL_NAME || "Fixer User").trim(),
      phone: (process.env.SEED_FIXER_PHONE || "0898765432").trim(),
      role: (process.env.SEED_FIXER_ROLE || "fixer").trim(),
    },
    {
      email: (process.env.SEED_CUSTOMER_EMAIL || "customer@mrfixer.com").trim().toLowerCase(),
      password: process.env.SEED_CUSTOMER_PASSWORD || "secret123",
      full_name: (process.env.SEED_CUSTOMER_FULL_NAME || "Customer User").trim(),
      phone: (process.env.SEED_CUSTOMER_PHONE || "0876543210").trim(),
      role: (process.env.SEED_CUSTOMER_ROLE || "customer").trim(),
    },
  ];

  for (const user of seedUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await knex("users")
      .insert({
        email: user.email,
        password: hashedPassword,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_active: 1,
        created_at: now,
        updated_at: now,
      })
      .onConflict("email")
      .merge({
        password: hashedPassword,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_active: 1,
        updated_at: now,
      });
  }
};
