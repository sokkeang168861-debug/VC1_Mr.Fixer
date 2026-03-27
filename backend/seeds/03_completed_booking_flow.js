function toMysqlDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function daysAgo(baseDate, days, hours = 9, minutes = 0) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return toMysqlDateTime(date);
}

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
  const baseDate = new Date();
  const fixerEmail = (process.env.SEED_FIXER_EMAIL || "fixer@mrfixer.com").trim().toLowerCase();
  const customerEmail = (process.env.SEED_CUSTOMER_EMAIL || "customer@mrfixer.com").trim().toLowerCase();

  const fixerUser = await knex("users").select("id").where({ email: fixerEmail }).first();
  const customerUser = await knex("users").select("id").where({ email: customerEmail }).first();

  if (!fixerUser || !customerUser) {
    throw new Error("Default fixer or customer is missing. Run the 01_users.js seed before loading completed booking flow.");
  }

  const provider = await knex("service_providers").select("id").where({ user_id: fixerUser.id }).first();
  if (!provider) {
    throw new Error("Default fixer provider is missing. Run the 01_users.js seed before loading completed booking flow.");
  }

  const serviceCategory = await knex("service_categories")
    .select("id")
    .where({ name: "Electrical Repair" })
    .first();

  if (!serviceCategory) {
    throw new Error("Electrical Repair category is missing. Run the 02_fixer_services.js seed before loading completed booking flow.");
  }

  const service = await knex("services")
    .select("id")
    .where({
      provider_id: provider.id,
      category_id: serviceCategory.id,
    })
    .first();

  if (!service) {
    throw new Error("Default fixer service is missing. Run the 02_fixer_services.js seed before loading completed booking flow.");
  }

  const bookingCreatedAt = daysAgo(baseDate, 6, 9, 0);
  const scheduledAt = daysAgo(baseDate, 5, 14, 0);
  const paidAt = daysAgo(baseDate, 5, 16, 15);

  const bookingId = await upsertByWhere(knex, "bookings", {
    issue_description: "Wall socket sparks when plugging in appliances. [default-completed-flow]",
  }, {
    customer_id: customerUser.id,
    service_id: service.id,
    service_address: "Street 310, Phnom Penh",
    issue_description: "Wall socket sparks when plugging in appliances. [default-completed-flow]",
    urgent_level: "medium",
    status: "complete",
    service_fee: 75,
    cancellation_reason: null,
    created_at: bookingCreatedAt,
    scheduled_at: scheduledAt,
    latitude: 11.5612,
    longitude: 104.9165,
  });

  await upsertByWhere(knex, "payments", {
    transaction_id: "MRFIXER-DEFAULT-FLOW-0001",
  }, {
    booking_id: bookingId,
    amount: 75,
    status: "completed",
    transaction_id: "MRFIXER-DEFAULT-FLOW-0001",
    paid_at: paidAt,
    created_at: paidAt,
  });

  const lineItems = [
    { name: "Socket replacement", price: 35 },
    { name: "Wiring safety check", price: 40 },
  ];

  for (const item of lineItems) {
    await upsertByWhere(knex, "proposal_price", {
      booking_id: bookingId,
      name: item.name,
    }, {
      booking_id: bookingId,
      name: item.name,
      price: item.price,
    });

    await upsertByWhere(knex, "receipt", {
      booking_id: bookingId,
      name: item.name,
    }, {
      booking_id: bookingId,
      name: item.name,
      price: item.price,
    });
  }
};
