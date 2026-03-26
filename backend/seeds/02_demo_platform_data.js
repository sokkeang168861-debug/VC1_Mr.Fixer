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
  const now = knex.fn.now();
  const baseDate = new Date();

  await knex.transaction(async (trx) => {
    const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@mrfixer.com")
      .trim()
      .toLowerCase();
    const fixerEmail = (process.env.SEED_FIXER_EMAIL || "fixer@mrfixer.com")
      .trim()
      .toLowerCase();
    const customerEmail = (process.env.SEED_CUSTOMER_EMAIL || "customer@mrfixer.com")
      .trim()
      .toLowerCase();

    const adminUser = await trx("users").select("id").where({ email: adminEmail }).first();
    const fixerUser = await trx("users").select("id").where({ email: fixerEmail }).first();
    const customerUser = await trx("users").select("id").where({ email: customerEmail }).first();

    if (!adminUser || !fixerUser || !customerUser) {
      throw new Error(
        "Seed users are missing. Run the 01_users.js seed before loading demo platform data."
      );
    }

    const electricalCategoryId = await upsertByWhere(
      trx,
      "service_categories",
      { name: "Electrical Repair" },
      {
        name: "Electrical Repair",
        description: "Repair wiring, breakers, outlets, fans, and lighting issues.",
        is_active: 1,
        created_at: now,
      }
    );

    const plumbingCategoryId = await upsertByWhere(
      trx,
      "service_categories",
      { name: "Plumbing" },
      {
        name: "Plumbing",
        description: "Handle leaks, drainage problems, pipe repairs, and fixture installs.",
        is_active: 1,
        created_at: now,
      }
    );

    const providerId = await upsertByWhere(
      trx,
      "service_providers",
      { user_id: fixerUser.id },
      {
        user_id: fixerUser.id,
        company_name: "FixFast Home Services",
        bio: "Certified home repair specialist with fast response times.",
        location: "Phnom Penh",
        experience: 6,
        speed_rating: 4.8,
        quality_rating: 4.9,
        price_fairness_rating: 4.6,
        behavior_rating: 4.9,
        overall_rating: 4.8,
        is_verified: 1,
        is_actice: 1,
        latitude: 11.5564,
        longitude: 104.9282,
        created_at: now,
      }
    );

    const electricalServiceId = await upsertByWhere(
      trx,
      "services",
      {
        provider_id: providerId,
        category_id: electricalCategoryId,
      },
      {
        provider_id: providerId,
        category_id: electricalCategoryId,
        is_active: 1,
        created_at: now,
        updated_at: now,
      }
    );

    await upsertByWhere(
      trx,
      "services",
      {
        provider_id: providerId,
        category_id: plumbingCategoryId,
      },
      {
        provider_id: providerId,
        category_id: plumbingCategoryId,
        is_active: 1,
        created_at: now,
        updated_at: now,
      }
    );

    const demoBookings = [
      {
        issue_description: "Living room circuit breaker trips whenever the air conditioner starts. [demo]",
        service_address: "Street 271, Phnom Penh",
        urgent_level: "high",
        status: "complete",
        service_fee: 85,
        created_at: daysAgo(baseDate, 20, 8, 30),
        scheduled_at: daysAgo(baseDate, 19, 9, 0),
        latitude: 11.5449,
        longitude: 104.8922,
        proposal_items: [
          { name: "Circuit breaker replacement", price: 45 },
          { name: "Electrical safety inspection", price: 40 },
        ],
        receipt_items: [
          { name: "Circuit breaker replacement", price: 45 },
          { name: "Electrical safety inspection", price: 40 },
        ],
        review: {
          speed_rating: 5,
          quality_rating: 5,
          price_fairness_rating: 4,
          behavior_rating: 5,
          overall_rating: 5,
          comment: "Fast repair and clear explanation of the breaker issue.",
        },
        issue_image_label: "demo-issue-breaker-photo",
        payments: [
          {
            amount: 85,
            payment_method: "card",
            status: "paid",
            transaction_id: "MRFIXER-DEMO-TXN-10001",
            paid_at: daysAgo(baseDate, 19, 11, 15),
          },
        ],
      },
      {
        issue_description: "Kitchen power outlets stopped working after a storm. [demo]",
        service_address: "Street 63, Phnom Penh",
        urgent_level: "medium",
        status: "complete",
        service_fee: 120,
        created_at: daysAgo(baseDate, 9, 10, 0),
        scheduled_at: daysAgo(baseDate, 8, 14, 0),
        latitude: 11.5621,
        longitude: 104.9175,
        proposal_items: [
          { name: "Outlet rewiring", price: 75 },
          { name: "Socket replacement", price: 45 },
        ],
        receipt_items: [
          { name: "Outlet rewiring", price: 75 },
          { name: "Socket replacement", price: 45 },
        ],
        review: {
          speed_rating: 4,
          quality_rating: 5,
          price_fairness_rating: 5,
          behavior_rating: 5,
          overall_rating: 5,
          comment: "The kitchen outlets work perfectly again after the repair.",
        },
        issue_image_label: "demo-issue-kitchen-outlet-photo",
        payments: [
          {
            amount: 70,
            payment_method: "aba_pay",
            status: "paid",
            transaction_id: "MRFIXER-DEMO-TXN-10002A",
            paid_at: daysAgo(baseDate, 8, 15, 20),
          },
          {
            amount: 50,
            payment_method: "aba_pay",
            status: "paid",
            transaction_id: "MRFIXER-DEMO-TXN-10002B",
            paid_at: daysAgo(baseDate, 8, 15, 30),
          },
        ],
      },
      {
        issue_description: "Bedroom ceiling fan makes noise and runs at low speed. [demo]",
        service_address: "Russian Boulevard, Phnom Penh",
        urgent_level: "low",
        status: "complete",
        service_fee: 60,
        created_at: daysAgo(baseDate, 3, 9, 15),
        scheduled_at: daysAgo(baseDate, 2, 13, 0),
        latitude: 11.5687,
        longitude: 104.8481,
        proposal_items: [
          { name: "Ceiling fan balancing", price: 25 },
          { name: "Capacitor replacement", price: 35 },
        ],
        receipt_items: [
          { name: "Ceiling fan balancing", price: 25 },
          { name: "Capacitor replacement", price: 35 },
        ],
        review: {
          speed_rating: 4,
          quality_rating: 4,
          price_fairness_rating: 4,
          behavior_rating: 5,
          overall_rating: 4,
          comment: "Quiet fan now and the fixer arrived on time.",
        },
        issue_image_label: "demo-issue-ceiling-fan-photo",
        payments: [
          {
            amount: 60,
            payment_method: "cash",
            status: "completed",
            transaction_id: "MRFIXER-DEMO-TXN-10003",
            paid_at: daysAgo(baseDate, 2, 14, 45),
          },
        ],
      },
      {
        issue_description: "Bathroom light flickers and needs a new switch. [demo]",
        service_address: "Street 2004, Phnom Penh",
        urgent_level: "medium",
        status: "pending",
        service_fee: 40,
        created_at: daysAgo(baseDate, 1, 16, 0),
        scheduled_at: daysAgo(baseDate, 0, 9, 30),
        latitude: 11.5731,
        longitude: 104.8446,
        proposal_items: [
          { name: "Light switch replacement", price: 15 },
          { name: "Wiring check", price: 25 },
        ],
        receipt_items: [],
        review: null,
        issue_image_label: "demo-issue-flickering-switch-photo",
        payments: [],
      },
    ];

    for (const booking of demoBookings) {
      const bookingId = await upsertByWhere(
        trx,
        "bookings",
        { issue_description: booking.issue_description },
        {
          customer_id: customerUser.id,
          service_id: electricalServiceId,
          service_address: booking.service_address,
          issue_description: booking.issue_description,
          urgent_level: booking.urgent_level,
          status: booking.status,
          service_fee: booking.service_fee,
          cancellation_reason: null,
          created_at: booking.created_at,
          scheduled_at: booking.scheduled_at,
          latitude: booking.latitude,
          longitude: booking.longitude,
        }
      );

      for (const payment of booking.payments) {
        await upsertByWhere(
          trx,
          "payments",
          { transaction_id: payment.transaction_id },
          {
            booking_id: bookingId,
            amount: payment.amount,
            payment_method: payment.payment_method,
            status: payment.status,
            transaction_id: payment.transaction_id,
            paid_at: payment.paid_at,
            created_at: payment.paid_at,
          }
        );
      }

      for (const item of booking.proposal_items) {
        await upsertByWhere(
          trx,
          "proposal_price",
          { booking_id: bookingId, name: item.name },
          {
            booking_id: bookingId,
            name: item.name,
            price: item.price,
          }
        );
      }

      for (const item of booking.receipt_items) {
        await upsertByWhere(
          trx,
          "receipt",
          { booking_id: bookingId, name: item.name },
          {
            booking_id: bookingId,
            name: item.name,
            price: item.price,
          }
        );
      }

      await upsertByWhere(
        trx,
        "issue_img",
        { booking_id: bookingId },
        {
          booking_id: bookingId,
          image: Buffer.from(booking.issue_image_label, "utf8"),
          created_at: booking.created_at,
        }
      );

      if (booking.review) {
        await upsertByWhere(
          trx,
          "reviews",
          { booking_id: bookingId },
          {
            booking_id: bookingId,
            speed_rating: booking.review.speed_rating,
            quality_rating: booking.review.quality_rating,
            price_fairness_rating: booking.review.price_fairness_rating,
            behavior_rating: booking.review.behavior_rating,
            overall_rating: booking.review.overall_rating,
            comment: booking.review.comment,
            created_at: booking.created_at,
          }
        );
      }
    }
  });
};
