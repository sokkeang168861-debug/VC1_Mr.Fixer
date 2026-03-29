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

async function seedIssueImages(knex, bookingId, labels) {
  await knex("issue_img").where({ booking_id: bookingId }).del();

  for (const label of labels) {
    await knex("issue_img").insert({
      booking_id: bookingId,
      image: Buffer.from(`seed-image-${label}`),
      created_at: knex.fn.now(),
    });
  }
}

async function seedProposalItems(knex, bookingId, items) {
  for (const item of items) {
    await upsertByWhere(knex, "proposal_price", {
      booking_id: bookingId,
      name: item.name,
    }, {
      booking_id: bookingId,
      name: item.name,
      price: item.price,
    });
  }
}

async function seedReceiptItems(knex, bookingId, items) {
  for (const item of items) {
    await upsertByWhere(knex, "receipt", {
      booking_id: bookingId,
      name: item.name,
    }, {
      booking_id: bookingId,
      name: item.name,
      price: item.price,
    });
  }
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
    throw new Error("Default fixer or customer is missing. Run the 01_users.js seed before loading booking flow data.");
  }

  const provider = await knex("service_providers").select("id").where({ user_id: fixerUser.id }).first();
  if (!provider) {
    throw new Error("Default fixer provider is missing. Run the 01_users.js seed before loading booking flow data.");
  }

  const services = await knex("services as s")
    .join("service_categories as sc", "sc.id", "s.category_id")
    .select("s.id", "sc.name")
    .where("s.provider_id", provider.id)
    .whereIn("sc.name", [
      "Electrical Repair",
      "Plumbing",
      "Air Conditioner Repair",
      "Home Painting",
    ]);

  const serviceByCategory = Object.fromEntries(services.map(service => [service.name, service.id]));

  if (
    !serviceByCategory["Electrical Repair"] ||
    !serviceByCategory["Plumbing"] ||
    !serviceByCategory["Air Conditioner Repair"] ||
    !serviceByCategory["Home Painting"]
  ) {
    throw new Error("Expected seeded services are missing. Run the 02_fixer_services.js seed before loading booking flow data.");
  }

  const bookings = [
    {
      key: "complete-electrical",
      serviceId: serviceByCategory["Electrical Repair"],
      serviceAddress: "Street 310, Boeung Keng Kang, Phnom Penh",
      issueDescription: "Wall socket sparks when plugging in appliances. [seed-complete-electrical]",
      urgentLevel: "medium",
      status: "complete",
      serviceFee: 75,
      createdAt: daysAgo(baseDate, 7, 9, 0),
      scheduledAt: daysAgo(baseDate, 6, 14, 0),
      paidAt: daysAgo(baseDate, 6, 16, 15),
      latitude: 11.5418,
      longitude: 104.9212,
      issueImages: ["complete-electrical-1", "complete-electrical-2"],
      proposalItems: [
        { name: "Socket replacement", price: 35 },
        { name: "Wiring safety check", price: 40 },
      ],
      receiptItems: [
        { name: "Socket replacement", price: 35 },
        { name: "Wiring safety check", price: 40 },
      ],
      payment: {
        amount: 75,
        status: "completed",
        transactionId: "MRFIXER-SEED-COMPLETE-0001",
      },
      review: {
        speed_rating: 5,
        quality_rating: 5,
        price_fairness_rating: 4,
        behavior_rating: 5,
        overall_rating: 5,
        comment: "Fast response and clean repair work.",
      },
    },
    {
      key: "complete-plumbing",
      serviceId: serviceByCategory["Plumbing"],
      serviceAddress: "Street 271, Tuol Tumpung, Phnom Penh",
      issueDescription: "Kitchen sink pipe is leaking under the cabinet. [seed-complete-plumbing]",
      urgentLevel: "low",
      status: "complete",
      serviceFee: 58,
      createdAt: daysAgo(baseDate, 5, 10, 0),
      scheduledAt: daysAgo(baseDate, 4, 13, 30),
      paidAt: daysAgo(baseDate, 4, 15, 45),
      latitude: 11.5346,
      longitude: 104.9138,
      issueImages: ["complete-plumbing-1"],
      proposalItems: [
        { name: "Pipe seal replacement", price: 18 },
        { name: "Drain pipe repair", price: 40 },
      ],
      receiptItems: [
        { name: "Pipe seal replacement", price: 18 },
        { name: "Drain pipe repair", price: 40 },
      ],
      payment: {
        amount: 58,
        status: "completed",
        transactionId: "MRFIXER-SEED-COMPLETE-0002",
      },
      review: {
        speed_rating: 4,
        quality_rating: 5,
        price_fairness_rating: 5,
        behavior_rating: 4,
        overall_rating: 5,
        comment: "Solved the leak quickly and explained the fix clearly.",
      },
    },
    {
      key: "customer-reject-ac",
      serviceId: serviceByCategory["Air Conditioner Repair"],
      serviceAddress: "Street 2004, Sen Sok, Phnom Penh",
      issueDescription: "Air conditioner is running but not cooling. [seed-customer-reject-ac]",
      urgentLevel: "high",
      status: "customer_reject",
      serviceFee: 95,
      createdAt: daysAgo(baseDate, 3, 8, 30),
      scheduledAt: daysAgo(baseDate, 2, 15, 0),
      latitude: 11.5852,
      longitude: 104.8834,
      issueImages: ["customer-reject-ac-1"],
      proposalItems: [
        { name: "Gas refill estimate", price: 45 },
        { name: "Compressor diagnosis", price: 50 },
      ],
    },
    {
      key: "pending-painting",
      serviceId: serviceByCategory["Home Painting"],
      serviceAddress: "Street 598, Russey Keo, Phnom Penh",
      issueDescription: "Need bedroom wall repainting after water stains. [seed-pending-painting]",
      urgentLevel: "medium",
      status: "pending",
      serviceFee: null,
      createdAt: daysAgo(baseDate, 1, 11, 15),
      scheduledAt: null,
      latitude: 11.6048,
      longitude: 104.9092,
      issueImages: ["pending-painting-1", "pending-painting-2"],
    },
  ];

  for (const booking of bookings) {
    const bookingId = await upsertByWhere(knex, "bookings", {
      issue_description: booking.issueDescription,
    }, {
      customer_id: customerUser.id,
      service_id: booking.serviceId,
      service_address: booking.serviceAddress,
      issue_description: booking.issueDescription,
      urgent_level: booking.urgentLevel,
      status: booking.status,
      service_fee: booking.serviceFee,
      cancellation_reason: booking.status === "customer_reject" ? "Customer declined the quoted price." : null,
      created_at: booking.createdAt,
      scheduled_at: booking.scheduledAt,
      latitude: booking.latitude,
      longitude: booking.longitude,
    });

    await seedIssueImages(knex, bookingId, booking.issueImages);

    if (booking.proposalItems) {
      await seedProposalItems(knex, bookingId, booking.proposalItems);
    }

    if (booking.receiptItems) {
      await seedReceiptItems(knex, bookingId, booking.receiptItems);
    }

    if (booking.payment) {
      await upsertByWhere(knex, "payments", {
        transaction_id: booking.payment.transactionId,
      }, {
        booking_id: bookingId,
        amount: booking.payment.amount,
        status: booking.payment.status,
        transaction_id: booking.payment.transactionId,
        paid_at: booking.paidAt,
        created_at: booking.paidAt,
      });
    }

    if (booking.review) {
      await upsertByWhere(knex, "reviews", {
        booking_id: bookingId,
      }, {
        booking_id: bookingId,
        speed_rating: booking.review.speed_rating,
        quality_rating: booking.review.quality_rating,
        price_fairness_rating: booking.review.price_fairness_rating,
        behavior_rating: booking.review.behavior_rating,
        overall_rating: booking.review.overall_rating,
        comment: booking.review.comment,
        created_at: knex.fn.now(),
      });
    }
  }
};
