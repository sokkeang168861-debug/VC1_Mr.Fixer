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
  const fixerProviders = await knex("service_providers as sp")
    .join("users as u", "u.id", "sp.user_id")
    .select("sp.id")
    .where("u.role", "fixer");

  if (fixerProviders.length === 0) {
    throw new Error("No fixer providers found. Run the 01_users.js seed before loading fixer services.");
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
    {
      name: "Air Conditioner Repair",
      description: "Service air conditioners, clean units, fix cooling issues, and replace parts.",
    },
    {
      name: "Home Painting",
      description: "Handle interior and exterior painting, touch-ups, and wall preparation work.",
    },
  ];

  for (const service of services) {
    const categoryId = await upsertByWhere(knex, "service_categories", { name: service.name }, {
      name: service.name,
      description: service.description,
      is_active: 1,
      created_at: now,
    });

    for (const provider of fixerProviders) {
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
  }
};
