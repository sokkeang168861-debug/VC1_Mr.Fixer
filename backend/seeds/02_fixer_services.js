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
  const fixerEmail = (process.env.SEED_FIXER_EMAIL || "fixer@mrfixer.com").trim().toLowerCase();
  const fixerUser = await knex("users").select("id").where({ email: fixerEmail }).first();

  if (!fixerUser) {
    throw new Error("Default fixer user is missing. Run the 01_users.js seed before loading fixer services.");
  }

  const provider = await knex("service_providers").select("id").where({ user_id: fixerUser.id }).first();
  if (!provider) {
    throw new Error("Default fixer provider is missing. Run the 01_users.js seed before loading fixer services.");
  }

  const services = [
    {
      name: "Electrical Repair",
      description: "Repair wiring, breakers, outlets, fans, and lighting issues.",
    },
    {
      name: "Plumbing",
      description: "Handle leaks, drainage problems, pipe repairs, and fixture installs.",
    },
  ];

  for (const service of services) {
    const categoryId = await upsertByWhere(knex, "service_categories", { name: service.name }, {
      name: service.name,
      description: service.description,
      is_active: 1,
      created_at: now,
    });

    await upsertByWhere(knex, "services", {
      provider_id: provider.id,
      category_id: categoryId,
    }, {
      provider_id: provider.id,
      category_id: categoryId,
      is_active: 1,
      created_at: now,
      updated_at: now,
    });
  }
};
