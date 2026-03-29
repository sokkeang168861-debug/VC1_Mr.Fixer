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
      email: (process.env.SEED_FIXER_EMAIL || "keang@mrfixer.com").trim().toLowerCase(),
      password: process.env.SEED_FIXER_PASSWORD || "secret123",
      full_name: (process.env.SEED_FIXER_FULL_NAME || "Fixer Keang").trim(),
      phone: (process.env.SEED_FIXER_PHONE || "0898765432").trim(),
      role: (process.env.SEED_FIXER_ROLE || "fixer").trim(),
      provider: {
        company_name: (process.env.SEED_FIXER_COMPANY_NAME || "FixFast Home Services").trim(),
        bio: (process.env.SEED_FIXER_BIO || "Certified home repair specialist with fast response times.").trim(),
        location: (process.env.SEED_FIXER_LOCATION || "Street 289, Tuol Kork, Phnom Penh").trim(),
        experience: Number.parseInt(process.env.SEED_FIXER_EXPERIENCE || "6", 10),
        speed_rating: null,
        quality_rating: null,
        price_fairness_rating: null,
        behavior_rating: null,
        overall_rating: null,
        latitude: 11.5731,
        longitude: 104.8948,
      },
    },
    {
      email: "chanthea@mrfixer.com",
      password: "secret123",
      full_name: "Fixer Chanthea",
      phone: "0898765433",
      role: "fixer",
      provider: {
        company_name: "BKK Quick Repair",
        bio: "Apartment and condo maintenance specialist serving central Phnom Penh.",
        location: "Street 63, BKK1, Phnom Penh",
        experience: 5,
        speed_rating: null,
        quality_rating: null,
        price_fairness_rating: null,
        behavior_rating: null,
        overall_rating: null,
        latitude: 11.5489,
        longitude: 104.9214,
      },
    },
    {
      email: "phalla@mrfixer.com",
      password: "secret123",
      full_name: "Fixer Phalla",
      phone: "0898765434",
      role: "fixer",
      provider: {
        company_name: "Sen Sok Service Team",
        bio: "Trusted for household repairs, installations, and urgent call-outs in Sen Sok.",
        location: "Street 2004, Sen Sok, Phnom Penh",
        experience: 7,
        speed_rating: null,
        quality_rating: null,
        price_fairness_rating: null,
        behavior_rating: null,
        overall_rating: null,
        latitude: 11.5857,
        longitude: 104.8852,
      },
    },
    {
      email: "darineil@mrfixer.com",
      password: "secret123",
      full_name: "Fixer Darineil",
      phone: "0898765435",
      role: "fixer",
      provider: {
        company_name: "Chbar Ampov Fix Pros",
        bio: "Experienced with electrical and plumbing jobs across eastern Phnom Penh.",
        location: "National Road 1, Chbar Ampov, Phnom Penh",
        experience: 4,
        speed_rating: null,
        quality_rating: null,
        price_fairness_rating: null,
        behavior_rating: null,
        overall_rating: null,
        latitude: 11.5191,
        longitude: 104.9578,
      },
    },
    {
      email: "chhanut@mrfixer.com",
      password: "secret123",
      full_name: "Fixer Chhanut",
      phone: "0898765436",
      role: "fixer",
      provider: {
        company_name: "Russey Keo Home Care",
        bio: "Reliable neighborhood fixer for maintenance, diagnostics, and follow-up visits.",
        location: "Street 598, Russey Keo, Phnom Penh",
        experience: 8,
        speed_rating: null,
        quality_rating: null,
        price_fairness_rating: null,
        behavior_rating: null,
        overall_rating: null,
        latitude: 11.6042,
        longitude: 104.9096,
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
