const bcrypt = require("bcrypt");

async function upsertByWhere(knex, tableName, whereClause, data) {
  const existingRow = await knex(tableName).select("id").where(whereClause).first();

  if (existingRow) {
    await knex(tableName).where({ id: existingRow.id }).update(data);
    return existingRow.id;
  }

  const insertedIds = await knex(tableName).insert(data);
  return insertedIds[0];
}

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
      provider: {
        company_name: (process.env.SEED_FIXER_COMPANY_NAME || "FixFast Home Services").trim(),
        bio: (process.env.SEED_FIXER_BIO || "Certified home repair specialist with fast response times.").trim(),
        location: (process.env.SEED_FIXER_LOCATION || "Phnom Penh").trim(),
        experience: Number.parseInt(process.env.SEED_FIXER_EXPERIENCE || "6", 10),
        speed_rating: 0,
        quality_rating: 0,
        price_fairness_rating: 0,
        behavior_rating: 0,
        overall_rating: 0,
        latitude: 11.5564,
        longitude: 104.9282,
      },
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

    if (user.role.toLowerCase() !== "fixer" || !user.provider) {
      continue;
    }

    const fixerUser = await knex("users").select("id").where({ email: user.email }).first();
    if (!fixerUser) {
      continue;
    }

    await upsertByWhere(knex, "service_providers", { user_id: fixerUser.id }, {
      user_id: fixerUser.id,
      company_name: user.provider.company_name,
      bio: user.provider.bio,
      location: user.provider.location,
      experience: Number.isNaN(user.provider.experience) ? null : user.provider.experience,
      speed_rating: user.provider.speed_rating,
      quality_rating: user.provider.quality_rating,
      price_fairness_rating: user.provider.price_fairness_rating,
      behavior_rating: user.provider.behavior_rating,
      overall_rating: user.provider.overall_rating,
      is_verified: 1,
      is_active: 1,
      latitude: user.provider.latitude,
      longitude: user.provider.longitude,
      created_at: now,
    });
  }
};
