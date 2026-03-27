const bcrypt = require("bcrypt");

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

async function getOrCreateCategory(knex, name, description) {
  const existingCategory = await knex("service_categories")
    .select("id")
    .where({ name })
    .orderBy("id", "asc")
    .first();

  if (existingCategory) {
    return existingCategory.id;
  }

  const insertedIds = await knex("service_categories").insert({
    name,
    description,
    is_active: 1,
    created_at: knex.fn.now(),
  });

  return insertedIds[0];
}

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function seed(knex) {
  const baseDate = new Date();
  const hashedPassword = await bcrypt.hash("secret123", 10);

  await knex.transaction(async (trx) => {
    const [customer] = await trx("users")
      .select("id")
      .whereRaw("LOWER(role) = 'customer'")
      .orderBy("id", "asc")
      .limit(1);

    if (!customer) {
      throw new Error("A customer user is required before seeding demo fixer data.");
    }

    const categoryIds = {
      plumbing: await getOrCreateCategory(
        trx,
        "Plumbing",
        "Pipe repair, leak fixes, and water system maintenance."
      ),
      electrical: await getOrCreateCategory(
        trx,
        "Electrical",
        "Electrical troubleshooting, outlet replacement, and wiring updates."
      ),
      carRepair: await getOrCreateCategory(
        trx,
        "Car Repair",
        "General diagnostics, battery issues, and minor automotive repair."
      ),
      appliances: await getOrCreateCategory(
        trx,
        "Home Appliances",
        "Repair and maintenance for fans, washing machines, and kitchen appliances."
      ),
      airConditioner: await getOrCreateCategory(
        trx,
        "Air Conditioner",
        "AC cleaning, gas refill, and cooling performance repair."
      ),
    };

    const fixers = [
      {
        user: {
          full_name: "Dara Sok",
          email: "dara.fixer@mrfixer.com",
          phone: "0961002001",
        },
        provider: {
          company_name: "Dara Electrical Solutions",
          bio: "Electrical and AC technician with fast on-site service.",
          location: "Tuol Kork, Phnom Penh",
          experience: 7,
          speed_rating: 4.8,
          quality_rating: 4.9,
          price_fairness_rating: 4.6,
          behavior_rating: 4.9,
          overall_rating: 4.8,
          latitude: 11.57300000,
          longitude: 104.88900000,
        },
        categoryKeys: ["electrical", "airConditioner"],
        bookings: [
          {
            issue_description: "AC not cooling properly in office room. [fixer-demo-dara]",
            service_address: "Street 315, Tuol Kork, Phnom Penh",
            urgent_level: "medium",
            status: "complete",
            service_fee: 95,
            created_at: daysAgo(baseDate, 12, 8, 45),
            scheduled_at: daysAgo(baseDate, 11, 14, 0),
            latitude: 11.57560000,
            longitude: 104.89140000,
             payment: {
               amount: 95,
               status: "paid",
               transaction_id: "MRFIXER-DARA-0001",
               paid_at: daysAgo(baseDate, 11, 16, 0),
             },
            review: {
              speed_rating: 5,
              quality_rating: 5,
              price_fairness_rating: 4,
              behavior_rating: 5,
              overall_rating: 5,
              comment: "Very clean AC service and cooling improved immediately.",
            },
          },
        ],
      },
      {
        user: {
          full_name: "Lina Chan",
          email: "lina.fixer@mrfixer.com",
          phone: "0961002002",
        },
        provider: {
          company_name: "Lina Plumbing Care",
          bio: "Reliable plumbing specialist for homes and apartments.",
          location: "Sen Sok, Phnom Penh",
          experience: 5,
          speed_rating: 4.7,
          quality_rating: 4.8,
          price_fairness_rating: 4.7,
          behavior_rating: 4.9,
          overall_rating: 4.8,
          latitude: 11.58930000,
          longitude: 104.87960000,
        },
        categoryKeys: ["plumbing", "appliances"],
        bookings: [
          {
            issue_description: "Kitchen sink leaking underneath. [fixer-demo-lina]",
            service_address: "Street 1011, Sen Sok, Phnom Penh",
            urgent_level: "high",
            status: "complete",
            service_fee: 70,
            created_at: daysAgo(baseDate, 8, 9, 20),
            scheduled_at: daysAgo(baseDate, 7, 13, 30),
            latitude: 11.59110000,
            longitude: 104.88100000,
             payment: {
               amount: 70,
               status: "paid",
               transaction_id: "MRFIXER-LINA-0001",
               paid_at: daysAgo(baseDate, 7, 15, 10),
             },
            review: {
              speed_rating: 4,
              quality_rating: 5,
              price_fairness_rating: 5,
              behavior_rating: 5,
              overall_rating: 5,
              comment: "Leak fixed well and the area was left clean afterward.",
            },
          },
        ],
      },
      {
        user: {
          full_name: "Vanna Touch",
          email: "vanna.fixer@mrfixer.com",
          phone: "0961002003",
        },
        provider: {
          company_name: "Vanna Auto & Electrical",
          bio: "Multi-skill fixer for car battery, starter, and electrical diagnostics.",
          location: "Russey Keo, Phnom Penh",
          experience: 9,
          speed_rating: 4.6,
          quality_rating: 4.7,
          price_fairness_rating: 4.5,
          behavior_rating: 4.8,
          overall_rating: 4.7,
          latitude: 11.60690000,
          longitude: 104.90780000,
        },
        categoryKeys: ["carRepair", "electrical"],
        bookings: [
          {
            issue_description: "Car battery drains overnight and engine will not start. [fixer-demo-vanna]",
            service_address: "Street 598, Russey Keo, Phnom Penh",
            urgent_level: "medium",
            status: "complete",
            service_fee: 110,
            created_at: daysAgo(baseDate, 5, 10, 15),
            scheduled_at: daysAgo(baseDate, 4, 15, 0),
            latitude: 11.60810000,
            longitude: 104.90940000,
             payment: {
               amount: 110,
               status: "completed",
               transaction_id: "MRFIXER-VANNA-0001",
               paid_at: daysAgo(baseDate, 4, 17, 20),
             },
            review: {
              speed_rating: 4,
              quality_rating: 4,
              price_fairness_rating: 4,
              behavior_rating: 5,
              overall_rating: 4,
              comment: "Battery issue diagnosed correctly and the car started again.",
            },
          },
        ],
      },
    ];

    for (const fixer of fixers) {
      const userId = await upsertByWhere(
        trx,
        "users",
        { email: fixer.user.email },
        {
          email: fixer.user.email,
          password: hashedPassword,
          full_name: fixer.user.full_name,
          phone: fixer.user.phone,
          role: "fixer",
          is_active: 1,
          email_notifications: 1,
          push_notifications: 1,
          sms_notifications: 0,
          updated_at: trx.fn.now(),
        }
      );

      const providerId = await upsertByWhere(
        trx,
        "service_providers",
        { user_id: userId },
        {
          user_id: userId,
          company_name: fixer.provider.company_name,
          bio: fixer.provider.bio,
          location: fixer.provider.location,
          experience: fixer.provider.experience,
          speed_rating: fixer.provider.speed_rating,
          quality_rating: fixer.provider.quality_rating,
           price_fairness_rating: fixer.provider.price_fairness_rating,
           behavior_rating: fixer.provider.behavior_rating,
           overall_rating: fixer.provider.overall_rating,
           is_verified: 1,
           is_active: 1,
           latitude: fixer.provider.latitude,
           longitude: fixer.provider.longitude,
         }
       );

      for (const categoryKey of fixer.categoryKeys) {
        const categoryId = categoryIds[categoryKey];
        await upsertByWhere(
          trx,
          "services",
          { provider_id: providerId, category_id: categoryId },
          {
            provider_id: providerId,
            category_id: categoryId,
            is_active: 1,
            created_at: trx.fn.now(),
            updated_at: trx.fn.now(),
          }
        );
      }

      const [primaryService] = await trx("services")
        .select("id")
        .where({ provider_id: providerId })
        .orderBy("id", "asc")
        .limit(1);

      if (!primaryService) {
        continue;
      }

      for (const booking of fixer.bookings) {
        const bookingId = await upsertByWhere(
          trx,
          "bookings",
          { issue_description: booking.issue_description },
          {
            customer_id: customer.id,
            service_id: primaryService.id,
            service_address: booking.service_address,
            issue_description: booking.issue_description,
            urgent_level: booking.urgent_level,
            status: booking.status,
            service_fee: booking.service_fee,
            created_at: booking.created_at,
            scheduled_at: booking.scheduled_at,
            latitude: booking.latitude,
            longitude: booking.longitude,
          }
        );

        await upsertByWhere(
          trx,
          "payments",
          { transaction_id: booking.payment.transaction_id },
          {
            booking_id: bookingId,
            amount: booking.payment.amount,
            status: booking.payment.status,
            transaction_id: booking.payment.transaction_id,
            paid_at: booking.payment.paid_at,
            created_at: booking.payment.paid_at,
          }
        );

        await upsertByWhere(
          trx,
          "issue_img",
          { booking_id: bookingId },
          {
            booking_id: bookingId,
            image: Buffer.from(`fixer-demo-${providerId}`, "utf8"),
            created_at: booking.created_at,
          }
        );

        await upsertByWhere(
          trx,
          "proposal_price",
          { booking_id: bookingId, name: "Service Charge" },
          {
            booking_id: bookingId,
            name: "Service Charge",
            price: booking.service_fee,
          }
        );

        await upsertByWhere(
          trx,
          "receipt",
          { booking_id: bookingId, name: "Service Charge" },
          {
            booking_id: bookingId,
            name: "Service Charge",
            price: booking.service_fee,
          }
        );

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
            created_at: booking.payment.paid_at,
          }
        );
      }
    }
  });
};
